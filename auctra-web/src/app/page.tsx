"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import LiveAuctionsPreview from '../components/LiveAuctionsPreview';
import FeaturesGrid from '../components/FeaturesGrid';
import HowItWorks from '../components/HowItWorks';
import StatsProof from '../components/StatsProof';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAuth();
  const [loading] = useState(false);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#051424, #071026)]">
  <Navbar />

  <Hero />

      <LiveAuctionsPreview />
      <FeaturesGrid />
      <HowItWorks />
      <StatsProof />

  <AuthModal />
    </main>
  );
}
