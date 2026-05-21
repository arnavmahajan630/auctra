'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Gem, ImagePlus } from 'lucide-react';

export default function OnboardingPage() {
  const { user, getAccessToken } = usePrivy();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate username regex
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        throw new Error('Username must be 3-20 lowercase letters, numbers, or underscores.');
      }

      const token = await getAccessToken();
      if (!token) throw new Error('Authentication required');

      // 1. Upload Avatar (if any) to Supabase Storage via our backend (or frontend if RLS allows, but we use backend here)
      // For a hackathon, we can send the file to the backend via FormData
      const formData = new FormData();
      formData.append('username', username);
      formData.append('bio', bio);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const res = await fetch('/api/users/onboarding', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to complete onboarding');
      }

      // Success, route to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Let ProtectedRoute or middleware handle unauthenticated users

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#051424,#071026)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/60 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="flex justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg">
              <Gem className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-white text-center mb-2">Claim Your Identity</h1>
          <p className="text-sm text-slate-400 text-center mb-8">
            Complete your profile to start collecting and trading on Oktra.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <label htmlFor="avatar-upload" className="relative cursor-pointer group">
                <div className={`h-24 w-24 rounded-full border-2 border-dashed ${avatarPreview ? 'border-indigo-500' : 'border-slate-600'} bg-slate-950 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400`}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-500 font-medium">Upload Avatar (optional)</span>
            </div>

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Username <span className="text-rose-500">*</span></label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="e.g. shadow_collector"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Bio */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the network about your collection..."
                rows={3}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Securing Identity...' : 'Complete Profile'}
            </button>
          </form>
        </div>
    </main>
  );
}
