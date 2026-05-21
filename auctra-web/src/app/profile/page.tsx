'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Wallet, Gem, Zap, AlertCircle, ArrowUpRight, ShieldAlert, RefreshCw } from 'lucide-react';
import LayoutWrapper from '../../components/LayoutWrapper';
import { useAppStore } from '../../store/useAppStore';
import CollectibleCard from '../../components/CollectibleCard';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import useRequireAuth from '../../hooks/useRequireAuth';

type TabType = 'collectibles' | 'active-bids' | 'transactions' | 'claim-rewards';


import { usePrivy } from '@privy-io/react-auth';

export default function ProfilePage() {
  useRequireAuth();
  const { login } = usePrivy();
  const {
    isConnected,
    walletAddress,
    profileId,
    name,
    avatar,
    bio,
    reputationXP,
    multiplier,
    artifactsCount,
    level,
    rankTitle,
    collectibles,
    activeBids,
    activityLogs,
    loading,
    error
  } = useProfile();

  const [activeTab, setActiveTab] = useState<TabType>('collectibles');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'collectibles', label: 'Claimed Collectibles' },
    { id: 'active-bids', label: 'Active Live Bids' },
    { id: 'transactions', label: 'On-Chain Activity' },
    { id: 'claim-rewards', label: 'Claim Rewards' }
  ];

  const wonAuctions = useAppStore((s) => s.wonAuctions);
  const claimReward = useAppStore((s) => s.claimReward);
  const [processingClaim, setProcessingClaim] = useState<string | null>(null);

  return (
    <LayoutWrapper>
      {!isConnected ? (
        /* Disconnected state */
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900/50 border border-slate-800">
            <User className="h-10 w-10 text-slate-500" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">Connect Your Wallet</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-sm leading-relaxed">
            Connect your Web3 wallet to access your collector dashboard and on-chain assets.
          </p>
          <button
            onClick={login}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
          >
            <Wallet className="h-4 w-4" />
            Sign in
          </button>
        </div>
      ) : (
        /* Connected state */
        <div className="flex flex-col gap-6 animate-fade-in pb-12">
          


          {error && (
            /* Error banner */
            <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-400" />
                <span className="text-xs font-medium text-red-200">{error}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-900/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/40 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          )}

          {loading ? (
            /* Loading Skeleton State */
            <div className="flex flex-col gap-6 animate-pulse">
              <div className="relative rounded-3xl border border-slate-800/40 bg-gradient-to-b from-slate-900/40 to-[#0B0F19]/80 p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="h-24 w-24 rounded-full bg-slate-800/60" />
                  <div className="flex-1 flex flex-col gap-4 w-full">
                    <div className="h-8 bg-slate-800/60 rounded w-1/3" />
                    <div className="h-4 bg-slate-800/60 rounded w-1/4" />
                    <div className="h-2 bg-slate-800/60 rounded w-1/2" />
                  </div>
                  <div className="h-20 bg-slate-800/60 rounded-2xl w-48" />
                </div>
              </div>
              <div className="h-10 bg-slate-800/60 rounded w-96" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-80 bg-slate-800/40 rounded-3xl border border-slate-800/20" />
                ))}
              </div>
            </div>
          ) : (
            /* Main Content View */
            <>
              {/* Profile Header */}
              <div className="relative rounded-3xl border border-slate-800/40 bg-gradient-to-b from-slate-900/40 to-[#0B0F19]/80 p-8 shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  {/* Avatar */}
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-md flex-shrink-0">
                    <img
                      src={avatar || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=120&h=120&fit=crop&crop=faces"}
                      alt="Profile avatar"
                      className="h-full w-full rounded-full border border-black object-cover"
                    />
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 flex flex-col gap-4 text-center md:text-left">
                    <div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        {name || 'Anon Collector'}
                      </h1>
                      <div className="flex flex-col md:flex-row items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-950/40 border border-slate-900 rounded-lg px-3 py-1">
                          <Wallet className="h-3.5 w-3.5 text-indigo-400" />
                          {walletAddress || '0xUnknown...'}
                        </span>
                        <p className="text-xs text-slate-400 italic max-w-sm mt-1 md:mt-0 md:ml-2">
                          "{bio}"
                        </p>
                      </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="flex flex-col gap-2 max-w-md w-full">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                        <span>Rank: <span className="text-indigo-300">{rankTitle || 'Rookie'} (Level {level || 1})</span></span>
                        <span>{(reputationXP || 0).toLocaleString()} XP</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950/80 border border-slate-800/30 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-[0_0_8px_#6366f1] transition-all duration-500"
                          style={{ width: `${Math.min(((reputationXP || 0) / 25000) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats Panel */}
                  <div className="flex items-center gap-1 p-4 rounded-2xl bg-slate-950/40 border border-slate-900 flex-shrink-0">
                    <div className="flex flex-col items-center px-5 border-r border-slate-800/30">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Artifacts</span>
                      <span className="font-extrabold text-2xl text-slate-200 mt-1 flex items-center gap-1.5">
                        <Gem className="h-5 w-5 text-indigo-400" />
                        {artifactsCount || 0}
                      </span>
                    </div>
                    <div className="flex flex-col items-center px-5">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Multiplier</span>
                      <span className="font-extrabold text-2xl text-teal-400 mt-1 flex items-center gap-1.5">
                        <Zap className="h-5 w-5 text-teal-400" />
                        {(multiplier || 1.0).toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800/20 pb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-xl px-5 py-2.5 font-semibold text-xs transition-all duration-200 cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300'
                        : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'collectibles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                  {collectibles.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                      <AlertCircle className="h-8 w-8 text-slate-600 mb-3" />
                      <p className="text-slate-500 text-sm">No claimed collectibles in this wallet.</p>
                    </div>
                  ) : (
                    collectibles.map((item: any) => (
                      <CollectibleCard key={item.id} collectible={item} variant="standard" />
                    ))
                  )}
                </div>
              )}

          {activeTab === 'claim-rewards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wonAuctions.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="h-8 w-8 text-slate-600 mb-3" />
                  <p className="text-slate-500 text-sm">No rewards available to claim.</p>
                </div>
              ) : (
                wonAuctions.map((item: any) => (
                  <div key={item.id} className="flex flex-col justify-between p-6 rounded-3xl border border-indigo-500/25 bg-slate-900/50">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={item.image} alt={item.title} className="h-16 w-16 rounded-2xl object-cover border border-slate-900 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                        <span className="text-[10px] text-slate-500 mt-1">Won for {item.wonPrice} ETH</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/20 pt-4 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                        <span className="text-base font-extrabold text-white mt-0.5">Unclaimed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            setProcessingClaim(item.id);
                            await claimReward(item.id);
                            setProcessingClaim(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white"
                        >
                          {processingClaim === item.id ? 'Processing...' : 'Pay & Claim'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'active-bids' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeBids.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                  <AlertCircle className="h-8 w-8 text-slate-600 mb-3" />
                  <p className="text-slate-500 text-sm">No active bids found.</p>
                  <Link href="/explore" className="text-indigo-400 hover:text-indigo-300 text-xs font-bold mt-2 transition-colors">
                    Explore live auctions →
                  </Link>
                </div>
              ) : (
                activeBids.map((auction: any) => (
                  <div
                    key={auction.id}
                    className="flex flex-col justify-between p-6 rounded-3xl border border-indigo-500/25 bg-slate-900/50"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={auction.image}
                        alt={auction.title}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-900 flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{auction.title}</h4>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{auction.creator}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800/20 pt-4 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Your Active Bid</span>
                        <span className="text-base font-extrabold text-white mt-0.5">{auction.currentBid.toFixed(2)} ETH</span>
                      </div>
                      <Link
                        href={`/explore/${auction.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Inspect
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}


              {activeTab === 'transactions' && (
                <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 overflow-hidden animate-fade-in">
                  {activityLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <AlertCircle className="h-8 w-8 text-slate-600 mb-3" />
                      <p className="text-slate-500 text-sm">No transaction records in database.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-800/30 bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-6 py-4">Activity</th>
                            <th className="px-6 py-4">Asset</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">TX Hash</th>
                            <th className="px-6 py-4 text-right">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityLogs.map((tx: any, idx: number) => (
                            <tr
                              key={idx}
                              className="border-b border-slate-800/10 hover:bg-white/[0.005] transition-all text-xs font-semibold text-slate-300"
                            >
                              <td className="px-6 py-4 text-white font-bold">{tx.type}</td>
                              <td className="px-6 py-4 text-slate-300">{tx.item}</td>
                              <td className="px-6 py-4 text-slate-200 font-bold">{tx.amount}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                  ['Minted', 'Approved', 'Confirmed', 'Winning'].includes(tx.status)
                                    ? 'bg-teal-950/20 border border-teal-500/20 text-teal-400'
                                    : 'bg-indigo-950/20 border border-indigo-500/20 text-indigo-400'
                                }`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{tx.txHash}</td>
                              <td className="px-6 py-4 text-right text-slate-500">{tx.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </LayoutWrapper>
  );
}
