'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Timer, ShieldCheck, Zap, User, AlertCircle } from 'lucide-react';
import LayoutWrapper from '../../../components/LayoutWrapper';
import BiddingModal from '../../../components/BiddingModal';
import { supabase } from '@/server/supabase';
import { Auction } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';
import { formatUsdAmount } from '@/lib/currency';

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isConnected, connectWallet } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchAuction = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('*, profiles!auctions_seller_id_fkey(username, avatar_url)')
        .eq('id', resolvedParams.id)
        .single();
      
      if (!error && data) {
        setAuction({
          id: data.id,
          title: data.title,
          description: data.description,
          image: data.image_url,
          currentBid: Number(data.current_price),
          startingPrice: Number(data.starting_price),
          minBidIncrement: Number(data.minimum_bid_increment),
          highestBidder: data.highest_bidder,
          endsAt: data.ends_at,
          xpReward: data.xp_reward,
          status: data.auction_status,
          creator: data.profiles?.username || 'Unknown',
          creatorAvatar: data.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback',
          bidsCount: data.total_bids || 0
        });

        // Fetch Bids
        const { data: bidsData } = await supabase
          .from('bids')
          .select('*, profiles(username)')
          .eq('auction_id', resolvedParams.id)
          .order('created_at', { ascending: false });
        
        if (bidsData) {
          setBids(bidsData);
        }
      }
      setLoading(false);
    };
    fetchAuction();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!auction) return;
    const calculateTimeLeft = () => {
      const difference = +new Date(auction.endsAt) - +new Date();
      if (difference <= 0) { setTimeLeft('Auction Ended'); return; }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);
      setTimeLeft(parts.join(' '));
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction]);

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-400 text-sm">Loading on-chain asset details...</p>
        </div>
      </LayoutWrapper>
    );
  }

  if (!auction) {
    return (
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-bold mb-2 text-white">Auction Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">This auction does not exist or has ended.</p>
          <Link href="/explore" className="rounded-xl bg-indigo-600 px-6 py-2.5 font-semibold text-sm text-white hover:bg-indigo-500 transition-colors">
            Back to Explore
          </Link>
        </div>
      </LayoutWrapper>
    );
  }

  // Helper for time ago
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  };

  const multiplierBoost = auction ? (1 + (auction.currentBid * 0.05)).toFixed(2) : '1.00';

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 animate-fade-in pb-12">
        {/* Back Link */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to explore auctions
        </Link>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Asset View */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Main Visual */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800/40 bg-slate-900/40 aspect-video flex items-center justify-center shadow-lg group">
              <img
                src={auction.image}
                alt={auction.title}
                className="h-full w-full object-cover rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute top-6 right-6">
                <span className="flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 px-4 py-2 text-xs font-bold text-slate-200">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                  Verified On-Chain Asset
                </span>
              </div>
            </div>

            {/* Asset Info */}
            <div className="flex flex-col gap-5 mt-2">
              <div className="flex items-center gap-3">
                <img 
                  src={auction.creatorAvatar} 
                  alt={auction.creator} 
                  className="w-10 h-10 rounded-full border-2 border-indigo-500/30 object-cover" 
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                    Creator
                  </span>
                  <span className="text-sm font-bold text-white">
                    {auction.creator}
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
                {auction.title}
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">{auction.description}</p>
            </div>
          </div>

          {/* Right Column: Bid Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live Bidding Box */}
            <div className="rounded-3xl border border-slate-800/40 bg-gradient-to-b from-slate-900/40 to-[#0B0F19]/80 p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">Auction Status</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-950/30 border border-indigo-500/20 rounded-full px-3 py-1.5">
                  <Timer className="h-3.5 w-3.5 animate-pulse" />
                  {timeLeft}
                </span>
              </div>

              <div className="flex flex-col gap-1 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-400">Current highest bid</span>
                  <span className="text-xs text-slate-500">Starting at {formatUsdAmount(auction.startingPrice)}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{formatUsdAmount(auction.currentBid)}</span>
                  <span className="text-xs text-slate-500 ml-1">Mock USD via UGF</span>
                </div>
              </div>

              {isConnected ? (
                <button
                  onClick={() => setIsBidModalOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
                >
                  Place a Bid Proposal
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
                >
                  Connect Wallet to Bid
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-teal-500/20 bg-teal-950/10 p-5">
              <Zap className="h-6 w-6 text-teal-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-200 text-sm">Multiplier Yield Boost</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Winning rewards you with <span className="font-bold text-teal-400">+{auction.xpReward} XP</span> and grants a <span className="font-bold text-teal-400">{multiplierBoost}x</span> reputation multiplier boost.
                </p>
              </div>
            </div>

            {/* Bid History */}
            <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6">
              <h3 className="text-sm font-bold tracking-tight text-white mb-4">Bid History Log</h3>
              <div className="flex flex-col gap-3">
                {bids.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm italic">
                    No bids yet. Be the first to bid!
                  </div>
                ) : (
                  bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-800/30 bg-slate-950/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-900 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {bid.profiles?.username || 'Unknown'}
                          </span>
                          <span className="text-[10px] text-slate-500">{timeAgo(bid.created_at)}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">{formatUsdAmount(bid.bid_amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BiddingModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        auction={auction}
      />
    </LayoutWrapper>
  );
}
