'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Compass, 
  Trophy, 
  Gem, 
  Settings, 
  User, 
  Wallet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
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
    <aside 
      className={`fixed inset-y-0 left-0 z-20 flex flex-col justify-between border-r border-slate-800/40 bg-[#060A13] py-8 text-white select-none transition-[width] duration-300 ease-in-out ${isCollapsed ? 'w-20 px-4' : 'w-72 px-6'}`}
    >
      {/* Top Brand Logo & Toggle */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`flex items-center ${isCollapsed ? 'justify-center flex-col gap-4' : 'justify-between'} mb-8`}
      >
        <Link href="/" className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
          >
            <Gem className="h-5 w-5 text-white" />
          </motion.div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex flex-col whitespace-nowrap overflow-hidden"
            >
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Oktra
              </span>
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">
                Premium Web3 Auctions
              </span>
            </motion.div>
          )}
        </Link>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors ${isCollapsed ? '' : ''}`}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </motion.div>

      {/* Nav Menu Items */}
      <nav className="flex flex-col gap-2 flex-1 relative">
        {navItems.map((item, idx) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-4'} py-3.5 rounded-xl font-medium text-sm transition-colors duration-200 group`}
              title={isCollapsed ? item.name : undefined}
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
              {!isCollapsed && (
                <span className={`z-10 ml-4 whitespace-nowrap transition-colors duration-200 ${isActive ? 'text-indigo-300 font-semibold' : 'text-slate-400 group-hover:text-white'}`}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className={`flex flex-col gap-4 pt-6 border-t border-slate-800/40 ${isCollapsed ? 'items-center' : ''}`}>
        {!isConnected ? (
          <motion.button
            onClick={connectWallet}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? "Connect Wallet" : undefined}
            className={`relative overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-200 cursor-pointer group ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-3.5'}`}
          >
            {/* Shimmer sweep effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Wallet className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>Connect Wallet</span>}
          </motion.button>
        ) : isVerifiedSeller ? (
          <Link
            href="/seller/list-new"
            title={isCollapsed ? "Create Auction" : undefined}
            className={`flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 font-semibold text-sm hover:bg-indigo-950/40 text-indigo-400 transition-all duration-200 ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-3.5'}`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400 animate-pulse" />
            {!isCollapsed && <span className="whitespace-nowrap">Create Auction</span>}
          </Link>
        ) : (
          <motion.button
            onClick={() => router.push('/seller-onboarding')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={isCollapsed ? "Become a Seller" : undefined}
            className={`flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-white/5 font-semibold text-sm hover:bg-white/10 hover:border-slate-700 text-slate-200 transition-all duration-200 cursor-pointer ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-3.5'}`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">Become a Seller</span>}
          </motion.button>
        )}

        {/* Profile / Account link */}
        <Link
          href="/profile"
          title={isCollapsed ? (isConnected ? (name || 'Account') : 'Profile') : undefined}
          className={`flex items-center gap-3 rounded-xl font-medium text-sm transition-all duration-200 hover:bg-white/5 ${
            pathname === '/profile' ? 'text-white' : 'text-slate-400 hover:text-white'
          } ${isCollapsed ? 'justify-center p-1 mt-2' : 'px-4 py-2.5'}`}
        >
          {isConnected ? (
            <div className={`rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-md flex-shrink-0 ${isCollapsed ? 'h-8 w-8' : 'h-8 w-8'}`}>
              <img
                src={avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"}
                alt="Profile avatar"
                className="h-full w-full rounded-full border border-black object-cover"
              />
            </div>
          ) : (
            <User className="h-5 w-5 shrink-0" />
          )}
          {!isCollapsed && (
            <span className="truncate whitespace-nowrap">
              {isConnected ? (name || 'Account') : 'Profile'}
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
