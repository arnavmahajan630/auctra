'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Timer, ShieldCheck, Zap, User, AlertCircle } from 'lucide-react';
import LayoutWrapper from '../../../components/LayoutWrapper';
import BiddingModal from '../../../components/BiddingModal';
import { useAuctions } from '../../../hooks/useAuctions';
import { useAuth } from '../../../hooks/useAuth';

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isConnected, connectWallet } = useAuth();
  const { getAuctionById } = useAuctions();

  const auction = getAuctionById(resolvedParams.id);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

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

  const mockBidHistory = [
    { bidder: auction.highestBidder || '0x3D9...F21A', amount: auction.currentBid, date: '10 mins ago', isYou: auction.highestBidder === '0x8F3a2C...4D1A' },
    { bidder: '0x9E1...B50C', amount: auction.currentBid - 0.2, date: '2 hours ago', isYou: false },
    { bidder: '0x7C2...D44E', amount: auction.currentBid - 0.45, date: '5 hours ago', isYou: false },
    { bidder: '0x1F2...A98E', amount: auction.currentBid - 0.7, date: '1 day ago', isYou: false },
  ];

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
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                  Created by {auction.creator}
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
                  {auction.title}
                </h1>
              </div>
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
                <span className="text-xs text-slate-400">Current highest bid</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{auction.currentBid.toFixed(2)}</span>
                  <span className="text-lg font-bold text-slate-400">ETH</span>
                  <span className="text-xs text-slate-500 ml-1">
                    (~${(auction.currentBid * 3500).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD)
                  </span>
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

            {/* XP Yield */}
            <div className="flex items-center gap-4 rounded-2xl border border-teal-500/20 bg-teal-950/10 p-5">
              <Zap className="h-6 w-6 text-teal-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-slate-200 text-sm">Multiplier Yield Boost</span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Winning rewards you with <span className="font-bold text-teal-400">+{auction.xpReward} XP</span> and boosts your reputation multiplier.
                </p>
              </div>
            </div>

            {/* Bid History */}
            <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6">
              <h3 className="text-sm font-bold tracking-tight text-white mb-4">Bid History Log</h3>
              <div className="flex flex-col gap-3">
                {mockBidHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      item.isYou ? 'border-indigo-500/30 bg-indigo-950/15' : 'border-slate-800/30 bg-slate-950/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        item.isYou ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-400'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {item.isYou ? 'You (Anon)' : item.bidder}
                        </span>
                        <span className="text-[10px] text-slate-500">{item.date}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white">{item.amount.toFixed(2)} ETH</span>
                  </div>
                ))}
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
