'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Globe, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useSeller } from '../../hooks/useSeller';
import { useAuth } from '../../hooks/useAuth';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { isConnected, connectWallet } = useAuth();
  const { initializeSeller } = useSeller();

  const [step, setStep] = useState<'info' | 'form' | 'loading' | 'success'>('info');
  const [bio, setBio] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleStartOnboarding = () => {
    if (!isConnected) { connectWallet(); return; }
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setTimeout(async () => {
      await initializeSeller(bio);
      setStep('success');
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-[#060911] text-white flex items-center justify-center p-6 sm:p-10">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-800/40 bg-gradient-to-b from-slate-900/60 to-[#0B0F19]/90 p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {step === 'info' && (
          <div className="flex flex-col items-center text-center">
            {/* Shield Icon */}
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-400">
              <Shield className="h-6 w-6" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
              Join the Elite Seller Network
            </h1>
            <p className="max-w-2xl text-slate-400 text-sm sm:text-base leading-relaxed mb-12">
              Oktra provides the infrastructure for high-value asset liquidity. Unlock global access to verified collectors and seamless on-chain settlement.
            </p>

            {/* Three Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-12">
              <div className="flex flex-col items-center p-6 rounded-2xl border border-slate-800/40 bg-slate-900/30 text-center">
                <Globe className="h-6 w-6 text-cyan-400 mb-4" />
                <h3 className="text-base font-bold text-white mb-2">Global Liquidity</h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  Access a network of high-net-worth bidders and verified actors.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-2xl border border-slate-800/40 bg-slate-900/30 text-center">
                <Shield className="h-6 w-6 text-cyan-400 mb-4" />
                <h3 className="text-base font-bold text-white mb-2">Technical Trust</h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  Automated on-chain settlement with zero-escrow friction.
                </p>
              </div>

              <div className="flex flex-col items-center p-6 rounded-2xl border border-slate-800/40 bg-slate-900/30 text-center">
                <Award className="h-6 w-6 text-cyan-400 mb-4" />
                <h3 className="text-base font-bold text-white mb-2">Premium Reputation</h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  Build your seller score and earn XP with every successful auction.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col items-center gap-5">
              <button
                onClick={handleStartOnboarding}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
              >
                Initialize Seller Profile
                <ChevronRight className="h-4 w-4" />
              </button>
              <Link
                href="/dashboard"
                className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
              >
                Cancel and return to Dashboard
              </Link>
            </div>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl mx-auto">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 2 of 2</span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white mt-1">Configure On-Chain Identity</h2>
              <p className="text-xs text-slate-400 mt-2">Specify your public organization credentials to mint your seller passport.</p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seller Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aegis Forge"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Mission & Bio</label>
                <textarea
                  placeholder="Tell collectors about the high-value assets you curate..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 resize-none"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="flex-1 rounded-xl border border-slate-800 py-3.5 font-bold text-sm text-slate-300 hover:bg-white/5 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
              >
                Mint Seller Credentials
              </button>
            </div>
          </form>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500 mb-6" />
            <h3 className="text-lg font-bold text-white">Deploying Seller Smart Contract...</h3>
            <p className="text-xs text-slate-500 mt-2">Broadcasting verification metadata to the blockchain.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center py-8">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-950/40 border border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
              <CheckCircle2 className="h-10 w-10 text-teal-400" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">Onboarding Completed!</h2>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-8">
              Your seller credentials have been successfully minted. Welcome to the elite tier.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3.5 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
            >
              Enter Seller Arena
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
