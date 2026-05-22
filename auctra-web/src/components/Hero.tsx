"use client";

import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        {/* Text and Buttons */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[3.5rem] md:text-[5rem] font-bold leading-[1.1] tracking-tight text-white mb-6"
        >
          The Elite Layer for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]">
            Decentralized Auctions.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl"
        >
          Experience a premium bidding network with zero-friction onboarding, passive AI fraud guardrails, and instant non-custodial payouts.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <button 
            onClick={() => authenticated ? router.push('/explore') : login()} 
            className="rounded-xl bg-gradient-to-r from-[#4f70f6] to-[#0fd2ff] px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(79,112,246,0.4)] hover:shadow-[0_0_30px_rgba(79,112,246,0.6)] transition-all active:scale-95"
          >
            Start Bidding
          </button>
          <button 
            onClick={() => router.push('#how-it-works')} 
            className="rounded-xl border border-slate-800 bg-transparent px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800/50 hover:border-slate-700 transition-all active:scale-95"
          >
            Learn Mechanics
          </button>
        </motion.div>
      </div>
    </section>
  );
}
