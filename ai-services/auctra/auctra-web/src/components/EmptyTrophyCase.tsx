'use client';

import { Gem, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EmptyTrophyCase() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Central Glassmorphic Box */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800/40 bg-gradient-to-b from-slate-900/70 to-[#0B0F19]/90 px-8 py-16 text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        {/* Diamond Icon Container */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900/50 border border-slate-800 text-slate-400">
          <Gem className="h-10 w-10 text-slate-500" />
        </div>

        {/* Heading */}
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your Trophy Case is Empty.
        </h2>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-slate-400">
          The Hall of Fame is reserved for victorious network actors.
          Step into the arena, place your bids, and claim your first on-chain collectible.
        </p>

        {/* Action Button */}
        <button
          onClick={() => router.push('/explore')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-semibold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.4)] transition-all duration-200 cursor-pointer"
        >
          Explore Live Auctions
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Slider Indicator Dots */}
      <div className="mt-8 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-slate-700" />
        <span className="h-2 w-2 rounded-full bg-slate-700" />
        <span className="h-2 w-2 rounded-full bg-slate-700" />
      </div>
    </div>
  );
}
