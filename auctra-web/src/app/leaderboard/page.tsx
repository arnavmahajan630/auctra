'use client';

import { Gem, Zap, RefreshCw } from 'lucide-react';
import LayoutWrapper from '../../components/LayoutWrapper';
import { useLeaderboard } from '../../hooks/useLeaderboard';

export default function LeaderboardPage() {
  const { leaderboard, loading, error, refetch } = useLeaderboard();

  const podiumColors = [
    'border-amber-500/30 bg-amber-950/5 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-amber-500/[0.03] before:to-transparent',
    'border-slate-500/30 bg-slate-900/10 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-slate-400/[0.03] before:to-transparent',
    'border-amber-700/30 bg-amber-900/5 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-amber-700/[0.03] before:to-transparent',
  ];

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-slate-400">
              Global Leaderboard
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Rankings of top-tier network collectors by artifacts, reputation score, and multipliers.
            </p>
          </div>

          {!loading && !error && (
            <button
              onClick={refetch}
              className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-xs font-bold text-slate-300 transition-all active:scale-95 cursor-pointer shadow-md hover:border-slate-700"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          )}
        </div>

        <div className="h-px w-full bg-slate-800/20" />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col gap-8">
            {/* Podium Loading */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-6 rounded-3xl border border-slate-800/40 bg-slate-900/10 animate-pulse text-center"
                >
                  <div className="relative mb-4">
                    <div className="h-16 w-16 rounded-full bg-slate-800/50" />
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 border border-slate-800/50 font-extrabold text-xs text-slate-500">
                      {i + 1}
                    </span>
                  </div>
                  <div className="h-4 w-28 bg-slate-800/60 rounded mb-2" />
                  <div className="h-3 w-20 bg-slate-800/30 rounded mb-4" />
                  <div className="flex items-center gap-6 mt-5 w-full border-t border-slate-800/20 pt-4">
                    <div className="flex flex-col items-center flex-1">
                      <div className="h-2 w-10 bg-slate-800/30 rounded mb-1.5" />
                      <div className="h-3.5 w-12 bg-slate-800/50 rounded" />
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="h-2 w-10 bg-slate-800/30 rounded mb-1.5" />
                      <div className="h-3.5 w-12 bg-slate-800/50 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Loading */}
            <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 overflow-hidden animate-pulse">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/30 bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 text-center">Rank</th>
                    <th className="px-6 py-4">Collector</th>
                    <th className="px-6 py-4">Wallet Address</th>
                    <th className="px-6 py-4 text-center">Artifacts</th>
                    <th className="px-6 py-4 text-center">Multiplier</th>
                    <th className="px-6 py-4 text-right">Reputation Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <tr key={i} className="border-b border-slate-800/10">
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex h-7 w-7 bg-slate-800/50 rounded-full" />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800/50" />
                          <div className="h-3 w-24 bg-slate-800/50 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="h-3 w-32 bg-slate-800/30 rounded" />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex h-3 w-8 bg-slate-800/50 rounded" />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex h-5 w-12 bg-slate-800/40 rounded-lg" />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex h-3 w-16 bg-slate-800/50 rounded" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-rose-500/20 bg-rose-950/5 text-center animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 border border-rose-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Failed to Sync rankings</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">{error}</p>
            <button
              onClick={refetch}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loaded Data */}
        {!loading && !error && (
          <>
            {leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-slate-800/40 bg-slate-900/10 text-center animate-fade-in">
                <div className="h-12 w-12 rounded-full bg-slate-850 flex items-center justify-center text-slate-500 mb-4 border border-slate-800">
                  <Gem className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No Active Collectors</h3>
                <p className="text-sm text-slate-400 max-w-sm">
                  No database collector entries found. Populate the database with the seed script to start competing!
                </p>
              </div>
            ) : (
              <>
                {/* Top 3 Podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {leaderboard.slice(0, 3).map((collector, idx) => (
                    <div
                      key={collector.wallet || `collector-${idx}`}
                      className={`flex flex-col items-center p-6 rounded-3xl border text-center ${podiumColors[idx] || 'border-slate-800/40'}`}
                    >
                      <div className="relative mb-4">
                        <img
                          src={collector.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop'}
                          alt={collector.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-slate-800"
                        />
                        <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 border border-slate-800 font-extrabold text-xs text-slate-200">
                          {idx + 1}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white truncate w-full px-2">
                        {collector.name || 'Anonymous Collector'}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {collector.wallet ? `${collector.wallet.slice(0, 6)}...${collector.wallet.slice(-4)}` : 'No Wallet Connected'}
                      </span>

                      <div className="flex items-center gap-6 mt-5 w-full border-t border-slate-800/20 pt-4 text-xs">
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[10px] uppercase text-slate-500 font-bold">Artifacts</span>
                          <span className="font-extrabold text-slate-200 mt-1 flex items-center gap-1">
                            <Gem className="h-3 w-3 text-indigo-400" />
                            {collector.artifactsCount}
                          </span>
                        </div>
                        <div className="flex flex-col items-center flex-1">
                          <span className="text-[10px] uppercase text-slate-500 font-bold">Rep XP</span>
                          <span className="font-extrabold text-slate-200 mt-1 flex items-center gap-1">
                            <Zap className="h-3 w-3 text-teal-400" />
                            {collector.reputationXP}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full Leaderboard Table */}
                <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 overflow-hidden shadow-xl backdrop-blur-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-slate-800/30 bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-6 py-4 text-center w-16">Rank</th>
                          <th className="px-6 py-4">Collector</th>
                          <th className="px-6 py-4">Wallet Address</th>
                          <th className="px-6 py-4 text-center">Artifacts</th>
                          <th className="px-6 py-4 text-center">Multiplier</th>
                          <th className="px-6 py-4 text-right">Reputation Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((collector) => (
                          <tr
                            key={collector.wallet || `collector-row-${collector.rank}`}
                            className="border-b border-slate-800/10 hover:bg-white/[0.01] transition-all text-xs font-semibold text-slate-300"
                          >
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-bold text-xs ${
                                collector.rank === 1 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                collector.rank === 2 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' :
                                collector.rank === 3 ? 'bg-amber-700/10 text-amber-600 border border-amber-700/20' :
                                'text-slate-500'
                              }`}>
                                {collector.rank}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={collector.avatar || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop'}
                                  alt={collector.name}
                                  className="h-8 w-8 rounded-full object-cover border border-slate-900 flex-shrink-0"
                                />
                                <span className="font-bold text-white">{collector.name || 'Anonymous'}</span>
                              </div>
                            </td>

                            <td className="px-6 py-4 font-mono text-[11px] text-slate-500">
                              {collector.wallet ? (
                                <span className="hidden sm:inline">{collector.wallet}</span>
                              ) : (
                                <span>-</span>
                              )}
                              {collector.wallet && (
                                <span className="inline sm:hidden">
                                  {`${collector.wallet.slice(0, 6)}...${collector.wallet.slice(-4)}`}
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-center font-bold text-slate-200">
                              <span className="inline-flex items-center gap-1">
                                <Gem className="h-3.5 w-3.5 text-indigo-400" />
                                {collector.artifactsCount}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <span className="rounded-lg bg-teal-950/20 border border-teal-500/20 px-2.5 py-1 text-[10px] font-bold text-teal-400">
                                +{((Number(collector.multiplier || 1) - 1) * 100).toFixed(0)}%
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right font-extrabold text-white">
                              <span className="inline-flex items-center gap-1">
                                <Zap className="h-3.5 w-3.5 text-teal-400" />
                                {(collector.reputationXP || 0).toLocaleString()} XP
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </LayoutWrapper>
  );
}

