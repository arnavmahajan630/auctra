"use client";

import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function Navbar() {
  const openAuth = useAppStore((s) => s.openAuthModal);
  const isConnected = useAppStore((s) => s.isConnected);
  const walletAddress = useAppStore((s) => s.walletAddress);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-slate-900/60 bg-slate-950/45 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-xl font-bold tracking-tight text-white select-none group-hover:text-indigo-400 transition-colors duration-300">Oktra</span>
        </div>

        {/* CENTER: Links with interactive hover underscores */}
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('the-mechanics')}
            className="relative py-1 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none group"
          >
            How it Works
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </button>
          <button
            onClick={() => scrollToSection('technical-superiority')}
            className="relative py-1 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none group"
          >
            Features
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </button>
          <button
            onClick={() => scrollToSection('technical-superiority')}
            className="relative py-1 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none group"
          >
            Treasury
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </button>
          <button
            onClick={() => scrollToSection('cta-banner')}
            className="relative py-1 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 cursor-pointer bg-transparent border-none group"
          >
            FAQ
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </button>
        </nav>

        {/* RIGHT: Connect Wallet */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => openAuth(isConnected ? 'Manage your connected wallet' : 'Connect your Web3 wallet to begin')}
            className="relative px-5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 border border-slate-800 hover:border-indigo-500/40 hover:bg-[#111827] shadow-[0_0_15px_rgba(99,102,241,0.05)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-300 active:scale-95 cursor-pointer"
          >
            {isConnected && walletAddress ? (
              <span className="font-mono text-indigo-300">{walletAddress}</span>
            ) : (
              'Connect Wallet'
            )}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
