"use client";

import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function CallToAction() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-[2rem] border border-[#1a2b4b] bg-gradient-to-b from-[#090e1a] to-[#05050a] p-12 text-center shadow-2xl overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 tracking-tight max-w-xl mx-auto">
            Ready to claim your spot on the leaderboard?
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Enter Wallet Address" 
              className="w-full px-5 py-3.5 bg-[#04060a] border border-[#1a2b4b] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
            <button 
              onClick={() => authenticated ? router.push('/explore') : login()} 
              className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-to-r from-[#4f70f6] to-[#0fd2ff] px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(79,112,246,0.4)] hover:shadow-[0_0_30px_rgba(79,112,246,0.6)] transition-all active:scale-95"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
