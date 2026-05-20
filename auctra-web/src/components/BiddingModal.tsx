'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Auction } from '../types';
import { useAuctions } from '../hooks/useAuctions';

interface BiddingModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction;
}

export default function BiddingModal({ isOpen, onClose, auction }: BiddingModalProps) {
  const { placeBid } = useAuctions();
  const [bidAmount, setBidAmount] = useState((auction.currentBid + auction.minBidIncrement).toFixed(2));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    setTimeout(async () => {
      const parsedAmount = parseFloat(bidAmount);
      if (isNaN(parsedAmount)) {
        setStatus('error');
        setErrorMessage('Please enter a valid bid amount.');
        return;
      }

      const res = await placeBid(auction.id, parsedAmount);
      if (res.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Failed to place bid.');
      }
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop Blur Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container with spring scale-up */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-[#0E1321] p-8 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] z-10"
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-6 right-6 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </motion.button>

            {status === 'success' ? (
              /* Success State */
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-6"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-950/40 border border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                >
                  <CheckCircle2 className="h-10 w-10 text-teal-400" />
                </motion.div>
                
                <h3 className="text-2xl font-extrabold tracking-tight text-white mb-2 animate-fade-in">
                  Bid Placed Successfully!
                </h3>
                <p className="text-slate-400 text-sm mb-8 max-w-sm">
                  Your transaction has been finalized on-chain. You are now the highest bidder for{' '}
                  <span className="font-semibold text-white">{auction.title}</span>.
                </p>
                
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all cursor-pointer"
                >
                  Return to Auction
                </motion.button>
              </motion.div>
            ) : (
              /* Bidding Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Live Bidding Arena</span>
                  <h3 className="text-xl font-bold tracking-tight text-white mt-1">Place Your On-Chain Bid</h3>
                </div>

                {/* Auction Brief */}
                <div className="flex items-center gap-4 rounded-2xl bg-slate-950/40 border border-slate-900 p-4">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-slate-200 truncate">{auction.title}</span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      Current highest bid:{' '}
                      <span className="font-semibold text-indigo-400">{auction.currentBid.toFixed(2)} ETH</span>
                    </span>
                  </div>
                </div>

                {/* Bid Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Your Bid Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min={auction.currentBid + auction.minBidIncrement}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      disabled={status === 'loading'}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4 text-2xl font-extrabold text-white placeholder-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 pr-16"
                      required
                    />
                    <span className="absolute inset-y-0 right-5 flex items-center text-sm font-extrabold text-slate-400">
                      ETH
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Minimum bid: <span className="font-semibold">{(auction.currentBid + auction.minBidIncrement).toFixed(2)} ETH</span>
                  </span>
                </div>

                {/* Error Notice */}
                {status === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/15 p-4 text-xs text-red-400"
                  >
                    <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Wallet Info */}
                <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-indigo-400" />
                    0x8F3a2C...4D1A
                  </span>
                  <span>Balance: <span className="font-semibold text-slate-200">18.45 ETH</span></span>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={status === 'loading'}
                  whileHover={status === 'loading' ? {} : { scale: 1.02 }}
                  whileTap={status === 'loading' ? {} : { scale: 0.98 }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-sm text-white hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 active:scale-95 shadow-[0_4px_25px_rgba(79,70,229,0.3)] transition-all cursor-pointer"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                      Simulating Transaction...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Submit Bid Proposal
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
