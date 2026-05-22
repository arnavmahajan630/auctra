"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useRouter } from 'next/navigation';

export default function AuthModal() {
  const open = useAppStore((s) => s.authModalOpen);
  const message = useAppStore((s) => s.authModalMessage);
  const pendingRedirect = useAppStore((s) => s.pendingAuthRedirect);
  const connect = useAppStore((s) => s.connectWallet);
  const close = useAppStore((s) => s.closeAuthModal);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setSuccess(false);
    }
  }, [open]);

  const simulate = async (method: string) => {
    setLoading(true);
    // simulated network / wallet handshake
    await new Promise((r) => setTimeout(r, 900));
    // success animation
    setSuccess(true);
    connect();
    // keep success visual briefly
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSuccess(false);
    close();
    // redirect after success
    if (pendingRedirect) {
      router.push(pendingRedirect);
    } else {
      router.push('/explore');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={close} />

          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }} className="relative z-10 w-[min(540px,94%)] rounded-2xl bg-gradient-to-br from-slate-950 via-[#070b16] to-[#010307] p-8 backdrop-blur-xl border border-slate-900/90 shadow-[0_30px_70px_rgba(0,0,0,0.8)] neon-border-pulsing">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white tracking-tight">Sign in to Oktra</h3>
              <button onClick={close} className="text-slate-500 hover:text-white transition-colors duration-200 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              {message ?? 'Connect with Google or your Web3 wallet. This demo simulates secure authentication.'}
            </p>

            <div className="flex flex-col gap-3">
              {/* Google Sign-in */}
              <button
                onClick={() => simulate('google')}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-[#090e1c] border border-slate-900 hover:border-slate-800 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#0f162c] cursor-pointer disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.67 0 3.19.57 4.37 1.71l3.26-3.26C17.65 1.54 14.98 1 12 1 7.37 1 3.39 3.65 1.4 7.56l3.92 3.04C6.27 7.56 8.92 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.46c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.88 3.39-8.5z" />
                  <path fill="#FBBC05" d="M5.32 14.6c-.22-.67-.35-1.39-.35-2.12s.13-1.45.35-2.12L1.4 7.32C.51 9.1 0 11.05 0 13s.51 3.9 1.4 5.68l3.92-3.08z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.08 0-5.73-2.52-6.68-5.56L1.4 15.82C3.39 19.73 7.37 23 12 23z" />
                </svg>
                <span className="flex-1 text-left">{loading ? 'Connecting...' : 'Continue with Google'}</span>
                {success && <span className="text-emerald-400 font-bold">✓</span>}
              </button>

              <div className="relative my-3 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-900"></div>
                </div>
                <span className="relative px-3 bg-[#070b16] text-[10px] uppercase font-bold tracking-widest text-slate-500">Or Connect Wallet</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* MetaMask */}
                <button
                  onClick={() => simulate('metamask')}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-900 bg-[#090e1c]/40 hover:bg-[#090e1c] hover:border-slate-800 px-4 py-3 text-xs font-bold text-slate-200 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 11.75l-2.03-3.68-2.61.87L18 5.75l-4.5 1.25L12 3l-1.5 4-4.5-1.25.64 3.19-2.61-.87L2 11.75l8.5 7.5L12 21l1.5-1.75 8.5-7.5z" fill="#E2761B"/>
                  </svg>
                  MetaMask
                </button>

                {/* WalletConnect */}
                <button
                  onClick={() => simulate('walletconnect')}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-900 bg-[#090e1c]/40 hover:bg-[#090e1c] hover:border-slate-800 px-4 py-3 text-xs font-bold text-slate-200 transition-all duration-300 cursor-pointer disabled:opacity-50"
                >
                  <svg className="h-4.5 w-4.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                    <path d="M12 22a10 10 0 0 1-10-10" />
                  </svg>
                  WalletConnect
                </button>
              </div>
            </div>

            <div className="mt-6 text-[10px] text-slate-500 text-center">
              By continuing, you agree to Oktra's <span className="underline hover:text-slate-400 cursor-pointer">Terms</span> and <span className="underline hover:text-slate-400 cursor-pointer">Privacy Policy</span>.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
