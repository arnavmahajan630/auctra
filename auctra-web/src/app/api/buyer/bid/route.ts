import { NextResponse } from 'next/server';
import { supabase } from '@/server/supabase';
import { PrivyClient } from '@privy-io/server-auth';
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const privyAppSecret = process.env.PRIVY_APP_SECRET || '';
const privy = new PrivyClient(privyAppId, privyAppSecret);

// Initialize a public viem client to read from Base Sepolia testnet
const ethClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    let verifiedClaims;
    try {
      verifiedClaims = await privy.verifyAuthToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const privyUserId = verifiedClaims.userId;

    const { auctionId, amount } = await req.json();

    if (!auctionId || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid bid amount or auction ID' }, { status: 400 });
    }

    // 1. Fetch user's internal profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('privy_user_id', privyUserId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch user's connected wallet address to check ETH balance
    // Privy user object can be fetched from privy server auth
    const privyUser = await privy.getUser(privyUserId);
    const walletAddress = privyUser.wallet?.address;

    if (!walletAddress) {
      return NextResponse.json({ error: 'No wallet connected to your account.' }, { status: 400 });
    }

    // 2. Fetch the user's actual ETH balance from Mainnet using viem
    let ethBalance = 0;
    try {
      const balanceBigInt = await ethClient.getBalance({ address: walletAddress as `0x${string}` });
      ethBalance = Number(formatEther(balanceBigInt));
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
      // Fallback or ignore for hackathon if node fails, but we want strict check
      return NextResponse.json({ error: 'Failed to verify wallet balance.' }, { status: 500 });
    }

    if (amount > ethBalance) {
      return NextResponse.json({ 
        error: `Insufficient funds. You only have ${ethBalance.toFixed(4)} ETH in your wallet.` 
      }, { status: 400 });
    }

    // 3. Fetch the auction
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('*')
      .eq('id', auctionId)
      .single();

    if (auctionError || !auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // 4. Validate Auction status & Time
    if (auction.auction_status !== 'active' || new Date(auction.ends_at).getTime() <= Date.now()) {
      return NextResponse.json({ error: 'This auction has ended.' }, { status: 400 });
    }

    if (auction.seller_id === profile.id) {
      return NextResponse.json({ error: 'You cannot bid on your own auction.' }, { status: 400 });
    }

    // 5. Validate Minimum Bid
    const minimumAllowedBid = auction.total_bids > 0 
      ? Number(auction.current_price) + Number(auction.minimum_bid_increment)
      : Number(auction.starting_price);

    if (amount < minimumAllowedBid) {
      return NextResponse.json({ 
        error: `Bid must be at least ${minimumAllowedBid.toFixed(4)} ETH.` 
      }, { status: 400 });
    }

    // 6. Transaction simulation: Insert Bid & Update Auction (Sequential since no RPC)
    // First insert the bid
    const { error: bidInsertError } = await supabase
      .from('bids')
      .insert({
        auction_id: auctionId,
        bidder_id: profile.id,
        bid_amount: amount,
        is_winning_bid: false, // We don't mark true until the end usually, or we can mark the highest as true later
      });

    if (bidInsertError) {
      return NextResponse.json({ error: 'Failed to record your bid.' }, { status: 500 });
    }

    // Then update the auction's current price and highest bidder
    const { error: updateError } = await supabase
      .from('auctions')
      .update({
        current_price: amount,
        highest_bidder: walletAddress,
        total_bids: auction.total_bids + 1,
      })
      .eq('id', auctionId);

    if (updateError) {
      // Note: If update fails, the bid is recorded but auction isn't updated. For a hackathon, this consecutive flow is fine.
      return NextResponse.json({ error: 'Failed to update auction state.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Bid placed successfully!' });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
