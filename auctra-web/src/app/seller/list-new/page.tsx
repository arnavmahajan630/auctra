'use client';

import { useState } from 'react';
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
  const [startingBid, setStartingBid] = useState('0.5');
  const [duration, setDuration] = useState('48');
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
      const token = await getAccessToken();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('startingPrice', startingBid);
      formData.append('durationHours', duration);
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
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white resize-none" />

              <label className="text-xs font-bold text-slate-400 uppercase">Images</label>
              <div className="flex items-center gap-3">
                <label className="w-44 h-28 flex items-center justify-center rounded-xl border border-dashed border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                  <span className="text-xs text-slate-400">Drag or upload</span>
                </label>
                {imagePreview && <img src={imagePreview} className="h-28 w-28 rounded-lg object-cover border border-slate-700" />}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Starting Bid (ETH)</label>
                  <input value={startingBid} onChange={(e) => setStartingBid(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Duration (hours)</label>
                  <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white" />
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
                  <div className="text-sm font-extrabold text-white">{parseFloat(startingBid).toFixed(2)} ETH</div>
                  <div className="text-xs text-slate-500">Reserve: --</div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-bold text-white hover:from-indigo-500 hover:to-violet-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {submitting ? 'Listing on Network...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </LayoutWrapper>
  );
}
