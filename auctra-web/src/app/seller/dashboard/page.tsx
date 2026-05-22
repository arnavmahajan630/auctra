'use client';

import { useState, useEffect } from 'react';
import LayoutWrapper from '../../../components/LayoutWrapper';
import { ChartPie, List, DollarSign, Activity, Package, Zap, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../../../../src/hooks/useRequireAuth';
import { useProfile } from '../../../../src/hooks/useProfile';
import { supabase } from '@/server/supabase';
import { cn } from '@/lib/utils';
import { formatUsdAmount } from '@/lib/currency';

type TabType = 'Live' | 'Pending' | 'Paid' | 'Unsold';

export default function SellerDashboardPage() {
  useRequireAuth();
  const { profileId, bio } = useProfile();
  const router = useRouter();
  const [sellerListings, setSellerListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('Live');

  const getEffectiveStatus = (auction: any) => {
    const isEnded = new Date(auction.ends_at).getTime() <= Date.now();
    const hasBids = auction.total_bids > 0;
    const claims = Array.isArray(auction.claims)
      ? auction.claims
      : auction.claims
        ? [auction.claims]
        : [];
    const paidClaim = claims.find((c: any) => ['paid', 'minted'].includes(c.claim_status));
    const hasClaim = claims.length > 0;
    const isPast24h = Date.now() > new Date(auction.ends_at).getTime() + 24 * 60 * 60 * 1000;

    if (!isEnded) return 'Live';
    if (paidClaim) return 'Paid';
    if (isEnded && hasBids && !paidClaim && !isPast24h) return 'Pending';
    return 'Unsold';
  };

  useEffect(() => {
    if (!profileId) return;
    
    const fetchListings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('auctions')
        .select('*, claims(*)')
        .eq('seller_id', profileId)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setSellerListings(data);
      }
      setLoading(false);
    };
    
    fetchListings();
  }, [profileId]);

  // Calculate Revenue (Only paid items, deduct 2% fee)
  const revenueTotal = sellerListings
    .filter(l => getEffectiveStatus(l) === 'Paid')
    .reduce((acc, curr) => acc + (Number(curr.current_price) * 0.98), 0);

  // Calculate Active Listings
  const activeCount = sellerListings.filter(l => getEffectiveStatus(l) === 'Live').length;

  const filteredListings = sellerListings.filter(l => getEffectiveStatus(l) === activeTab);

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Seller Dashboard</h1>
            <p className="text-sm text-slate-400 mt-2">Manage listings, monitor revenue, and view bid activity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div className="rounded-2xl p-6 bg-gradient-to-b from-slate-900/40 to-[#07101a]/40 border border-slate-800/40" whileHover={{ y: -4 }}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-950/40 p-3">
                <DollarSign className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold">Revenue (Post-Fee)</div>
                <div className="text-2xl font-extrabold text-white">{formatUsdAmount(revenueTotal)}</div>
                <div className="text-xs text-slate-500">Last month: {formatUsdAmount(8200)}</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="rounded-2xl p-6 bg-gradient-to-b from-slate-900/40 to-[#07101a]/40 border border-slate-800/40" whileHover={{ y: -4 }}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-950/40 p-3">
                <Activity className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold">Active Listings</div>
                <div className="text-2xl font-extrabold text-white">{activeCount}</div>
                <div className="text-xs text-slate-500">Live auctions currently managed</div>
              </div>
            </div>
          </motion.div>

          <motion.div className="rounded-2xl p-6 bg-gradient-to-b from-slate-900/40 to-[#07101a]/40 border border-slate-800/40" whileHover={{ y: -4 }}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-950/40 p-3">
                <ChartPie className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold">Engagement</div>
                <div className="text-2xl font-extrabold text-white">+12%</div>
                <div className="text-xs text-slate-500">This week vs last week</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Listings</h3>
              <div className="flex gap-2 rounded-full border border-slate-800 bg-slate-900/50 p-1">
                {(['Live', 'Pending', 'Paid', 'Unsold'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                      activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                    )}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTabSeller"
                        className="absolute inset-0 rounded-full bg-slate-800"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{tab}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <Package className="h-12 w-12 mb-4 opacity-50" />
                  <p>No {activeTab.toLowerCase()} listings found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredListings.map((l) => {
                      const status = getEffectiveStatus(l);
                      let statusText = '';
                      let statusColor = '';

                      if (status === 'Live') {
                        statusText = `Live • Ends: ${new Date(l.ends_at).toLocaleDateString()}`;
                        statusColor = 'text-green-400';
                      } else if (status === 'Pending') {
                        const timeLeft = (new Date(l.ends_at).getTime() + 24 * 60 * 60 * 1000) - Date.now();
                        const hours = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));
                        statusText = `Pending Claim • ${hours}h left`;
                        statusColor = 'text-yellow-400';
                      } else if (status === 'Paid') {
                        statusText = `Paid • Revenue: ${formatUsdAmount(Number(l.current_price) * 0.98)}`;
                        statusColor = 'text-indigo-400';
                      } else {
                        statusText = `Unsold • ${l.total_bids} bids`;
                        statusColor = 'text-slate-500';
                      }

                      return (
                        <motion.div
                          key={l.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-between p-4 rounded-xl border border-slate-800/30 bg-slate-900 hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <img src={l.image_url} alt={l.title} className="h-16 w-16 rounded-lg object-cover border border-slate-800" />
                            <div>
                              <div className="text-base font-bold text-white mb-1">{l.title}</div>
                              <div className={cn("text-xs font-semibold flex items-center gap-1.5", statusColor)}>
                                {status === 'Live' && <Zap className="h-3 w-3" />}
                                {status === 'Pending' && <Clock className="h-3 w-3" />}
                                {status === 'Paid' && <CheckCircle2 className="h-3 w-3" />}
                                {statusText}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-black text-white">{formatUsdAmount(l.current_price)}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {l.total_bids} Bids total
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6 h-fit">
            <h3 className="text-sm font-bold text-white mb-4">Seller Profile</h3>
            <p className="text-xs text-slate-400 mb-4">{bio || 'No bio configured.'}</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => router.push('/seller/list-new')} className="rounded-xl inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold hover:from-indigo-500 hover:to-violet-500 transition-all active:scale-95 text-white">
                <Plus className="h-4 w-4" />
                List New Item
              </button>
              <button className="rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 py-3 text-sm font-bold text-slate-300 transition-all active:scale-95">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
