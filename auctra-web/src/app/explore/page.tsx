"use client";

import { useState } from 'react';
import useRequireAuth from '../../hooks/useRequireAuth';
import LayoutWrapper from '../../components/LayoutWrapper';
import AuctionCard from '../../components/AuctionCard';
import { useAuctions } from '../../hooks/useAuctions';

type FilterType = 'all' | 'active' | 'upcoming' | 'high-value';

export default function ExplorePage() {
  useRequireAuth();
  const { auctions } = useAuctions();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredAuctions = auctions.filter((auction) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return auction.status === 'active';
    if (activeFilter === 'upcoming') return auction.status === 'upcoming';
    if (activeFilter === 'high-value') return auction.currentBid >= 2.0;
    return true;
  });

  const filterTabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Auctions' },
    { id: 'active', label: 'Live Active' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'high-value', label: 'High Value' },
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
        {filteredAuctions.length === 0 ? (
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
