'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Gem, Zap, Plus, ArrowUpRight } from 'lucide-react';
import LayoutWrapper from '../../components/LayoutWrapper';
import AuthGuard from '../../components/AuthGuard';
import useRequireAuth from '../../hooks/useRequireAuth';
import NFTBadgeCard from '../../components/NFTBadgeCard';
import StatBadge from '../../components/StatBadge';
import { useAuth } from '../../hooks/useAuth';
import { useCollectibles } from '../../hooks/useCollectibles';

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected } = useAuth();
  const { collectibles, multiplier, artifactsCount } = useCollectibles();

  const featuredWatch = collectibles.find(c => c.id === 'won-watch') || collectibles[0];
  const standardCollectibles = collectibles.filter(c => c.id !== featuredWatch?.id);

  return (
    <LayoutWrapper>
      <div>
        {useRequireAuth() && (
          <div className="flex flex-col gap-8 animate-fade-in">
          {/* Header & Badges */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex flex-col">
              <h1 className="text-4xl font-extrabold tracking-tight text-white">
                The Hall of Fame
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Your elite collection of verified on-chain assets and achievements.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <StatBadge
                icon={<Gem className="h-4 w-4 text-indigo-400" />}
                label={`${artifactsCount} Artifacts Claimed`}
              />
              <StatBadge
                icon={<Zap className="h-4 w-4 text-teal-400" />}
                label={`+${((multiplier - 1) * 100).toFixed(0)}% Reputation Multiplier`}
                variant="glow"
              />
            </div>
          </div>

          <div className="h-px w-full bg-slate-800/20" />

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left featured large card */}
            {featuredWatch && (
              <div className="lg:col-span-1">
                <NFTBadgeCard collectible={featuredWatch} variant="large" />
              </div>
            )}

            {/* Right smaller cards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {standardCollectibles.map((item) => (
                <NFTBadgeCard key={item.id} collectible={item} variant="standard" />
              ))}

              {/* Acquire Next (Dotted Card) */}
              <div className="flex flex-col justify-between items-center text-center p-8 rounded-3xl border-2 border-dashed border-slate-800/60 bg-slate-900/20 hover:border-indigo-500/50 hover:bg-slate-900/40 transition-all duration-300 group min-h-[220px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 text-slate-400 group-hover:border-indigo-500/30 group-hover:text-indigo-400 transition-all">
                  <Plus className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-1.5 px-4 my-4">
                  <h4 className="text-base font-bold tracking-tight text-white">
                    Acquire Next
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Explore live auctions to expand your legacy and increase your multiplier.
                  </p>
                </div>

                <button
                  onClick={() => useAppStore.getState().openAuthModal('Sign in to continue', '/explore')}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-white/5 px-5 py-2.5 font-semibold text-xs text-slate-300 hover:bg-white/10 hover:border-slate-700 transition-all cursor-pointer"
                >
                  View Live Auctions
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
