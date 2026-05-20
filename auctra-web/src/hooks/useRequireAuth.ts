"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';

export default function useRequireAuth() {
  const isConnected = useAppStore((s) => s.isConnected);
  const openAuth = useAppStore((s) => s.openAuthModal);
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      openAuth('Sign in to continue');
      router.push('/');
    }
  }, [isConnected, openAuth, router]);

  return isConnected;
}
