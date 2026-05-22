"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { supabase } from '../server/supabase';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import TheMechanics from '../components/TheMechanics';
import TechnicalSuperiority from '../components/TechnicalSuperiority';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

export default function Home() {
  const router = useRouter();
  const { authenticated, ready, user } = usePrivy();
  const [loading] = useState(false);

  useEffect(() => {
    if (ready && authenticated && user) {
      // Check if user has completed onboarding
      const checkOnboarding = async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('privy_user_id', user.id)
            .single();
          
          if (data?.onboarding_complete) {
            router.push('/dashboard');
          } else {
            router.push('/onboarding');
          }
        } catch (e) {
          router.push('/onboarding');
        }
      };
      
      checkOnboarding();
    }
  }, [ready, authenticated, user, router]);

  return (
    <main className="min-h-screen flex flex-col bg-[#04050a] text-white selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <TheMechanics />
      <TechnicalSuperiority />
      <CallToAction />
      <Footer />
    </main>
  );
}
