"use client";

import { motion } from 'framer-motion';
import { Wallet, Eye, Percent, Zap } from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Wallet Abstraction',
    desc: 'Seamless Web2 onboarding masking complex cryptographic processes. Connect via email or social, trade with Web3 security.',
  },
  {
    icon: Eye,
    title: 'Passive AI Oversight',
    desc: 'Automated, continuous monitoring of all network activity, instantly neutralizing malicious bidding patterns.',
  },
  {
    icon: Percent,
    title: '98/2 Treasury Split',
    desc: 'Maximum capital efficiency. 98% direct to seller, 2% autonomous protocol fee execution.',
  },
  {
    icon: Zap,
    title: 'Instant P2P Settlements',
    desc: 'Trustless, atomic claims via smart contracts. No intermediaries, zero delay upon auction conclusion.',
  }
];

export default function TechnicalSuperiority() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Technical Superiority</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f, idx) => (
          <motion.div 
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="group relative rounded-[2rem] bg-[#070b14] border border-[#1a2b4b] p-10 transition-all hover:bg-[#0c1322]"
          >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-[#1a2b4b] text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] group-hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all">
                <f.icon className="h-5 w-5" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
