import { NextResponse } from 'next/server';
import {
  PAYMENT_COIN,
  PAYMENT_TOKEN_ADDRESS,
  PAYMENT_TOKEN_DECIMALS,
  PLATFORM_FEE_BPS,
  SETTLEMENT_CONTRACT,
  ClaimFlowError,
  loadClaimContext,
} from '@/server/claim-payment';

// Returns payment amounts for display in the UI. No DB writes — claim record is created
// by /api/buyer/claim-signature once the user initiates the single-transaction checkout.
export async function POST(req: Request) {
  try {
    const { auctionId, walletAddress } = await req.json();

    if (!auctionId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const context = await loadClaimContext(auctionId, walletAddress);

    return NextResponse.json({
      paymentCoin: PAYMENT_COIN,
      paymentTokenAddress: PAYMENT_TOKEN_ADDRESS,
      paymentTokenDecimals: PAYMENT_TOKEN_DECIMALS,
      platformFeeBps: PLATFORM_FEE_BPS,
      settlementContract: SETTLEMENT_CONTRACT,
      finalPriceUnits: context.finalPriceUnits.toString(),
      sellerAmountUnits: context.sellerAmountUnits.toString(),
      feeAmountUnits: context.feeAmountUnits.toString(),
      displayAmount: Number(context.auction.current_price),
    });
  } catch (err: unknown) {
    console.error('Claim payment init error:', err);
    const status = err instanceof ClaimFlowError ? err.status : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to initialize payment' },
      { status }
    );
  }
}
