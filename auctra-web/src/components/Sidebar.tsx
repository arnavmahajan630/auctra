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
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSeller } from '../hooks/useSeller';
import { useAppStore } from '../store/useAppStore';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, connectWallet } = useAuth();
  const { isSeller } = useSeller();

  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Auctions', href: '/explore', icon: Compass },
    { name: 'Global Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Collectibles & Rewards', href: '/profile', icon: Gem },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Extend nav for sellers
  if (isSeller) {
    navItems.splice(1, 0, { name: 'Seller Dashboard', href: '/seller/dashboard', icon: ShieldCheck });
  }

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-slate-900/90 bg-[#060A13]/95 backdrop-blur-xl py-8 text-white select-none transition-all duration-300 ease-out shadow-[4px_0_30px_rgba(0,0,0,0.6)] ${
        sidebarCollapsed ? 'lg:w-20 lg:px-3' : 'lg:w-72 lg:px-6'
      } ${
        mobileMenuOpen ? 'translate-x-0 w-72 px-6' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Brand Logo & Toggle */}
      <div className={`flex items-center justify-between ${sidebarCollapsed ? 'lg:flex-col lg:gap-5' : 'flex-row px-2'}`}>
        <Link href="/" className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-[0_0_15px_rgba(79,70,229,0.5)] flex-shrink-0 animate-pulse duration-[5000ms]"
          >
            <Gem className="h-5 w-5 text-white" />
          </motion.div>
          <div className={`flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Oktra
            </span>
            <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-semibold leading-none mt-0.5">
              Auctions
            </span>
          </div>
        </Link>

        {/* Desktop Toggle Collapse Button */}
        <button 
          onClick={toggleSidebar} 
          className="hidden lg:flex items-center justify-center h-6 w-6 rounded-full bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-slate-400 hover:text-white transition-all duration-200 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className={`flex flex-col gap-2 mt-10 flex-1 relative ${sidebarCollapsed ? 'lg:items-center' : ''}`}>
        {navItems.map((item, idx) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard' || pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => toggleMobileMenu(false)}
              className={`relative flex items-center rounded-xl font-medium text-sm transition-all duration-200 group w-full ${
                sidebarCollapsed ? 'lg:justify-center lg:px-0 lg:py-3.5' : 'px-4 py-3.5 gap-4'
              }`}
            >
              {/* Active Tab Sliding Background Glider (Linear Style layoutId) */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarIndicator"
                  className="absolute inset-0 bg-indigo-900/30 border border-indigo-500/30 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              
              <item.icon className={`h-5 w-5 flex-shrink-0 z-10 transition-colors duration-200 ${
                isActive ? 'text-indigo-300' : 'text-slate-400 group-hover:text-white'
              }`} />
              <span className={`z-10 transition-colors duration-200 ${
                sidebarCollapsed ? 'lg:hidden' : 'block'
              } ${isActive ? 'text-indigo-300 font-semibold' : 'text-slate-400 group-hover:text-white'}`}>
                {item.name}
              </span>

              {/* Tooltip on Hover when Collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950/95 border border-indigo-500/20 text-white rounded-lg opacity-0 scale-95 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 text-xs font-semibold whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.15)] z-50 hidden lg:block">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Actions */}
      <div className={`flex flex-col gap-4 pt-6 border-t border-slate-900/60 ${sidebarCollapsed ? 'lg:items-center' : ''}`}>
        {!isConnected ? (
          <motion.button
            onClick={connectWallet}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 font-semibold text-sm hover:from-indigo-500 hover:to-violet-500 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-200 cursor-pointer group w-full ${
              sidebarCollapsed ? 'lg:px-0 lg:w-12 lg:h-12' : ''
            }`}
          >
            <Wallet className="h-4 w-4 flex-shrink-0 z-10" />
            <span className={`${sidebarCollapsed ? 'lg:hidden' : 'block z-10'}`}>Connect Wallet</span>
            
            {/* Tooltip */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 border border-indigo-500/20 text-white rounded-lg opacity-0 scale-95 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 text-xs font-semibold whitespace-nowrap shadow-xl z-50 hidden lg:block">
                Connect Wallet
              </div>
            )}
          </motion.button>
        ) : isSeller ? (
          <Link
            href="/dashboard"
            onClick={() => toggleMobileMenu(false)}
            className={`flex items-center justify-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-950/20 py-3.5 font-semibold text-sm hover:bg-indigo-950/40 text-indigo-400 transition-all duration-200 group w-full ${
              sidebarCollapsed ? 'lg:w-12 lg:h-12' : ''
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-indigo-400 animate-pulse flex-shrink-0" />
            <span className={`${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>Elite Seller</span>
            
            {/* Tooltip */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 border border-indigo-500/20 text-white rounded-lg opacity-0 scale-95 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 text-xs font-semibold whitespace-nowrap shadow-xl z-50 hidden lg:block">
                Elite Seller Verified
              </div>
            )}
          </Link>
        ) : (
          <motion.button
            onClick={() => { router.push('/seller-onboarding'); toggleMobileMenu(false); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-white/5 py-3.5 font-semibold text-sm hover:bg-white/10 hover:border-slate-700 text-slate-200 transition-all duration-200 cursor-pointer group w-full ${
              sidebarCollapsed ? 'lg:px-0 lg:w-12 lg:h-12' : ''
            }`}
          >
            <ShieldCheck className="h-4 w-4 flex-shrink-0" />
            <span className={`${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>Become Seller</span>
            
            {/* Tooltip */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 border border-indigo-500/20 text-white rounded-lg opacity-0 scale-95 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 text-xs font-semibold whitespace-nowrap shadow-xl z-50 hidden lg:block">
                Become a Seller
              </div>
            )}
          </motion.button>
        )}

        {/* Profile / Account link */}
        <Link
          href="/profile"
          onClick={() => toggleMobileMenu(false)}
          className={`flex items-center rounded-xl font-medium text-sm transition-all duration-200 hover:bg-white/5 group w-full ${
            pathname === '/profile' ? 'text-white' : 'text-slate-400 hover:text-white'
          } ${sidebarCollapsed ? 'lg:justify-center lg:py-2' : 'px-4 py-2.5 gap-3'}`}
        >
          {isConnected ? (
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-md flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=faces"
                alt="Profile avatar"
                className="h-full w-full rounded-full border border-black object-cover"
              />
            </div>
          ) : (
            <User className="h-5 w-5 text-slate-400 flex-shrink-0" />
          )}
          <span className={`truncate ${sidebarCollapsed ? 'lg:hidden' : 'block'}`}>
            {isConnected ? 'Account' : 'Profile'}
          </span>
          
          {/* Tooltip */}
          {sidebarCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 border border-indigo-500/20 text-white rounded-lg opacity-0 scale-95 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-200 text-xs font-semibold whitespace-nowrap shadow-xl z-50 hidden lg:block">
              {isConnected ? 'Account Details' : 'View Profile'}
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
