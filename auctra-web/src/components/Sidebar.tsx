'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Compass, 
  Trophy, 
  Gem, 
  Settings, 
  User, 
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, connectWallet } = useAuth();
  const { isVerifiedSeller, name, avatar } = useProfile();

  const navItems = [
    { name: 'Explore Auctions', href: '/explore', icon: Compass },
    { name: 'Global Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Collectibles & Rewards', href: '/dashboard', icon: Gem },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Extend nav for sellers
  if (isVerifiedSeller) {
    navItems.splice(0, 0, { name: 'Seller Dashboard', href: '/seller/dashboard', icon: ShieldCheck });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col justify-between border-r border-slate-800/40 bg-[#060A13] px-6 py-8 text-white select-none">
      {/* Top Brand Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-1.5"
      >
        <Link href="/" className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
          >
            <Gem className="h-5 w-5 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Oktra
            </span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
              Premium Web3 Auctions
            </span>
          </div>
        </Link>
      </motion.div>

      {/* Nav Menu Items */}
      <nav className="flex flex-col gap-2 mt-8 flex-1 relative">
  {navItems.map((item, idx) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium text-sm transition-colors duration-200 group"
            >
              {/* Active Tab Sliding Background Glider (Linear Style layoutId) */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-indigo-900/30 border border-indigo-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <item.icon className={`h-5 w-5 flex-shrink-0 z-10 transition-colors duration-200 ${isActive ? 'text-indigo-300' : 'text-slate-400 group-hover:text-white'}`} />
              <span className={`z-10 transition-colors duration-200 ${isActive ? 'text-indigo-300 font-semibold' : 'text-slate-400 group-hover:text-white'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className="flex flex-col gap-4 pt-6 border-t border-slate-800/40">
        {!isConnected ? (
          <motion.button
            onClick={connectWallet}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-200 cursor-pointer group"
          >
            {/* Shimmer sweep effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </motion.button>
        ) : isVerifiedSeller ? (
          <Link
            href="/seller/list-new"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 py-3.5 font-semibold text-sm hover:bg-indigo-950/40 text-indigo-400 transition-all duration-200"
          >
            <ShieldCheck className="h-4 w-4 text-indigo-400 animate-pulse" />
            Create Auction
          </Link>
        ) : (
          <motion.button
            onClick={() => router.push('/seller-onboarding')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-white/5 py-3.5 font-semibold text-sm hover:bg-white/10 hover:border-slate-700 text-slate-200 transition-all duration-200 cursor-pointer"
          >
            Become a Seller
          </motion.button>
        )}

        {/* Profile / Account link */}
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-white/5 ${
            pathname === '/profile' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isConnected ? (
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-md flex-shrink-0">
              <img
                src={avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
                alt="Profile avatar"
                className="h-full w-full rounded-full border border-black object-cover"
              />
            </div>
          ) : (
            <User className="h-5 w-5 text-slate-400 flex-shrink-0" />
          )}
          <span className="truncate">
            {isConnected ? (name || 'Account') : 'Profile'}
          </span>
        </Link>
      </div>
    </aside>
  );
}
