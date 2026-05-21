'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Globe, Award, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { useSeller } from '../../hooks/useSeller';
import { useAuth } from '../../hooks/useAuth';
import useRequireAuth from '../../hooks/useRequireAuth';
import { useAppStore } from '../../store/useAppStore';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { isConnected } = useAuth();
  useRequireAuth();
  const openAuth = useAppStore((s) => s.openAuthModal);
  const { initializeSeller, registerSellerProfile } = useSeller();

  const [step, setStep] = useState<'info' | 'form' | 'verify' | 'loading' | 'success'>('info');
  const [bio, setBio] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [govIdFile, setGovIdFile] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<string | null>(null);

  const handleStartOnboarding = () => {
    if (!isConnected) { openAuth('Sign in to continue', '/seller-onboarding'); return; }
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Start verification animation
    setStep('verify');
    setTimeout(async () => {
      setStep('loading');
      // register seller profile (simulated KYC)
      if (registerSellerProfile) {
        await registerSellerProfile({ fullName, email, phone, country, walletAddress: '0x8F3a2C...4D1A', govId: govIdFile || '', selfie: selfieFile || '' });
      } else {
        await initializeSeller(bio);
      }
      setTimeout(() => setStep('success'), 1200);
    }, 1800);
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
              <div className="grid grid-cols-1 gap-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-white" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-3.5 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wallet Address</label>
                  <input type="text" value={'0x8F3a2C...4D1A'} readOnly className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 px-5 py-3.5 text-sm text-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Government ID</label>
                <label className="flex items-center gap-3 rounded-xl border border-dashed border-slate-800 p-4 cursor-pointer">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => setGovIdFile(e.target.files?.[0] ? e.target.files![0].name : null)} className="hidden" />
                  <span className="text-xs text-slate-400">Drag & drop or click to upload</span>
                  {govIdFile && <span className="ml-auto text-xs text-teal-300">{govIdFile}</span>}
                </label>

                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Selfie</label>
                <label className="flex items-center gap-3 rounded-xl border border-dashed border-slate-800 p-4 cursor-pointer">
                  <input type="file" accept="image/*" onChange={(e) => setSelfieFile(e.target.files?.[0] ? e.target.files![0].name : null)} className="hidden" />
                  <span className="text-xs text-slate-400">Drag & drop or click to upload</span>
                  {selfieFile && <span className="ml-auto text-xs text-teal-300">{selfieFile}</span>}
                </label>
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

        {step === 'verify' && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Verifying Identity & Wallet</h3>
            <p className="text-xs text-slate-500 mt-2">AI scanning, wallet verification and security checks are in progress.</p>
            <div className="mt-6 w-64 h-2 rounded-full bg-slate-900/40 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 animate-[progress_3s_linear]" style={{ width: '70%' }} />
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500 mb-6" />
            <h3 className="text-lg font-bold text-white">Finalizing Credentials...</h3>
            <p className="text-xs text-slate-500 mt-2">Simulating on-chain mint and verification.</p>
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
