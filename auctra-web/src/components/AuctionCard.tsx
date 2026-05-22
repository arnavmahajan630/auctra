'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Timer, ArrowUpRight } from 'lucide-react';
import { Auction } from '../types';

export default function AuctionCard({ auction }: { auction: Auction }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isEndingSoon, setIsEndingSoon] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(auction.endsAt) - +new Date();
      if (difference <= 0) {
        setTimeLeft('Ended');
        setIsUrgent(false);
        setIsEndingSoon(false);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Urgency states: urgent is < 24 hours, ending soon is < 1 hour
      if (days === 0) {
        setIsUrgent(true);
        if (hours === 0) {
          setIsEndingSoon(true);
        } else {
          setIsEndingSoon(false);
        }
      } else {
        setIsUrgent(false);
        setIsEndingSoon(false);
      }

      const parts: string[] = [];
      if (days > 0) {
        parts.push(`${days}d`);
        parts.push(`${hours}h`);
        parts.push(`${minutes}m`);
        parts.push(`${seconds}s`);
        setTimeLeft(parts.join(' '));
      } else {
        // High Urgency: digital stop-clock HH:MM:SS format
        const pad = (num: number) => String(num).padStart(2, '0');
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction.endsAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ 
        duration: 0.45, 
        ease: [0.16, 1, 0.3, 1],
        y: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-800/40 bg-[#080d19]/45 backdrop-blur-md group transition-all duration-300 hover:border-indigo-500/45 hover:shadow-[0_20px_45px_rgba(99,102,241,0.12)] select-none"
    >
      {/* Image Container with Zoom */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950/20">
        <motion.img
          src={auction.image}
          alt={auction.title}
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover object-center"
        />

        {/* Dynamic Urgency Glow Live Timer */}
        <div className="absolute bottom-4 left-4 z-10">
          <span 
            className={`flex items-center gap-1.5 rounded-xl backdrop-blur-md px-3.5 py-2 text-xs font-bold font-mono tracking-wide border transition-all duration-300 ${
              isEndingSoon 
                ? 'bg-rose-950/70 border-rose-500/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.45)]'
                : isUrgent
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse'
                : 'bg-black/65 border-slate-700/45 text-slate-200 hover:border-indigo-500/30 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
            }`}
          >
            {isEndingSoon ? (
              <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping mr-0.5" />
            ) : isUrgent ? (
              <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
            ) : (
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse mr-0.5" />
            )}
            
            <Timer className={`h-3.5 w-3.5 ${
              isEndingSoon ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-indigo-400'
            }`} />
            
            <span className={isEndingSoon ? 'animate-pulse' : ''}>
              {isEndingSoon ? `Ending Soon: ${timeLeft}` : timeLeft}
            </span>
          </span>
        </div>

        {/* Reputation XP Reward Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="rounded-xl bg-indigo-950/85 backdrop-blur-md border border-indigo-500/25 px-3 py-1.5 text-[10px] font-extrabold text-indigo-400 shadow-sm">
            +{auction.xpReward} XP
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="flex flex-col p-6 justify-between flex-1">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            {auction.creator}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-white mt-1 mb-2.5 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {auction.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-5">
            {auction.description}
          </p>
        </div>

        {/* Bid Row */}
        <div className="flex items-center justify-between border-t border-slate-900/60 pt-5 mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Bid</span>
            <span className="text-lg font-black text-white leading-tight">
              {auction.currentBid.toFixed(2)} <span className="text-xs font-semibold text-indigo-400">ETH</span>
            </span>
          </div>

          <Link href={`/explore/${auction.id}`}>
            <motion.span
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-bold text-xs text-white hover:from-indigo-500 hover:to-violet-500 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all cursor-pointer group-hover:shadow-[0_4px_20px_rgba(79,70,229,0.5)]"
            >
              Bid Now
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
