import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';
import { ethers } from 'ethers';
import {
  CHAIN_ID,
  PAYMENT_TOKEN_ADDRESS,
  ClaimFlowError,
  WINNER_TAG,
  loadClaimContext,
  verifyTokenTransferTx,
} from '@/server/claim-payment';

// Verify the environment variable exists
const BACKEND_PRIVATE_KEY = process.env.BACKEND_SIGNER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001'; // Default dummy key if not set
const SETTLEMENT_CONTRACT = process.env.NEXT_PUBLIC_SETTLEMENT_CONTRACT || '0x0000000000000000000000000000000000000000';

export async function POST(req: Request) {
  try {
    const { auctionId, walletAddress, paymentTxHashes, ugfPaymentDigests } = await req.json();

    if (!auctionId || !walletAddress || !paymentTxHashes?.seller) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const context = await loadClaimContext(auctionId, walletAddress);

    await verifyTokenTransferTx({
      txHash: paymentTxHashes.seller,
      from: context.claimant,
      to: context.sellerWallet,
      amount: context.sellerAmountUnits,
    });

    if (context.feeAmountUnits > BigInt(0)) {
      if (!paymentTxHashes.platform_fee) {
        return NextResponse.json({ error: 'Missing platform fee payment receipt' }, { status: 400 });
      }
      await verifyTokenTransferTx({
        txHash: paymentTxHashes.platform_fee,
        from: context.claimant,
        to: context.treasuryWallet,
        amount: context.feeAmountUnits,
      });
    }

    const finalPriceWei = context.finalPriceUnits;

    // 3. Generate the ECDSA Signature
    const signer = new ethers.Wallet(BACKEND_PRIVATE_KEY);
    const abiCoder = new ethers.AbiCoder();
    
    const innerHash = ethers.keccak256(
      abiCoder.encode(
        ['bytes32', 'uint256', 'address', 'uint256', 'address', 'uint256'],
        [WINNER_TAG, CHAIN_ID, SETTLEMENT_CONTRACT, context.auctionIdInt, context.claimant, finalPriceWei]
      )
    );

    const signature = await signer.signMessage(ethers.getBytes(innerHash));

    await supabase
      .from('claims')
      .update({
        claim_status: 'payment_confirmed',
        payment_tx_hash: paymentTxHashes.seller,
        ugf_payment_digest: ugfPaymentDigests?.seller || null,
        ugf_fee_tx_hash: paymentTxHashes.platform_fee || null,
        ugf_fee_digest: ugfPaymentDigests?.platform_fee || null,
        amount_paid: context.auction.current_price,
      })
      .eq('auction_id', auctionId);

    return NextResponse.json({
      signature,
      auctionIdInt: context.auctionIdInt.toString(),
      finalPriceWei: finalPriceWei.toString(),
      paymentTokenAddress: PAYMENT_TOKEN_ADDRESS,
      contractAddress: SETTLEMENT_CONTRACT
    });

  } catch (err: unknown) {
    console.error('Signature error:', err);
    const status = err instanceof ClaimFlowError ? err.status : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to generate signature' }, { status });
  }
}
