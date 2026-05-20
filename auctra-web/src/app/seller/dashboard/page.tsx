'use client';

import LayoutWrapper from '../../../components/LayoutWrapper';
import { ChartPie, List, DollarSign, Activity, Package, Zap, Plus } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../../../../src/hooks/useRequireAuth';

export default function SellerDashboardPage() {
  useRequireAuth();
  const sellerListings = useAppStore((s) => s.sellerListings);
  const sellerBio = useAppStore((s) => s.sellerBio);
  const router = useRouter();

  const revenueMock = {
    total: 24.35,
    lastMonth: 8.2,
    lastWeek: 1.6
  };

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
                <div className="text-xs text-slate-400 font-semibold">Revenue</div>
                <div className="text-2xl font-extrabold text-white">{revenueMock.total.toFixed(2)} ETH</div>
                <div className="text-xs text-slate-500">Last month: {revenueMock.lastMonth.toFixed(2)} ETH</div>
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
                <div className="text-2xl font-extrabold text-white">{sellerListings.length}</div>
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
          <div className="lg:col-span-2 rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6">
            <h3 className="text-sm font-bold text-white mb-4">Recent Listings</h3>
            {sellerListings.length === 0 ? (
              <div className="text-slate-400 text-sm">No listings yet. Use "List New Item" to create your first auction.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {sellerListings.map((l) => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-800/20 bg-slate-950/20">
                    <div className="flex items-center gap-3">
                      <img src={l.image} alt={l.title} className="h-14 w-14 rounded-lg object-cover border" />
                      <div>
                        <div className="text-sm font-bold text-white">{l.title}</div>
                        <div className="text-xs text-slate-400">{l.creator} • {l.bidsCount} bids</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">{l.currentBid.toFixed(2)} ETH</div>
                      <div className="text-xs text-slate-500">Ends in: TBD</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6">
            <h3 className="text-sm font-bold text-white mb-4">Seller Profile</h3>
            <p className="text-xs text-slate-400 mb-4">{sellerBio || 'No bio configured.'}</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => router.push('/seller/list-new')} className="rounded-xl inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-sm font-bold">
                <Plus className="h-4 w-4" />
                List New Item
              </button>
              <button className="rounded-xl border border-slate-800 py-2 text-sm font-bold text-slate-300">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
