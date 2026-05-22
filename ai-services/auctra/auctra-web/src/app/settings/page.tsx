'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Network, User, CheckCircle2 } from 'lucide-react';
import LayoutWrapper from '../../components/LayoutWrapper';

export default function SettingsPage() {
  const [nickname, setNickname] = useState('Anon Collector');
  const [gasPreset, setGasPreset] = useState<'standard' | 'fast' | 'instant'>('fast');
  const [network, setNetwork] = useState('sepolia');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const sidebarItems = [
    { icon: User, label: 'Identity Configuration', active: true },
    { icon: Network, label: 'RPC Connection Setup', active: false },
    { icon: Shield, label: 'Security Credentials', active: false },
    { icon: Bell, label: 'Notifications', active: false },
  ];

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 animate-fade-in max-w-4xl pb-12">
        {/* Title */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Dashboard Settings
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Configure your avatar identifier, RPC endpoint settings, and gas thresholds.
          </p>
        </div>

        <div className="h-px w-full bg-slate-800/20" />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left nav panel */}
          <div className="md:col-span-4 flex flex-col gap-2">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-xs text-left transition-all cursor-pointer ${
                  item.active
                    ? 'text-indigo-300 bg-indigo-950/25 border border-indigo-500/25'
                    : 'text-slate-400 border border-transparent hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Right config form */}
          <div className="md:col-span-8">
            <form
              onSubmit={handleSave}
              className="rounded-3xl border border-slate-800/40 bg-gradient-to-b from-slate-900/40 to-[#0B0F19]/80 p-8 flex flex-col gap-6 shadow-lg"
            >
              <h3 className="text-base font-bold text-white">Identity Configuration</h3>

              {/* Nickname */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Public Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                  required
                />
              </div>

              {/* Network */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ethereum Network Provider
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-slate-300 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                >
                  <option value="mainnet">Ethereum Mainnet (RPC Node 1)</option>
                  <option value="sepolia">Sepolia Testnet (Alchemy Managed)</option>
                  <option value="localhost">Local Host (Anvil Hardhat)</option>
                </select>
              </div>

              {/* Gas Preset */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Default Gas Estimation Threshold
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['standard', 'fast', 'instant'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGasPreset(preset)}
                      className={`rounded-2xl py-3 text-xs font-extrabold capitalize border transition-all cursor-pointer ${
                        gasPreset === preset
                          ? 'bg-indigo-950/20 border-indigo-500/50 text-indigo-300'
                          : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Success Notice */}
              {isSaved && (
                <div className="flex items-center gap-3 rounded-2xl border border-teal-500/30 bg-teal-950/15 p-4 text-xs text-teal-400">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span>Your identity settings have been updated successfully.</span>
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                className="mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
              >
                Save Configurations
              </button>
            </form>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
