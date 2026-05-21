"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gem, Settings, LogOut, ChevronDown } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useProfile } from '../hooks/useProfile';
import { useState } from 'react';

export default function Navbar() {
  const { login, logout, authenticated } = usePrivy();
  const { name, avatar, isVerifiedSeller, isConnected } = useProfile();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  console.log("Navbar Render - isVerifiedSeller:", isVerifiedSeller, "isConnected:", isConnected, "name:", name);

  return (
    <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg">
            <Gem className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-tight">Oktra</div>
            <div className="text-xs text-indigo-300 -mt-0.5">Premium Web3 Auctions</div>
          </div>
        </div>

        <nav className="hidden md:flex gap-8 items-center text-sm text-slate-300">
          <Link href="/explore" className="hover:text-white cursor-pointer">Explore</Link>
          <Link href="/explore" className="hover:text-white cursor-pointer">Auctions</Link>
          <Link href="/leaderboard" className="hover:text-white cursor-pointer">Leaderboard</Link>
          <Link href="/profile" className="hover:text-white cursor-pointer">Rewards</Link>
          {authenticated && isConnected && (
            isVerifiedSeller ? (
              <Link href="/seller/dashboard" className="hover:text-indigo-400 font-semibold cursor-pointer transition-colors">Seller Dashboard</Link>
            ) : (
              <Link href="/seller-onboarding" className="hover:text-indigo-400 font-semibold cursor-pointer transition-colors">Become a Seller</Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3 relative">
          {(authenticated && isConnected) ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/50 p-1 pr-4 transition-all hover:bg-slate-800/50"
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
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
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
            <>
              <button
                onClick={login}
                className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-800/40 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                Sign In
              </button>

              <button
                onClick={login}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_30px_rgba(99,102,241,0.12)] hover:from-indigo-500 hover:to-violet-500 transition-all"
              >
                Connect Wallet
              </button>
            </>
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
