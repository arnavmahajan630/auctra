"use client";

import { motion } from 'framer-motion';
import { UserPlus, Search, ShieldCheck, Link } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: 'STEP 1',
    title: 'One-Click Onboard',
    desc: 'Frictionless entry utilizing UGF technology for seamless Web2 to Web3 transition.',
  },
  {
    icon: Search,
    step: 'STEP 2',
    title: 'Explore & Commit',
    desc: 'Discover premium assets and place secure off-chain bids with absolute privacy.',
  },
  {
    icon: ShieldCheck,
    step: 'STEP 3',
    title: 'Win & Secure',
    desc: 'Real-time passive AI analysis ensures transaction integrity before final execution.',
  },
  {
    icon: Link,
    step: 'STEP 4',
    title: 'Claim via UGF',
    desc: 'Instant, non-custodial payouts adhering strictly to the 98/2 treasury split protocol.',
  }
];

export default function TheMechanics() {
  return (
    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">The Mechanics</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          A seamless execution flow designed for optimal capital efficiency and security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, idx) => (
          <motion.div 
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="group relative rounded-3xl bg-[#090e1a] border border-[#1a2b4b] p-8 text-center transition-all hover:border-indigo-500/50 hover:bg-[#0c1322]"
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-md pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#1a2b4b] bg-[#070b14] text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:text-indigo-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all">
                <s.icon className="h-6 w-6" />
              </div>
              
              <div className="text-[10px] font-bold tracking-widest text-indigo-500 mb-3 uppercase">{s.step}</div>
              <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {s.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
