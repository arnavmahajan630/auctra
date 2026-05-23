import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';
import { ethers } from 'ethers';
import {
  CHAIN_ID,
  PAYMENT_TOKEN_ADDRESS,
  PLATFORM_FEE_BPS,
  ClaimFlowError,
  WINNER_TAG,
  SETTLEMENT_CONTRACT,
  loadClaimContext,
  splitPayment,
} from '@/server/claim-payment';

const BACKEND_PRIVATE_KEY =
  process.env.BACKEND_SIGNER_PRIVATE_KEY ||
  '0x0000000000000000000000000000000000000000000000000000000000000001';

export async function POST(req: Request) {
  try {
    const { auctionId, walletAddress } = await req.json();

    if (!auctionId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const context = await loadClaimContext(auctionId, walletAddress);
    const { sellerAmountUnits, feeAmountUnits } = splitPayment(context.finalPriceUnits);

    const signer = new ethers.Wallet(BACKEND_PRIVATE_KEY);
    const abiCoder = new ethers.AbiCoder();

    const innerHash = ethers.keccak256(
      abiCoder.encode(
        ['bytes32', 'uint256', 'address', 'uint256', 'address', 'uint256'],
        [WINNER_TAG, CHAIN_ID, SETTLEMENT_CONTRACT, context.auctionIdInt, context.claimant, context.finalPriceUnits]
      )
    );

    const signature = await signer.signMessage(ethers.getBytes(innerHash));

    // Upsert claim record
    const existingClaim = context.auction.claims?.[0];
    if (existingClaim?.id) {
      await supabase
        .from('claims')
        .update({ claim_status: 'signature_issued', amount_paid: context.auction.current_price })
        .eq('id', existingClaim.id);
    } else {
      await supabase.from('claims').insert({
        auction_id: auctionId,
        winner_user_id: context.auction.highest_bidder,
        seller_user_id: context.auction.seller_id,
        claim_status: 'signature_issued',
        amount_paid: context.auction.current_price,
      });
    }

    return NextResponse.json({
      signature,
      auctionIdInt: context.auctionIdInt.toString(),
      finalPriceWei: context.finalPriceUnits.toString(),
      sellerAmountUnits: sellerAmountUnits.toString(),
      feeAmountUnits: feeAmountUnits.toString(),
      platformFeeBps: PLATFORM_FEE_BPS,
      paymentTokenAddress: PAYMENT_TOKEN_ADDRESS,
      contractAddress: SETTLEMENT_CONTRACT,
    });
  } catch (err: unknown) {
    console.error('Signature error:', err);
    const status = err instanceof ClaimFlowError ? err.status : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate signature' },
      { status }
    );
  }
}
