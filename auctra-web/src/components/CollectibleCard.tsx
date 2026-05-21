'use client';

import { motion } from 'framer-motion';
import { Zap, CheckCircle2 } from 'lucide-react';
import { Collectible } from '../types';

interface CollectibleCardProps {
  collectible: Collectible;
  variant?: 'large' | 'standard';
}

export default function CollectibleCard({ collectible, variant = 'standard' }: CollectibleCardProps) {
  if (variant === 'large') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.16, 1, 0.3, 1],
          y: { type: 'spring', stiffness: 260, damping: 25 }
        }}
        className="relative flex flex-col justify-end overflow-hidden rounded-3xl border border-slate-800/40 bg-gradient-to-b from-slate-900/30 to-[#0B0F19]/90 h-[560px] group transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_20px_50px_rgba(99,102,241,0.15)]"
      >
        {/* Full Card Image Background with Hover Zoom */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.img
            src={collectible.image}
            alt={collectible.title}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/30 to-transparent" />
        </div>

        {/* Minted Badge */}
        <div className="absolute top-5 right-5 z-10">
          <span className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest text-indigo-300 uppercase">
            <CheckCircle2 className="h-3 w-3 text-indigo-400" />
            Minted On-Chain
          </span>
        </div>

        {/* Content Overlay */}
        <div className="p-6">
          <h3 className="text-2xl font-bold tracking-tight text-white mb-5">
            {collectible.title}
          </h3>

          <div className="flex items-center justify-between border-t border-slate-800/50 pt-5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Acquisition</span>
              <span className="text-sm font-semibold text-slate-200">Won for {collectible.wonPrice.toFixed(4)} ETH</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Yield</span>
              <span className="flex items-center gap-1 text-sm font-bold text-indigo-400">
                <Zap className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                +{collectible.xpReward} Reputation XP
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Standard Card Layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        y: { type: 'spring', stiffness: 280, damping: 22 }
      }}
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-800/40 bg-slate-900/50 group transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_15px_30px_rgba(99,102,241,0.08)]"
    >
      {/* Asset Image Container with Zoom */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950/20">
        <motion.img
          src={collectible.image}
          alt={collectible.title}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover object-center"
        />

        {/* Minted Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-md border border-white/5 px-2.5 py-1 text-[9px] font-bold tracking-wider text-indigo-300 uppercase">
            Minted On-Chain
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="flex flex-col p-5 justify-between flex-1">
        <h4 className="text-base font-bold tracking-tight text-white mb-4 truncate">
          {collectible.title}
        </h4>

        <div className="flex items-center justify-between border-t border-slate-800/30 pt-4">
          <span className="text-xs text-slate-400">
            Won for <span className="font-semibold text-slate-200">{collectible.wonPrice.toFixed(4)} ETH</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-teal-400">
            <Zap className="h-3 w-3 text-teal-400 animate-pulse" />
            +{collectible.xpReward} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
}
