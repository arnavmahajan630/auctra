"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogOut, ChevronDown, Gem } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useProfile } from '../hooks/useProfile';
import { useState } from 'react';

export default function Navbar() {
  const { login, logout, authenticated } = usePrivy();
  const { name, avatar, isVerifiedSeller, isConnected } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-white font-bold text-xl tracking-tight">Oktra</div>
        </div>

        {/* Links */}
        <nav className="hidden md:flex gap-8 items-center text-sm font-medium text-slate-400">
          <Link href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">How it Works</Link>
          <Link href="#features" className="hover:text-white transition-colors cursor-pointer">Features</Link>
          <Link href="#treasury" className="hover:text-white transition-colors cursor-pointer">Treasury</Link>
          <Link href="#faq" className="hover:text-white transition-colors cursor-pointer">FAQ</Link>
        </nav>

        {/* Auth / Actions */}
        <div className="flex items-center gap-3 relative">
          {(authenticated && isConnected) ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/50 p-1 pr-4 transition-all hover:bg-slate-800/80"
              >
                <img 
                  src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} 
                  alt="Avatar" 
                  className="h-8 w-8 rounded-full object-cover border border-slate-700"
                />
                <span className="text-sm font-semibold text-white">{name}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-[#05050a] p-2 shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-slate-800 mb-2">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{name}</p>
                  </div>
                  
                  {isVerifiedSeller ? (
                    <Link href="/seller/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => setDropdownOpen(false)}>
                      <Gem className="h-4 w-4 text-indigo-400" />
                      Seller Dashboard
                    </Link>
                  ) : (
                    <Link href="/seller-onboarding" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white" onClick={() => setDropdownOpen(false)}>
                      <Gem className="h-4 w-4 text-slate-400" />
                      Become a Seller
                    </Link>
                  )}
                  
                  <button 
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={login}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-800 px-5 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition-all hover:text-white hover:border-slate-700 shadow-sm"
            >
              Connect Wallet
            </button>
          )}

          <button
            className="ml-2 text-slate-400 md:hidden"
            aria-label="menu"
          >
            ☰
          </button>
        </div>
      </div>
    </motion.header>
  );
}
