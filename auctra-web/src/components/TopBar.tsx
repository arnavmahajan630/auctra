'use client';

import { Search, HelpCircle, Bell, Wallet, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCollectibles } from '../hooks/useCollectibles';
import { useAppStore } from '../store/useAppStore';

export default function TopBar() {
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useAuth();
  const { reputationXP } = useCollectibles();
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);

  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-10 flex h-20 w-full items-center justify-between border-b border-slate-800/20 bg-[#060A13]/85 backdrop-blur-md px-4 sm:px-8 text-white">
      {/* Left side: Hamburger menu for mobile & Search Input Box */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => toggleMobileMenu()}
          className="lg:hidden flex items-center justify-center p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-96 max-w-md hidden sm:block">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search artifacts, wallets, or events..."
            className="w-full rounded-full border border-slate-800/50 bg-slate-950/40 py-2.5 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-slate-950/80 focus:ring-1 focus:ring-indigo-500/40"
          />
        </div>
      </div>

      {/* Right Header Navigation */}
      <div className="flex items-center gap-5">
        <button
          className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Help & Documentation"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <button
          className="relative rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
        </button>

        <div className="h-6 w-px bg-slate-800/40" />

        {!isConnected ? (
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
          >
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-500/25 bg-indigo-950/30 px-4 py-2 text-xs font-semibold text-indigo-400">
              <span>{reputationXP} XP</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-950/60 pl-4 pr-1 py-1.5 text-sm font-semibold hover:border-slate-700 transition-all">
              <span className="text-slate-300 font-mono text-xs">{formatAddress(walletAddress)}</span>
              <button
                onClick={disconnectWallet}
                className="rounded-lg bg-slate-900/50 hover:bg-red-950/30 p-1.5 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                title="Disconnect Wallet"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-md flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=faces"
                alt="Profile avatar"
                className="h-full w-full rounded-full border border-black object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
