'use client';

import { Gem, Zap } from 'lucide-react';
import LayoutWrapper from '../../components/LayoutWrapper';
import { useLeaderboard } from '../../hooks/useLeaderboard';

export default function LeaderboardPage() {
  const { leaderboard } = useLeaderboard();

  const podiumColors = [
    'border-amber-500/30 bg-amber-950/5',
    'border-slate-500/30 bg-slate-900/10',
    'border-amber-700/30 bg-amber-900/5',
  ];

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Title */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Global Leaderboard</h1>
          <p className="text-sm text-slate-400 mt-2">
            Rankings of top-tier network collectors by artifacts, reputation score, and multipliers.
          </p>
        </div>

        <div className="h-px w-full bg-slate-800/20" />

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboard.slice(0, 3).map((collector, idx) => (
            <div
              key={collector.wallet}
              className={`flex flex-col items-center p-6 rounded-3xl border text-center ${podiumColors[idx]}`}
            >
              <div className="relative mb-4">
                <img
                  src={collector.avatar}
                  alt={collector.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-slate-800"
                />
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 border border-slate-800 font-extrabold text-xs text-slate-200">
                  {idx + 1}
                </span>
              </div>

              <h3 className="text-base font-bold text-white truncate w-full px-2">{collector.name}</h3>
              <span className="text-[10px] font-mono text-slate-500 mt-0.5">{collector.wallet}</span>

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
        <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 overflow-hidden">
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
              {leaderboard.map((collector) => (
                <tr
                  key={collector.wallet}
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
                        src={collector.avatar}
                        alt={collector.name}
                        className="h-8 w-8 rounded-full object-cover border border-slate-900 flex-shrink-0"
                      />
                      <span className="font-bold text-white">{collector.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{collector.wallet}</td>

                  <td className="px-6 py-4 text-center font-bold text-slate-200">
                    <span className="inline-flex items-center gap-1">
                      <Gem className="h-3.5 w-3.5 text-indigo-400" />
                      {collector.artifactsCount}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="rounded-lg bg-teal-950/20 border border-teal-500/20 px-2.5 py-1 text-[10px] font-bold text-teal-400">
                      +{((collector.multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right font-extrabold text-white">
                    <span className="inline-flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-indigo-400" />
                      {collector.reputationXP.toLocaleString()} XP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutWrapper>
  );
}
