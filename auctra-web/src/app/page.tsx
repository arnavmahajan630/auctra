"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturesGrid from '../components/FeaturesGrid';
import AuthModal from '../components/AuthModal';
import { useAppStore } from '../store/useAppStore';

export default function Home() {
  const openAuth = useAppStore((s) => s.openAuthModal);
  const isConnected = useAppStore((s) => s.isConnected);
  const walletAddress = useAppStore((s) => s.walletAddress);
  const [walletInput, setWalletInput] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse Spotlight dynamic values
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handleCtaConnect = (e: React.FormEvent) => {
    e.preventDefault();
    openAuth(
      walletInput 
        ? `Connecting with address: ${walletInput}` 
        : 'Connect your Web3 wallet to begin'
    );
  };

  return (
    <main
      ref={containerRef}
      style={{
        ['--mouse-x' as any]: '50%',
        ['--mouse-y' as any]: '50%',
      }}
      className="min-h-screen bg-[#010307] text-slate-100 flex flex-col relative overflow-hidden selection:bg-indigo-500/30 selection:text-white"
    >
      {/* Cinematic overlay grid & textures */}
      <div className="absolute inset-0 cinematic-grid opacity-[0.24] pointer-events-none -z-20" />
      <div className="absolute inset-0 grain-overlay opacity-[0.14] pointer-events-none -z-20" />
      <div className="absolute inset-0 vignette-edges pointer-events-none -z-20" />

      {/* Moving Ambient Neon Orbs & soft atmospheric fog */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-cyan-500/[0.08] blur-[130px] animate-float-1 pointer-events-none -z-20" />
      <div className="absolute bottom-[20%] right-[-15%] w-[650px] h-[650px] rounded-full bg-indigo-500/[0.08] blur-[150px] animate-float-2 pointer-events-none -z-20" />
      <div className="absolute top-[40%] left-[15%] w-[450px] h-[450px] rounded-full bg-purple-500/[0.05] blur-[140px] animate-float-1 pointer-events-none -z-20" />

      {/* Interactive mouse spotlight following cursor with high contrast bloom */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-30 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(950px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.09), transparent 80%)`
        }}
      />
      <div 
        className="pointer-events-none absolute -inset-px opacity-20 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(450px circle at var(--mouse-x) var(--mouse-y), rgba(6, 182, 212, 0.08), transparent 80%)`
        }}
      />

      {/* Stationary premium soft lighting transitions */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(6,182,212,0.03),transparent_70%)] pointer-events-none -z-10" />

      {/* 1. Navbar */}
      <Navbar />

      {/* 2. Hero Section */}
      <Hero />

      {/* 3. The Mechanics Section */}
      <HowItWorks />

      {/* 4. Technical Superiority Bento Grid */}
      <FeaturesGrid />

      {/* 5. Bottom CTA Section with Section Lighting */}
      <section id="cta-banner" className="max-w-7xl mx-auto px-6 py-28 w-full scroll-mt-20 relative">
        {/* Localized Section Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.02),transparent_65%)] pointer-events-none -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          className="relative rounded-3xl bg-gradient-to-b from-[#0a1020]/95 to-[#03060c]/95 border border-slate-900/90 p-10 md:p-16 text-center overflow-hidden shadow-2xl flex flex-col items-center justify-center group neon-border-pulsing"
        >
          {/* Internal Glass Reflection Sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/3 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] pointer-events-none" />
          
          {/* Background spot glow inside card */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
          
          <h2 className="text-2xl sm:text-3xl md:text-[36px] font-bold text-white tracking-tight leading-tight max-w-2xl z-10">
            Ready to claim your spot on the leaderboard?
          </h2>

          <form onSubmit={handleCtaConnect} className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-lg justify-center items-stretch relative z-10">
            <input
              type="text"
              placeholder="Enter Wallet Address"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              className="bg-[#030712]/90 border border-slate-900 focus:border-indigo-500/40 hover:border-slate-800 rounded-xl px-5 py-3 text-slate-200 placeholder-slate-600 focus:outline-none w-full sm:flex-1 text-sm font-medium transition-all shadow-inner"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(6, 182, 212, 0.45)" }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold rounded-xl px-6 py-3 text-sm shadow-[0_0_20px_rgba(6,182,212,0.18)] transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              {isConnected && walletAddress ? 'Connected' : 'Connect Wallet'}
            </motion.button>
          </form>
        </motion.div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-950 mt-auto bg-[#010307]/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* LEFT: branding */}
          <div className="flex items-center">
            <span className="text-lg font-bold text-white tracking-tight hover:text-indigo-400 transition-colors duration-350 cursor-pointer">Oktra</span>
          </div>

          {/* CENTER: links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <a onClick={() => openAuth('Sign in to view Privacy Policy')} className="hover:text-slate-350 transition-colors duration-200 cursor-pointer">Privacy Policy</a>
            <a onClick={() => openAuth('Sign in to view Terms of Service')} className="hover:text-slate-350 transition-colors duration-200 cursor-pointer">Terms of Service</a>
            <a onClick={() => openAuth('Sign in to view Documentation')} className="hover:text-slate-350 transition-colors duration-200 cursor-pointer">Docs</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-350 transition-colors duration-200">Twitter</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-350 transition-colors duration-200">Discord</a>
          </div>

          {/* RIGHT: copyright */}
          <div className="text-right">
            <span className="text-[11px] text-slate-600 font-medium tracking-wide">
              © 2026 Oktra Protocol. Elite Technical Liquidity.
            </span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Trigger */}
      <AuthModal />
    </main>
  );
}
