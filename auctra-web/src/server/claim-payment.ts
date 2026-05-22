import { supabase } from '@/server/supabase';
import { PrivyClient } from '@privy-io/server-auth';
import { ethers } from 'ethers';
import { createPublicClient, getAddress, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export const CHAIN_ID = 84532;
export const PAYMENT_COIN = 'TYI_MOCK_USD';
export const PAYMENT_TOKEN_DECIMALS = 6;
export const PAYMENT_TOKEN_ADDRESS =
  (process.env.NEXT_PUBLIC_TYI_MOCK_USD || '0x27DC1C167AeF232bb1e21073304B526726a8727e') as `0x${string}`;
export const PLATFORM_FEE_BPS = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS || '200');
export const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS || '';
export const SETTLEMENT_CONTRACT =
  (process.env.NEXT_PUBLIC_SETTLEMENT_CONTRACT || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export const WINNER_TAG = ethers.keccak256(ethers.toUtf8Bytes('AUCTRA_WINNER_V1'));
type WalletAddress = `0x${string}`;

const privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID || '', process.env.PRIVY_APP_SECRET || '');

const settlementAuctionAbi = [
  {
    type: 'function',
    name: 'auctions',
    stateMutability: 'view',
    inputs: [{ name: 'auctionId', type: 'uint256' }],
    outputs: [
      { name: 'seller', type: 'address' },
      { name: 'endTime', type: 'uint64' },
      { name: 'claimDeadline', type: 'uint64' },
      { name: 'settled', type: 'bool' },
      { name: 'cancelled', type: 'bool' },
      { name: 'exists', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'configureAuction',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'auctionId', type: 'uint256' },
      { name: 'seller', type: 'address' },
      { name: 'endTime', type: 'uint64' },
    ],
    outputs: [],
  },
] as const;

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

function normalizeWalletAddress(address?: string | null): WalletAddress | null {
  if (!address) return null;

  try {
    return getAddress(address);
  } catch {
    return null;
  }
}

function extractPrivyWalletAddresses(privyUser: Awaited<ReturnType<typeof privy.getUser>>) {
  const linkedAccountWallets = (privyUser.linkedAccounts || [])
    .map((account) => {
      if (account.type !== 'wallet' || !('address' in account) || typeof account.address !== 'string') {
        return null;
      }
      return normalizeWalletAddress(account.address);
    })
    .filter((address): address is WalletAddress => typeof address === 'string' && address.length > 0);

  return [normalizeWalletAddress(privyUser.wallet?.address), ...linkedAccountWallets].filter(
    (address): address is WalletAddress => typeof address === 'string' && address.length > 0
  );
}

export function decimalToTokenUnits(value: string | number) {
  const [whole, fraction = ''] = String(value).trim().split('.');
  const normalizedFraction = fraction.padEnd(PAYMENT_TOKEN_DECIMALS, '0').slice(0, PAYMENT_TOKEN_DECIMALS);
  return ethers.parseUnits(`${whole || '0'}.${normalizedFraction}`, PAYMENT_TOKEN_DECIMALS);
}

export function splitPayment(finalPriceUnits: bigint) {
  const feeAmountUnits = (finalPriceUnits * BigInt(PLATFORM_FEE_BPS)) / BigInt(10_000);
  return {
    feeAmountUnits,
    sellerAmountUnits: finalPriceUnits - feeAmountUnits,
  };
}

export function auctionIdToUint256(auctionId: string) {
  return BigInt(ethers.keccak256(ethers.toUtf8Bytes(auctionId)));
}

export async function loadClaimContext(auctionId: string, walletAddress: string) {
  const normalizedWallet = getAddress(walletAddress);
  const { data: auction, error: auctionError } = await supabase
    .from('auctions')
    .select('*, claims(*)')
    .eq('id', auctionId)
    .single();

  if (auctionError || !auction) {
    throw new ClaimFlowError('Auction not found', 404);
  }

  if (new Date(auction.ends_at).getTime() > Date.now()) {
    throw new ClaimFlowError('Auction has not ended yet', 403);
  }

  const rawClaims = auction.claims;
  const normalizedClaims: Array<{ id?: string; claim_status: string }> = Array.isArray(rawClaims)
    ? rawClaims
    : rawClaims
      ? [rawClaims]
      : [];
  auction.claims = normalizedClaims;

  if (normalizedClaims.some((claim) => ['paid', 'minted'].includes(claim.claim_status))) {
    throw new ClaimFlowError('Auction already claimed', 403);
  }

  const { data: highestBidderProfile } = await supabase
    .from('profiles')
    .select('privy_user_id')
    .eq('id', auction.highest_bidder)
    .single();

  if (!highestBidderProfile) {
    throw new ClaimFlowError('Highest bidder profile not found', 404);
  }

  const privyUser = await privy.getUser(highestBidderProfile.privy_user_id);
  const linkedWallets = extractPrivyWalletAddresses(privyUser);

  const isWalletLinked = linkedWallets.some((address) => address === normalizedWallet);
  if (!isWalletLinked) {
    throw new ClaimFlowError(`Not the highest bidder. Wallet ${normalizedWallet} is not linked to the winning account.`, 403);
  }

  const sellerWalletAddress = await resolveSellerWalletAddress(auction.seller_id);

  if (!sellerWalletAddress) {
    throw new ClaimFlowError('Seller payout wallet is not configured', 409);
  }

  const treasuryWallet = TREASURY_ADDRESS || sellerWalletAddress;
  const finalPriceUnits = decimalToTokenUnits(auction.current_price);
  const { sellerAmountUnits, feeAmountUnits } = splitPayment(finalPriceUnits);
  const auctionIdInt = auctionIdToUint256(auctionId);

  await assertAuctionReadyOnChain(auctionIdInt, sellerWalletAddress, auction.ends_at);

  return {
    auction,
    claimant: normalizedWallet,
    sellerWallet: sellerWalletAddress,
    treasuryWallet: getAddress(treasuryWallet),
    finalPriceUnits,
    sellerAmountUnits,
    feeAmountUnits,
    auctionIdInt,
  };
}

