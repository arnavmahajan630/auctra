import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Hexagon, ExternalLink } from 'lucide-react';
import { Collectible } from '../types';

interface NFTBadgeCardProps {
  collectible: Collectible;
  variant?: 'large' | 'standard';
}

export default function NFTBadgeCard({ collectible, variant = 'standard' }: NFTBadgeCardProps) {
  const isLarge = variant === 'large';
  const badgeId = collectible.tokenId !== undefined ? `#${collectible.tokenId.toString().padStart(4, '0')}` : '#PENDING';

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
      className={`flex flex-col overflow-hidden rounded-3xl border border-indigo-500/20 bg-slate-900/50 group transition-all duration-300 hover:border-indigo-500/40 hover:shadow-[0_15px_30px_rgba(99,102,241,0.08)] relative ${isLarge ? 'h-full min-h-[400px]' : ''}`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-teal-500/5 pointer-events-none" />

      {/* Graphic Container */}
      <div className={`relative w-full flex items-center justify-center bg-slate-950/40 p-8 ${isLarge ? 'h-64' : 'h-48'}`}>
        <motion.div 
          className="relative"
          whileHover={{ rotate: 5, scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Hexagon className={`text-indigo-500/20 fill-indigo-500/10 ${isLarge ? 'w-40 h-40' : 'w-32 h-32'}`} strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <Zap className={`text-indigo-400 ${isLarge ? 'w-12 h-12 mb-2' : 'w-8 h-8 mb-1'}`} />
            <span className="text-white font-bold tracking-widest text-xs uppercase opacity-80">Oktra</span>
          </div>
        </motion.div>

        {/* Badge ID Tag */}
        <div className="absolute top-4 right-4 z-10">
          <span className="flex items-center gap-1 rounded-full bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider text-indigo-300">
            {badgeId}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col p-5 justify-between flex-1 relative z-10 bg-slate-900/80 backdrop-blur-xl border-t border-indigo-500/10">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-1">
            Achievement Badge
          </h4>
          <h3 className={`${isLarge ? 'text-xl' : 'text-base'} font-bold tracking-tight text-white mb-4 truncate`}>
            {collectible.title}
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-t border-slate-800/30 pt-4">
            <span className="text-xs text-slate-500 font-medium">Yield</span>
            <span className="flex items-center gap-1 text-xs font-bold text-teal-400">
              <Zap className="h-3 w-3 text-teal-400 animate-pulse" />
              +{collectible.xpReward} XP
            </span>
          </div>

          <a 
            href={`https://sepolia.basescan.org/tx/${collectible.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors text-xs font-bold text-slate-300"
          >
            View on Basescan
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
