"use client";

import { Sparkles, ShieldCheck, Zap, Clock, Users, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { title: 'Secure On-Chain Auctions', icon: ShieldCheck, desc: 'Backend-signed settlement & verified minting.' },
  { title: 'NFT Ownership Verification', icon: Sparkles, desc: 'Immutable proofs of ownership and provenance.' },
  { title: 'Reputation & XP', icon: Zap, desc: 'Earn XP and climb leaderboards.' },
  { title: 'Seller Verification', icon: ShieldCheck, desc: 'Premium seller badges and trust signals.' },
  { title: 'Real-Time Bidding', icon: Clock, desc: 'Milliseconds-level bidding feedback.' },
  { title: 'Claimable Rewards', icon: Gift, desc: 'Pay & claim winning NFTs seamlessly.' }
];

export default function FeaturesGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h3 className="text-white text-2xl font-bold mb-6">Platform Features</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <motion.div whileHover={{ scale: 1.02 }} key={f.title} className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/40 to-[#061026]/40 border border-slate-800/30">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-indigo-900/30 text-indigo-300">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-white font-bold">{f.title}</div>
                <div className="text-slate-400 text-sm mt-1">{f.desc}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
