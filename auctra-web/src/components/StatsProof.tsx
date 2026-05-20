"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function useCount(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(10, Math.floor(duration / target));
    const t = setInterval(() => {
      start += Math.max(1, Math.floor(target / 60));
      if (start >= target) {
        setValue(target);
        clearInterval(t);
      } else {
        setValue(start);
      }
    }, step);
    return () => clearInterval(t);
  }, [target, duration]);
  return value;
}

export default function StatsProof() {
  const auctions = useCount(342);
  const collectors = useCount(12513);
  const claimed = useCount(8921);
  const volume = useCount(784);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="rounded-2xl p-6 bg-slate-900/40 border border-slate-800/30 text-center">
          <div className="text-sm text-slate-400">Total Auctions</div>
          <div className="text-2xl font-bold text-white">{auctions}</div>
        </div>
        <div className="rounded-2xl p-6 bg-slate-900/40 border border-slate-800/30 text-center">
          <div className="text-sm text-slate-400">Active Collectors</div>
          <div className="text-2xl font-bold text-white">{collectors}</div>
        </div>
        <div className="rounded-2xl p-6 bg-slate-900/40 border border-slate-800/30 text-center">
          <div className="text-sm text-slate-400">NFTs Claimed</div>
          <div className="text-2xl font-bold text-white">{claimed}</div>
        </div>
        <div className="rounded-2xl p-6 bg-slate-900/40 border border-slate-800/30 text-center">
          <div className="text-sm text-slate-400">Total ETH Volume</div>
          <div className="text-2xl font-bold text-white">{volume}k ETH</div>
        </div>
      </div>
    </section>
  );
}
