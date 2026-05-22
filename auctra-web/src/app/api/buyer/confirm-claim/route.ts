import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';
import { createPublicClient, http, parseEventLogs } from 'viem';
import { baseSepolia } from 'viem/chains';

const ClaimedEventABI = [{
  "type": "event",
  "name": "Claimed",
  "inputs": [
    {"name": "auctionId", "type": "uint256", "indexed": true},
    {"name": "winner", "type": "address", "indexed": true},
    {"name": "finalPrice", "type": "uint256", "indexed": false},
    {"name": "badgeId", "type": "uint256", "indexed": false}
  ]
}] as const;

export async function POST(req: Request) {
  try {
    const { auctionId, txHash, amountPaid, ugfClaimDigest } = await req.json();

    if (!auctionId || !txHash || !amountPaid) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Verify auction exists
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // 1.5 Extract badgeId from transaction receipt
    let nftTokenId: number | null = null;
    try {
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
      });
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
      const logs = parseEventLogs({
        abi: ClaimedEventABI,
        eventName: 'Claimed',
        logs: receipt.logs
      });
      
      if (logs && logs.length > 0) {
        nftTokenId = Number(logs[0].args.badgeId);
      }
    } catch (err) {
      console.error('Failed to extract badgeId from receipt:', err);
      // Non-fatal, we proceed without nftTokenId if parsing fails
    }

    // 2. Insert or Update the Claim record
    // Usually claims are unique per auction
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('*')
      .eq('auction_id', auctionId)
      .single();

    if (existingClaim && existingClaim.claim_status === 'minted') {
      return NextResponse.json({ error: 'Claim already minted' }, { status: 400 });
    }

    if (existingClaim) {
      await supabase
        .from('claims')
        .update({
          claim_status: 'minted',
          claim_tx_hash: txHash,
          ugf_claim_digest: ugfClaimDigest || null,
          amount_paid: amountPaid,
          claimed_at: new Date().toISOString(),
          ...(nftTokenId !== null ? { nft_token_id: nftTokenId } : {})
        })
        .eq('id', existingClaim.id);
    } else {
      await supabase
        .from('claims')
        .insert({
          auction_id: auctionId,
          winner_user_id: auction.highest_bidder,
          seller_user_id: auction.seller_id,
          claim_status: 'minted',
          claim_tx_hash: txHash,
          ugf_claim_digest: ugfClaimDigest || null,
          amount_paid: amountPaid,
          claimed_at: new Date().toISOString(),
          nft_token_id: nftTokenId
        });
    }

    // 3. Update Auction status
    await supabase
      .from('auctions')
      .update({
        is_claimed: true,
        blockchain_settled: true
      })
      .eq('id', auctionId);

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error('Confirm claim error:', err);
    return NextResponse.json({ error: 'Failed to confirm claim' }, { status: 500 });
  }
}
