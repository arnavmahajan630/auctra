"use client";

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Workflow, Eye, Percent, Zap } from 'lucide-react';

interface BentoCardProps {
  children: React.ReactNode;
  className: string;
  delay?: number;
  glowColor?: string;
}

function BentoCard({ children, className, delay = 0, glowColor = "rgba(99, 102, 241, 0.12)" }: BentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--bento-x', `${x}px`);
    cardRef.current.style.setProperty('--bento-y', `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: 'spring', stiffness: 90, damping: 16, delay }}
      whileHover={{ y: -4, borderColor: 'rgba(99, 102, 241, 0.28)' }}
      style={{
        ['--bento-x' as any]: '50%',
        ['--bento-y' as any]: '50%',
      }}
      className={`group relative rounded-2xl bg-gradient-to-br from-[#0a1020]/95 via-[#070b16]/95 to-[#040810]/95 border border-slate-900/90 p-8 backdrop-blur-md shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(99,102,241,0.06)] ${className}`}
    >
      {/* Dynamic localized cursor spotlight with premium cyan/purple color bloom */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(260px circle at var(--bento-x) var(--bento-y), ${glowColor}, transparent 80%)`
        }}
      />

      {/* Silver lighting sweep reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] pointer-events-none" />

      {children}
    </motion.div>
  );
}

export default function FeaturesGrid() {
  return (
    <section id="technical-superiority" className="max-w-7xl mx-auto px-6 py-28 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-20">
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          Technical Superiority
        </motion.h2>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Row 1, Card 1: Wallet Abstraction (Wider: 7 cols) */}
        <BentoCard className="lg:col-span-7" delay={0} glowColor="rgba(99, 102, 241, 0.16)">
          {/* Subtle static top-right blur node */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:border-indigo-500/40 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Workflow className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Wallet Abstraction
            </h3>
            <p className="mt-3 text-[13.5px] text-slate-400 leading-relaxed font-normal max-w-xl">
              Seamless Web2 onboarding masking complex cryptographic processes. Connect via email or social, trade with Web3 security.
            </p>
          </div>
        </BentoCard>

        {/* Row 1, Card 2: Passive AI Oversight (Narrower: 5 cols) */}
        <BentoCard className="lg:col-span-5" delay={0.12} glowColor="rgba(6, 182, 212, 0.16)">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:border-cyan-500/40 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Eye className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Passive AI Oversight
            </h3>
            <p className="mt-3 text-[13.5px] text-slate-400 leading-relaxed font-normal">
              Automated, continuous monitoring of all network activity, instantly neutralizing malicious bidding patterns.
            </p>
          </div>
        </BentoCard>

        {/* Row 2, Card 3: 98/2 Treasury Split (Narrower: 5 cols) */}
        <BentoCard className="lg:col-span-5" delay={0.18} glowColor="rgba(99, 102, 241, 0.16)">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:border-indigo-500/40 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Percent className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-3xl font-extrabold text-white mt-1">98/2</h3>
            <h4 className="text-base font-bold text-white mt-1 tracking-tight">
              Treasury Split
            </h4>
            <p className="mt-3 text-[13.5px] text-slate-400 leading-relaxed font-normal">
              Maximum capital efficiency. 98% direct to seller, 2% autonomous protocol fee execution.
            </p>
          </div>
        </BentoCard>

        {/* Row 2, Card 4: Instant P2P Settlements (Wider: 7 cols) */}
        <BentoCard className="lg:col-span-7" delay={0.24} glowColor="rgba(6, 182, 212, 0.16)">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:border-cyan-500/40 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Instant P2P Settlements
            </h3>
            <p className="mt-3 text-[13.5px] text-slate-400 leading-relaxed font-normal max-w-xl">
              Trustless, atomic claims via smart contracts. No intermediaries, zero delay upon auction conclusion.
            </p>
          </div>
        </BentoCard>
      </div>
    </section>
  );
}
