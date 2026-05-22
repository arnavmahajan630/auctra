"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function Hero() {
  const openAuth = useAppStore((s) => s.openAuthModal);

  const scrollToMechanics = () => {
    const el = document.getElementById('the-mechanics');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 1. Live Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 55 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let s = prev.seconds - 1;
        let m = prev.minutes;
        let h = prev.hours;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 2; m = 14; s = 55;
        }
        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  // 2. Simulated Bids State & Dynamic Ticking
  const [currentBid, setCurrentBid] = useState(42.5);
  const [lastBidder, setLastBidder] = useState('0x8F...3a2b');
  const [flashActive, setFlashActive] = useState(false);

  useEffect(() => {
    const bidders = ['0x7C...D44E', '0x3D...F21A', '0x9E...B50C', '0x1F...A98E', '0x8F...3a2b'];
    const bidEngine = setInterval(() => {
      // Trigger subtle flash animation on new bid
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 800);

      setCurrentBid((prev) => parseFloat((prev + 0.15).toFixed(2)));
      setLastBidder(bidders[Math.floor(Math.random() * bidders.length)]);
    }, 7000);

    return () => clearInterval(bidEngine);
  }, []);

  // 3. 3D Card Hover Perspective Tilt & Spotlight Glow
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Map coordinates to subtle degrees (-8 to 8 deg)
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 180, damping: 22 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Center coordinates as origin (ranges from -0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(relativeX);
    mouseY.set(relativeY);

    // Localized CSS spotlight coords
    cardRef.current.style.setProperty('--card-spot-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--card-spot-y', `${e.clientY - rect.top}px`);
  };

  const handleCardMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Dynamic background aura blurs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />
      
      {/* Subtle neon aura behind headline */}
      <div className="absolute top-[25%] left-[20%] w-[380px] h-[380px] rounded-full bg-indigo-600/[0.08] blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute top-[35%] left-[10%] w-[280px] h-[280px] rounded-full bg-cyan-500/[0.04] blur-[90px] pointer-events-none -z-10 animate-pulse duration-[6000ms]" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* LEFT COLUMN: Headings, Staggers & Shimmers */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.12]">
              The Elite Layer for<br />
              <span className="text-shimmer bg-gradient-to-r from-indigo-400 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
                Decentralized Auctions.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-[15px] sm:text-base text-slate-350 max-w-xl leading-relaxed font-normal"
          >
            Experience a premium bidding network with zero-friction onboarding, passive AI fraud guardrails, and instant non-custodial payouts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-4 items-center"
          >
            <motion.button
              onClick={() => openAuth('Connect your wallet to start bidding')}
              whileHover={{ scale: 1.03, y: -2, boxShadow: "0px 0px 25px rgba(6, 182, 212, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.18)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer active:scale-98"
            >
              Start Bidding
            </motion.button>
            <motion.button
              onClick={scrollToMechanics}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg text-sm font-semibold text-slate-300 border border-slate-800/80 bg-[#080d1a]/55 hover:bg-[#0c1428] hover:border-indigo-500/30 hover:text-white transition-all duration-300 cursor-pointer active:scale-98"
            >
              Learn Mechanics
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Interactive 3D Auction Terminal Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end [perspective:1000px]">
          <motion.div
            ref={cardRef}
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="w-full max-w-[430px] rounded-2xl bg-gradient-to-b from-[#0e172a]/95 to-[#070c18]/95 border border-slate-900/90 p-6 backdrop-blur-xl shadow-[0_30px_70px_rgba(0,0,0,0.7)] relative overflow-hidden group transition-all duration-300 neon-border-pulsing"
          >
            {/* Dynamic Localized Glass Reflection Spotlight Overlay */}
            <div 
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
              style={{
                background: `radial-gradient(280px circle at var(--card-spot-x, 50%) var(--card-spot-y, 50%), rgba(99, 102, 241, 0.12), transparent 80%)`
              }}
            />
            
            {/* Glass sweeping border reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] pointer-events-none" />

            {/* Header Telemetry */}
            <div className="flex items-start justify-between z-10 relative [transform:translateZ(20px)]">
              <div>
                <p className="text-[9px] tracking-widest text-slate-500 font-bold uppercase">CURRENT AUCTION</p>
                <h3 className="text-xl font-bold text-white mt-1 tracking-tight">Bored Ape #4521</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>

            {/* Simulated Glass Reflection Graphic */}
            <div className="mt-5 aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-950 relative border border-slate-900/60 shadow-inner group-hover:scale-[1.01] transition-transform duration-500 [transform:translateZ(10px)]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-65 mix-blend-lighten" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Floating aesthetic line */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-slate-800/30">
                <span className="font-mono text-indigo-300">#4521</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Metadata Verified</span>
              </div>
            </div>

            {/* Bidding Telemetry Container */}
            <motion.div 
              animate={flashActive ? { scale: 1.015, borderColor: '#6366f1' } : { scale: 1, borderColor: '#0f172a' }}
              transition={{ duration: 0.25 }}
              className="mt-5 grid grid-cols-2 gap-4 bg-slate-950/50 rounded-xl p-4 border transition-colors duration-300 relative overflow-hidden [transform:translateZ(25px)]"
            >
              {/* Subtle dynamic background glow */}
              <div className={`absolute inset-0 bg-indigo-500/5 pointer-events-none transition-opacity duration-300 ${flashActive ? 'opacity-100' : 'opacity-0'}`} />

              <div>
                <p className="text-[10px] tracking-wider text-slate-500 font-bold uppercase">HIGHEST BID</p>
                <motion.p 
                  key={currentBid}
                  initial={{ opacity: 0.5, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white mt-1 font-mono tracking-tight"
                >
                  {currentBid.toFixed(2)} ETH
                </motion.p>
              </div>
              
              <div>
                <p className="text-[10px] tracking-wider text-slate-500 font-bold uppercase">TIME REMAINING</p>
                <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">
                  {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
                </p>
              </div>
            </motion.div>

            {/* Bid History Details */}
            <div className="mt-4 border-t border-slate-900/60 pt-4 flex flex-col gap-2 z-10 relative [transform:translateZ(15px)]">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Last Bid: <span className="text-slate-400 font-mono">{lastBidder}</span></span>
                <span className="text-indigo-400 font-bold tracking-wide animate-pulse">Just now</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium">Reserve Price</span>
                <span className="text-slate-300 font-bold font-mono">40.0 ETH</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
