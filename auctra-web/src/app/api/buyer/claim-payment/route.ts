import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';
import {
  PAYMENT_COIN,
  PAYMENT_TOKEN_ADDRESS,
  PAYMENT_TOKEN_DECIMALS,
  PLATFORM_FEE_BPS,
  ClaimFlowError,
  loadClaimContext,
} from '@/server/claim-payment';

export async function POST(req: Request) {
  try {
    const { auctionId, walletAddress } = await req.json();

    if (!auctionId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const context = await loadClaimContext(auctionId, walletAddress);

    const existingClaim = context.auction.claims?.[0];
    if (existingClaim) {
      await supabase
        .from('claims')
        .update({
          claim_status: 'pending_payment',
          amount_paid: context.auction.current_price,
        })
        .eq('id', existingClaim.id);
    } else {
      await supabase.from('claims').insert({
        auction_id: auctionId,
        winner_user_id: context.auction.highest_bidder,
        seller_user_id: context.auction.seller_id,
        claim_status: 'pending_payment',
        amount_paid: context.auction.current_price,
      });
    }

    return NextResponse.json({
      paymentCoin: PAYMENT_COIN,
      paymentTokenAddress: PAYMENT_TOKEN_ADDRESS,
      paymentTokenDecimals: PAYMENT_TOKEN_DECIMALS,
      platformFeeBps: PLATFORM_FEE_BPS,
      finalPriceUnits: context.finalPriceUnits.toString(),
      displayAmount: Number(context.auction.current_price),
      transfers: [
        {
          kind: 'seller',
          to: context.sellerWallet,
          amountUnits: context.sellerAmountUnits.toString(),
        },
        {
          kind: 'platform_fee',
          to: context.treasuryWallet,
          amountUnits: context.feeAmountUnits.toString(),
        },
      ].filter((transfer) => BigInt(transfer.amountUnits) > BigInt(0)),
    });
  } catch (err: unknown) {
    console.error('Claim payment init error:', err);
    const status = err instanceof ClaimFlowError ? err.status : 500;
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to initialize UGF payment' }, { status });
  }
}
