"use client";

import { motion } from 'framer-motion';

const steps = [
  { title: 'Connect Account', desc: 'Sign in with Google or connect your wallet.' },
  { title: 'Bid on Auctions', desc: 'Place live bids, outbid competitors, and win.' },
  { title: 'Claim NFT Rewards', desc: 'Pay settlement and claim verified NFTs.' }
];

export default function HowItWorks() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h3 className="text-white text-2xl font-bold mb-6">How It Works</h3>
      <div className="flex flex-col md:flex-row gap-6">
        {steps.map((s, idx) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.12 }} className="flex-1 rounded-2xl p-6 bg-slate-900/40 border border-slate-800/30">
            <div className="text-sm text-indigo-300 font-bold">Step {idx + 1}</div>
            <div className="text-white font-bold mt-2">{s.title}</div>
            <div className="text-slate-400 mt-2 text-sm">{s.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
