"use client";

import { motion } from 'framer-motion';
import { UserPlus, Search, Shield, Coins } from 'lucide-react';

const steps = [
  {
    step: "STEP 1",
    title: "One-Click Onboard",
    desc: "Frictionless entry utilizing UGF technology for seamless Web2 to Web3 transition.",
    icon: UserPlus,
    accentColor: "group-hover:text-indigo-400",
    shadowColor: "group-hover:shadow-[0_0_22px_rgba(99,102,241,0.25)]",
    borderColor: "group-hover:border-indigo-500/40"
  },
  {
    step: "STEP 2",
    title: "Explore & Commit",
    desc: "Discover premium assets and place secure off-chain bids with absolute privacy.",
    icon: Search,
    accentColor: "group-hover:text-cyan-450",
    shadowColor: "group-hover:shadow-[0_0_22px_rgba(6,182,212,0.25)]",
    borderColor: "group-hover:border-cyan-500/40"
  },
  {
    step: "STEP 3",
    title: "Win & Secure",
    desc: "Real-time passive AI analysis ensures transaction integrity before final execution.",
    icon: Shield,
    accentColor: "group-hover:text-indigo-400",
    shadowColor: "group-hover:shadow-[0_0_22px_rgba(99,102,241,0.25)]",
    borderColor: "group-hover:border-indigo-500/40"
  },
  {
    step: "STEP 4",
    title: "Claim via UGF",
    desc: "Instant, non-custodial payouts adhering strictly to the 98/2 treasury split protocol.",
    icon: Coins,
    accentColor: "group-hover:text-cyan-450",
    shadowColor: "group-hover:shadow-[0_0_22px_rgba(6,182,212,0.25)]",
    borderColor: "group-hover:border-cyan-500/40"
  }
];

export default function HowItWorks() {
  return (
    <section id="the-mechanics" className="max-w-7xl mx-auto px-6 py-28 scroll-mt-20 relative">
      {/* Background ambient lighting with custom purple fog */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(circle,rgba(99,102,241,0.04),transparent_75%)] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[200px] bg-[radial-gradient(circle,rgba(6,182,212,0.02),transparent_75%)] pointer-events-none -z-10" />

      {/* Header with reveal animation */}
      <div className="text-center mb-20">
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
        >
          The Mechanics
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 text-[14px] text-slate-400 max-w-xl mx-auto leading-relaxed"
        >
          A seamless execution flow designed for optimal capital efficiency and security.
        </motion.p>
      </div>

      {/* Grid container with relative timeline connection */}
      <div className="relative">
        
        {/* Cinematic horizontal connecting pipeline (Hidden on mobile) */}
        <div className="absolute top-12 left-[12%] right-[12%] h-[1px] pointer-events-none hidden lg:block -z-10 overflow-hidden">
          <div className="w-full h-full border-t border-dashed border-slate-900/80" />
          <motion.div 
            animate={{ x: ['-100%', '300%'] }} 
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute top-0 w-44 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500" 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const IconComponent = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: 'spring', stiffness: 100, damping: 18, delay: idx * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative rounded-2xl bg-gradient-to-b from-[#0a1122]/95 to-[#03060d]/95 border border-slate-900 hover:border-indigo-500/25 p-6 backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-[0_20px_45px_rgba(99,102,241,0.08)]"
              >
                {/* Spotlight hover effect card background glow */}
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Floating, gravity-defying interactive icon orbit container */}
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut', delay: idx * 0.5 }}
                  className={`w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center border border-slate-900/80 transition-all duration-500 mb-6 ${s.shadowColor} ${s.borderColor}`}
                >
                  <IconComponent className={`w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors duration-300`} />
                </motion.div>

                {/* Step number label */}
                <span className="text-[10px] font-bold text-indigo-400/90 tracking-widest uppercase mb-2">
                  {s.step}
                </span>

                {/* Card Title */}
                <h3 className="text-base font-bold text-white mb-2 tracking-tight group-hover:text-indigo-100 transition-colors">
                  {s.title}
                </h3>

                {/* Card Description */}
                <p className="text-[12.5px] text-slate-400 leading-relaxed font-normal">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
