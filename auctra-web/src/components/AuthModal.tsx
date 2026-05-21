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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }} className="relative z-10 w-[min(720px,94%)] rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#071026]/90 p-6 border border-slate-800/40 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Sign in to Oktra</h3>
              <button onClick={close} className="text-slate-400">✕</button>
            </div>

            <p className="text-sm text-slate-400 mb-6">{message ?? 'Connect with Google or your Web3 wallet. This demo simulates authentication.'}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={() => simulate('google')} disabled={loading} className="col-span-1 sm:col-span-3 inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-700/30 to-violet-700/30 px-4 py-3 text-sm font-semibold text-white hover:from-indigo-600/40">
                <img src="/images/google-icon.png" alt="Google" className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
                  {loading && <span className="text-xs text-slate-400">Authenticating…</span>}
                </div>
                {success && <span className="ml-auto text-teal-300 font-bold">✓</span>}
              </button>

              <button onClick={() => simulate('metamask')} disabled={loading} className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-800/30 bg-white/3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/6">
                {loading ? 'Connecting...' : 'MetaMask'}
              </button>

              <button onClick={() => simulate('walletconnect')} disabled={loading} className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-800/30 bg-white/3 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-white/6">
                {loading ? 'Connecting...' : 'WalletConnect'}
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-500">By continuing you agree to Oktra Terms & Privacy (demo).</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
