"use client";

import { motion } from 'framer-motion';
import { useAuctions } from '../hooks/useAuctions';
import CollectibleCard from './CollectibleCard';

export default function LiveAuctionsPreview() {
  const { auctions } = useAuctions();
  const live = auctions.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-2xl font-bold">Live Auctions</h3>
        <div className="text-sm text-slate-400">Real-time bidding & hot items</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {live.map((a) => (
          <motion.div whileHover={{ y: -6 }} key={a.id} className="rounded-2xl overflow-hidden border border-slate-800/30 bg-slate-900/40">
            <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${a.image})` }} />
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-white">{a.title}</div>
                <div className="text-xs text-slate-400">{a.bidsCount} bids</div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm text-indigo-300 font-semibold">{a.currentBid.toFixed(2)} ETH</div>
                <div className="text-xs text-slate-400">Ends in {/* TODO: timer */}⏳</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
