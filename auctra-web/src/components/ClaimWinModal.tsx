import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2, Award, Zap } from 'lucide-react';
import { encodeFunctionData } from 'viem';
import { UGFClient } from '@tychilabs/ugf-testnet-js';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { executeUgfTransaction, mapUgfError } from '@/lib/ugfPayment';
import { formatUsdAmount } from '@/lib/currency';

const AUCTION_SETTLEMENT_ABI = [
  {
    type: 'function',
    name: 'claim',
    inputs: [
      { name: 'auctionId', type: 'uint256' },
      { name: 'finalPrice', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
];

const ERC20_ABI = [
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
];

interface ClaimWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: {
    id: string;
    title: string;
    image: string;
    wonPrice: number;
  } | null;
  walletAddress: string;
  onSuccess: () => void;
}

type Step = 'idle' | 'checking' | 'approving' | 'signing' | 'executing' | 'confirming' | 'success';

export default function ClaimWinModal({ isOpen, onClose, auction, walletAddress, onSuccess }: ClaimWinModalProps) {
  const [step, setStep] = useState<Step>('idle');
  const [error, setError] = useState('');
  const { wallets } = useWallets();

  if (!isOpen || !auction) return null;

  const handleClaim = async () => {
    try {
      setStep('checking');
      setError('');

      const activeWallet =
        wallets.find((w) => w.address.toLowerCase() === walletAddress.toLowerCase()) || wallets[0];
      if (!activeWallet) throw new Error('No connected wallet found.');

      if (activeWallet.chainId !== 'eip155:84532') {
        await activeWallet.switchChain(84532);
      }

      const ethereumProvider = await activeWallet.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const ugf = new UGFClient();
      try {
        await ugf.auth.login(signer);
      } catch (err: unknown) {
        throw new Error(mapUgfError('login', err));
      }

      // 1. Get backend signature + payment details
      setStep('signing');
      const sigRes = await fetch('/api/buyer/claim-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: auction.id, walletAddress }),
      });
      const sigData = await sigRes.json();
      if (!sigRes.ok) throw new Error(sigData.error || 'Failed to get claim signature');

      const { signature, auctionIdInt, finalPriceWei, paymentTokenAddress, contractAddress } = sigData;

      // 2. Check allowance — if insufficient, approve max in a single UGF tx
      const tokenContract = new ethers.Contract(paymentTokenAddress, ERC20_ABI, provider);
      const currentAllowance: bigint = await tokenContract.allowance(signerAddress, contractAddress);

      if (currentAllowance < BigInt(finalPriceWei)) {
        setStep('approving');
        const approveData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [contractAddress as `0x${string}`, ethers.MaxUint256],
        });
        await executeUgfTransaction({
          ugf,
          signer,
          payerAddress: signerAddress,
          tx: { to: paymentTokenAddress, data: approveData, value: BigInt(0) },
        });
      }

      // 3. Single claim transaction — pays seller + treasury + mints badge atomically
      setStep('executing');
      const claimData = encodeFunctionData({
        abi: AUCTION_SETTLEMENT_ABI,
        functionName: 'claim',
        args: [BigInt(auctionIdInt), BigInt(finalPriceWei), signature as `0x${string}`],
      });

      const claimResult = await executeUgfTransaction({
        ugf,
        signer,
        payerAddress: signerAddress,
        tx: { to: contractAddress, data: claimData, value: BigInt(0) },
      });

      // 4. Confirm in DB
      setStep('confirming');
      const confirmRes = await fetch('/api/buyer/confirm-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: auction.id,
          txHash: claimResult.userTxHash,
          amountPaid: auction.wonPrice,
          ugfClaimDigest: claimResult.digest,
        }),
      });

      if (!confirmRes.ok) throw new Error('Backend confirmation failed after claim execution');

      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred during the claim process.');
      setStep('idle');
    }
  };

  const isActive = step !== 'idle' && step !== 'success';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-950 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/50 p-6 bg-slate-900/50">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-400" />
              Claim Your Win
            </h2>
            <button
              onClick={onClose}
              disabled={isActive}
              className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Item Details */}
            <div className="flex items-center gap-4 rounded-2xl bg-slate-900 p-4 border border-slate-800">
              <img src={auction.image} alt={auction.title} className="h-16 w-16 rounded-xl object-cover" />
              <div>
                <div className="font-bold text-white text-base">{auction.title}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Winning Bid:{' '}
                  <span className="text-indigo-400 font-bold">{formatUsdAmount(auction.wonPrice)} Mock USD</span>
                </div>
              </div>
            </div>

            {/* Secret NFT Teaser */}
            <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 p-4 border border-indigo-500/20 flex gap-4 items-center">
              <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Award className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-indigo-300">Secret Achievement Unlocked</div>
                <div className="text-xs text-slate-400 mt-1">
                  Claiming this item will automatically mint a soulbound Collector&apos;s Badge NFT to your wallet!
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3 rounded-2xl bg-slate-900/50 p-5 border border-slate-800/50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Artifact Price</span>
                <span className="font-bold text-white">{formatUsdAmount(auction.wonPrice)} Mock USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Network Gas Fee</span>
                <span className="font-bold text-green-400 flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Gasless (UGF)
                </span>
              </div>
              <div className="my-2 border-t border-slate-800/50"></div>
              <div className="flex justify-between text-base">
                <span className="font-bold text-slate-300">You Pay</span>
                <span className="font-black text-indigo-400">{formatUsdAmount(auction.wonPrice)} Mock USD</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleClaim}
              disabled={step !== 'idle'}
              className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4 text-sm font-black text-white hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {step === 'idle' && 'Claim & Mint Badge'}
              {step === 'checking' && (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking Payment Status...
                </span>
              )}
              {step === 'signing' && (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying Win...
                </span>
              )}
              {step === 'approving' && (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Authorize Payment (one-time)...
                </span>
              )}
              {step === 'executing' && (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Paying & Minting Badge...
                </span>
              )}
              {step === 'confirming' && (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Finalizing Ownership...
                </span>
              )}
              {step === 'success' && (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-400" /> Success!
                </span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
