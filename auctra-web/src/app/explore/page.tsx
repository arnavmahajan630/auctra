"use client";

import { useState, useEffect } from 'react';
import useRequireAuth from '../../hooks/useRequireAuth';
import LayoutWrapper from '../../components/LayoutWrapper';
import AuctionCard from '../../components/AuctionCard';
import { supabase } from '@/server/supabase';
import { Auction } from '../../types';

type FilterType = 'active' | 'upcoming' | 'high-value' | 'ended';

export default function ExplorePage() {
  useRequireAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select(`*, profiles!auctions_seller_id_fkey(username, avatar_url)`)
        .order('ends_at', { ascending: true });
        
      if (!error && data) {
        const mapped: Auction[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          image: row.image_url,
          currentBid: Number(row.current_price),
          startingPrice: Number(row.starting_price),
          minBidIncrement: Number(row.minimum_bid_increment),
          highestBidder: row.highest_bidder,
          endsAt: row.ends_at,
          xpReward: row.xp_reward,
          status: row.auction_status,
          creator: row.profiles?.username || 'Unknown',
          creatorAvatar: row.profiles?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback',
          bidsCount: row.total_bids || 0
        }));
        setAuctions(mapped);
      }
      setLoading(false);
    };
    
    fetchLiveAuctions();
  }, []);

  const filteredAuctions = auctions.filter((auction) => {
    const isEnded = new Date(auction.endsAt).getTime() <= Date.now();
    const effectiveStatus = isEnded ? 'ended' : auction.status;

    if (activeFilter === 'active') return effectiveStatus === 'active';
    if (activeFilter === 'upcoming') return effectiveStatus === 'upcoming';
    if (activeFilter === 'high-value') return auction.currentBid >= 2.0 && effectiveStatus === 'active';
    if (activeFilter === 'ended') return effectiveStatus === 'ended';
    return true;
  });

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'active', label: 'Live Active' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'high-value', label: 'High Value' },
    { id: 'ended', label: 'Ended Auctions' },
  ];

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Title */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Explore Live Auctions
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Step into the arena, place your bids on high-value on-chain assets, and build your digital legacy.
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 border-b border-slate-800/20 pb-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`rounded-xl px-5 py-2.5 font-semibold text-xs transition-all duration-200 cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm mt-4">Loading live network auctions...</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-slate-500 text-sm">No live auctions match this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
