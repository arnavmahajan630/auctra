'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    // If Privy is ready but the user is not authenticated, redirect to home
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

  // Wait until Privy is ready and user is authenticated to render children
  if (!ready || !authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060911]">
        <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}
