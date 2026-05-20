"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Navbar() {
  const openAuth = useAppStore((s) => s.openAuthModal);

  return (
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg">
            <Gem className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-tight">Oktra</div>
            <div className="text-xs text-indigo-300 -mt-0.5">Premium Web3 Auctions</div>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 items-center text-sm text-slate-300">
          <a onClick={() => openAuth('Sign in to continue', '/explore')} className="hover:text-white cursor-pointer">Explore</a>
          <a onClick={() => openAuth('Sign in to continue', '/explore')} className="hover:text-white cursor-pointer">Auctions</a>
          <a onClick={() => openAuth('Sign in to continue', '/leaderboard')} className="hover:text-white cursor-pointer">Leaderboard</a>
          <a onClick={() => openAuth('Sign in to continue', '/profile')} className="hover:text-white cursor-pointer">Rewards</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openAuth('Sign in to continue')}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-800/40 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Sign In
          </button>

          <button
            onClick={() => openAuth('Sign in to continue')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_30px_rgba(99,102,241,0.12)]"
          >
            Connect Wallet
          </button>

          <button
            className="ml-2 text-slate-400 md:hidden"
            aria-label="menu"
          >
            ☰
          </button>
        </div>
      </div>
    </motion.header>
  );
}
