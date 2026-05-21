"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store/useAppStore';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isConnected } = useAuth();
  const router = useRouter();
  const openAuth = useAppStore((s) => s.openAuthModal);

  useEffect(() => {
    if (!isConnected) {
  openAuth('Sign in to continue');
  router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
}
