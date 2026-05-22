'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import LayoutWrapper from '../../../components/LayoutWrapper';
import { useAppStore } from '../../../store/useAppStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useRequireAuth from '../../../../src/hooks/useRequireAuth';
import { usePrivy } from '@privy-io/react-auth';

export default function ListNewPage() {
  useRequireAuth();
  const router = useRouter();
  const { getAccessToken } = usePrivy();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prizeDetails, setPrizeDetails] = useState('');
  const [usdPrice, setUsdPrice] = useState('1750');
  const [durationDays, setDurationDays] = useState('2');
  const [durationHours, setDurationHours] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState('0');
  const mockUsdValue = usdPrice ? parseFloat(usdPrice) : 0;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const totalMinutes = (parseInt(durationDays || '0') * 24 * 60) + (parseInt(durationHours || '0') * 60) + parseInt(durationMinutes || '0');
      if (totalMinutes <= 0) {
        setError('Auction duration must be greater than 0 minutes.');
        setSubmitting(false);
        return;
      }
      const totalHours = totalMinutes / 60;

      const token = await getAccessToken();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (prizeDetails) formData.append('prizeDetails', prizeDetails);
      formData.append('startingPrice', mockUsdValue.toString());
      formData.append('durationHours', totalHours.toString());
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch('/api/seller/auctions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setTimeout(() => {
          setSubmitting(false);
          router.push('/seller/dashboard');
        }, 1200);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create auction');
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
      setSubmitting(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="flex flex-col gap-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-extrabold text-white">List New Item</h1>
          <p className="text-sm text-slate-400">Create a new auction listing on the live network.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6">
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase">Item Name</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white" />

              <label className="text-xs font-bold text-slate-400 uppercase">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white resize-none" />

              <label className="text-xs font-bold text-slate-400 uppercase">Prize Details (Hidden until claimed)</label>
              <p className="text-[10px] text-slate-500 mb-1 -mt-3">Provide the digital code, link, or physical item instructions. Only the winner will see this after payment.</p>
              <textarea value={prizeDetails} onChange={(e) => setPrizeDetails(e.target.value)} rows={2} className="w-full rounded-2xl border border-indigo-500/30 bg-indigo-500/5 px-4 py-3 text-sm text-indigo-100 placeholder-indigo-300/30 focus:border-indigo-500 focus:outline-none transition-all resize-none" placeholder="e.g. Download link: https://... or Secret Code: 12345" />

              <label className="text-xs font-bold text-slate-400 uppercase">Images</label>
              <div className="flex items-center gap-3">
                <label className="w-44 h-28 flex items-center justify-center rounded-xl border border-dashed border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <span className="text-xs text-slate-400">Drag or upload</span>
                </label>
                {imagePreview && <img src={imagePreview} className="h-28 w-28 rounded-lg object-cover border border-slate-700" />}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pb-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Starting Bid (USD)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-bold">$</span>
                    <input type="number" step="any" min="0" value={usdPrice} onChange={(e) => setUsdPrice(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 pl-8 pr-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none transition-all" />
                  </div>
                  <div className="text-[11px] text-indigo-300/80 mt-2 font-mono">Settled through UGF testnet Mock USD</div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Duration</label>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col relative w-full">
                      <input type="number" min="0" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-2 py-3 text-sm text-white text-center focus:border-indigo-500 focus:outline-none transition-all" />
                      <span className="text-[10px] text-slate-500 absolute -bottom-5 left-1/2 -translate-x-1/2 font-medium">Days</span>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="flex flex-col relative w-full">
                      <input type="number" min="0" max="23" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-2 py-3 text-sm text-white text-center focus:border-indigo-500 focus:outline-none transition-all" />
                      <span className="text-[10px] text-slate-500 absolute -bottom-5 left-1/2 -translate-x-1/2 font-medium">Hours</span>
                    </div>
                    <span className="text-slate-600 font-bold">:</span>
                    <div className="flex flex-col relative w-full">
                      <input type="number" min="0" max="59" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-2 py-3 text-sm text-white text-center focus:border-indigo-500 focus:outline-none transition-all" />
                      <span className="text-[10px] text-slate-500 absolute -bottom-5 left-1/2 -translate-x-1/2 font-medium">Mins</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/40 bg-slate-900/30 p-6 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white">Live Preview</h3>
            <div className="rounded-xl overflow-hidden border border-slate-800/20 bg-slate-950/20 p-4">
              <img src={imagePreview || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'} alt="preview" className="h-40 w-full object-cover rounded-lg mb-3" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{title || 'Untitled Artifact'}</div>
                  <div className="text-xs text-slate-400">Creator • You</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-white">${mockUsdValue > 0 ? mockUsdValue.toFixed(2) : '0.00'}</div>
                  <div className="text-xs text-slate-500">Reserve: --</div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-bold text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {submitting ? 'Listing on Network...' : 'Create Listing'}
            </button>

            <div className="flex items-start gap-2 mt-2 px-1">
              <Info className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-snug">
                By creating this listing, you agree to the platform terms. A <span className="font-bold text-slate-300">2% platform fee</span> will be deducted from the total winning bid.
              </p>
            </div>
          </div>
        </form>
      </div>
    </LayoutWrapper>
  );
}
