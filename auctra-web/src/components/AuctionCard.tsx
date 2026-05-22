'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Timer, ArrowUpRight } from 'lucide-react';
import { Auction } from '../types';
import { formatUsdAmount } from '@/lib/currency';

export default function AuctionCard({ auction }: { auction: Auction }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(auction.endsAt) - +new Date();
      if (difference <= 0) {
        setTimeLeft('Auction Ended');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setTimeLeft(parts.join(' '));
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction.endsAt]);

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
      {/* Image Container with Zoom */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-950/20">
        <motion.img
          src={auction.image}
          alt={auction.title}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full w-full object-cover object-center"
        />

        {/* Live Timer */}
        <div className="absolute bottom-4 left-4 z-10">
          <span className="flex items-center gap-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/5 px-3 py-1.5 text-xs font-bold text-slate-200">
            <Timer className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            {timeLeft}
          </span>
        </div>

        {/* XP Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="rounded-xl bg-indigo-950/80 backdrop-blur-md border border-indigo-500/20 px-3 py-1.5 text-[10px] font-bold text-indigo-400">
            +{auction.xpReward} Reputation XP
          </span>
        </div>
      </div>

      {/* Details Area */}
      <div className="flex flex-col p-6 justify-between flex-1">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            {auction.creator}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-white mt-1 mb-3 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {auction.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-5">
            {auction.description}
          </p>
        </div>

        {/* Bid Row */}
        <div className="flex items-center justify-between border-t border-slate-800/30 pt-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Current Bid</span>
            <span className="text-lg font-extrabold text-white">
              {formatUsdAmount(auction.currentBid)}
            </span>
          </div>

          <Link href={`/explore/${auction.id}`}>
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-semibold text-xs text-white hover:from-indigo-500 hover:to-violet-500 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
            >
              Bid Now
              <ArrowUpRight className="h-3.5 w-3.5" />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
