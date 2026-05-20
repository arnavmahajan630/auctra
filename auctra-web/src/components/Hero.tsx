"use client";

import { motion } from 'framer-motion';
import { Gem, ArrowRight } from 'lucide-react';

import { useAppStore } from '../store/useAppStore';

export default function Hero() {
  const openAuth = useAppStore((s) => s.openAuthModal);

  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">Oktra — The Premier Web3 Auction Stage for Elite Collectors</h1>
          <p className="mt-4 text-slate-300 max-w-xl">Buy, sell, and claim verified NFTs in cinematic auctions. Secure on-chain settlements, reputation tracking, and premium seller verification.</p>

          <div className="mt-8 flex gap-4">
            <button onClick={() => openAuth('Sign in to continue', '/explore')} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg">Explore Auctions</button>
            <button onClick={() => openAuth('Sign in to continue', '/seller-onboarding')} className="rounded-xl border border-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">Become Seller</button>
          </div>

          <div className="mt-8 flex gap-6">
            <div className="text-xs text-slate-400">
              <div className="font-bold text-white">Live now</div>
              <div>Premium auctions starting every hour</div>
            </div>

            <div className="text-xs text-slate-400">
              <div className="font-bold text-white">Secure</div>
              <div>On-chain settlement & verified badges</div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <motion.div initial={{ rotate: -6 }} animate={{ rotate: 0 }} transition={{ duration: 1 }} className="w-[360px] h-[420px] rounded-3xl bg-gradient-to-br from-slate-900/60 to-[#071026]/60 border border-slate-800 p-4 shadow-2xl">
            <div className="h-full w-full rounded-2xl bg-gradient-to-tr from-indigo-900/10 to-transparent p-3">
              <div className="h-full w-full bg-[url('/images/obsidian_watch.png')] bg-cover bg-center rounded-2xl shadow-inner" />
            </div>
          </motion.div>

          {/* Floating previews */}
          <motion.div initial={{ x: 40, y: -40 }} animate={{ x: 0, y: 0 }} transition={{ delay: 0.2 }} className="absolute -right-20 -top-8 w-44 h-28 rounded-2xl bg-gradient-to-tr from-violet-700 to-indigo-500 p-2 shadow-lg border border-indigo-400/20">
            <div className="h-full w-full bg-[url('/images/nebula_core.png')] bg-cover bg-center rounded-lg" />
          </motion.div>

          <motion.div initial={{ x: -40, y: 40 }} animate={{ x: 0, y: 0 }} transition={{ delay: 0.4 }} className="absolute -left-10 -bottom-6 w-36 h-24 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-500 p-2 shadow-lg border border-teal-300/20">
            <div className="h-full w-full bg-[url('/images/quantum_ring.png')] bg-cover bg-center rounded-lg" />
          </motion.div>
        </div>
      </div>

      {/* subtle gradient glow */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-[#04050a] via-transparent to-transparent opacity-80" />
    </section>
  );
}