async function resolveSellerWalletAddress(sellerId: string) {
  const { data: primaryWallet } = await supabase
    .from('user_wallets')
    .select('wallet_address')
    .eq('user_id', sellerId)
    .eq('is_primary', true)
    .maybeSingle();

  const normalizedPrimaryWallet = normalizeWalletAddress(primaryWallet?.wallet_address);
  if (normalizedPrimaryWallet) return normalizedPrimaryWallet;

  const { data: existingWallet } = await supabase
    .from('user_wallets')
    .select('wallet_address')
    .eq('user_id', sellerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const normalizedExistingWallet = normalizeWalletAddress(existingWallet?.wallet_address);
  if (normalizedExistingWallet) {
    await markSellerWalletPrimary(sellerId, normalizedExistingWallet);
    return normalizedExistingWallet;
  }

  const { data: sellerProfile } = await supabase
    .from('profiles')
    .select('privy_user_id')
    .eq('id', sellerId)
    .maybeSingle();

  if (!sellerProfile?.privy_user_id) return null;

  const privySeller = await privy.getUser(sellerProfile.privy_user_id);
  const [privyWalletAddress] = extractPrivyWalletAddresses(privySeller);
  if (!privyWalletAddress) return null;

  await markSellerWalletPrimary(sellerId, privyWalletAddress);
  return privyWalletAddress;
}

async function markSellerWalletPrimary(sellerId: string, walletAddress: string) {
  const walletAddressLower = walletAddress.toLowerCase();

  await supabase
    .from('user_wallets')
    .update({ is_primary: false })
    .eq('user_id', sellerId)
    .neq('wallet_address', walletAddressLower);

  await supabase.from('user_wallets').upsert(
    {
      user_id: sellerId,
      wallet_address: walletAddressLower,
      wallet_type: 'evm',
      is_primary: true,
    },
    { onConflict: 'wallet_address' }
  );
}

async function assertAuctionReadyOnChain(auctionIdInt: bigint, sellerWallet: string, endsAtIso: string) {
  if (SETTLEMENT_CONTRACT === '0x0000000000000000000000000000000000000000') {
    throw new ClaimFlowError('Settlement contract is not configured', 500);
  }

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  let [, , claimDeadline, settled, cancelled, exists] = await publicClient.readContract({
    address: SETTLEMENT_CONTRACT,
    abi: settlementAuctionAbi,
    functionName: 'auctions',
    args: [auctionIdInt],
  });

  if (!exists) {
    await lazyConfigureAuction(auctionIdInt, sellerWallet, endsAtIso);
    [, , claimDeadline, settled, cancelled, exists] = await publicClient.readContract({
      address: SETTLEMENT_CONTRACT,
      abi: settlementAuctionAbi,
      functionName: 'auctions',
      args: [auctionIdInt],
    });
  }

  if (!exists) {
    throw new ClaimFlowError('Auction is not configured on-chain yet. Please ask the seller/admin to finalize settlement setup.', 409);
  }
  if (cancelled) {
    throw new ClaimFlowError('Auction settlement was cancelled on-chain', 409);
  }
  if (settled) {
    throw new ClaimFlowError('Auction is already settled on-chain', 409);
  }
  if (BigInt(Math.floor(Date.now() / 1000)) > claimDeadline) {
    throw new ClaimFlowError('Winner claim window has expired', 409);
  }
}

async function lazyConfigureAuction(auctionIdInt: bigint, sellerWallet: string, endsAtIso: string) {
  const ownerKey = process.env.PRIVATE_KEY;
  if (!ownerKey) {
    throw new ClaimFlowError('Settlement owner key not configured (PRIVATE_KEY missing)', 500);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const endsAtSec = Math.floor(new Date(endsAtIso).getTime() / 1000);
  const endTime = BigInt(Math.max(endsAtSec, nowSec));

  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  const wallet = new ethers.Wallet(ownerKey, provider);
  const contract = new ethers.Contract(
    SETTLEMENT_CONTRACT,
    [
      'function configureAuction(uint256 auctionId, address seller, uint64 endTime) external',
      'function auctions(uint256) view returns (address,uint64,uint64,bool,bool,bool)',
    ],
    wallet
  );

  try {
    const tx = await contract.configureAuction(auctionIdInt, getAddress(sellerWallet), endTime);
    await tx.wait();
  } catch (err) {
    console.error('lazyConfigureAuction failed:', err);
    throw new ClaimFlowError('Failed to configure auction on-chain', 500);
  }
}

export class ClaimFlowError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
