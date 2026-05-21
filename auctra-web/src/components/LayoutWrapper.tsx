'use client';

import React, { useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PageTransition from './PageTransition';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Elite Mouse-Follow Spotlight Glow effect (GPU accelerated CSS variables)
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

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full bg-[#060911] text-white relative overflow-hidden"
      style={{
        // Define default coordinates to prevent layout shifts
        ['--mouse-x' as any]: '50%',
        ['--mouse-y' as any]: '50%',
      }}
    >
      {/* Ambient background particle glows */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-30 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.08), transparent 80%)`
        }}
      />
      <div 
        className="pointer-events-none absolute -inset-px opacity-20 transition-opacity duration-300 -z-10"
        style={{
          background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(20, 184, 166, 0.05), transparent 80%)`
        }}
      />

      {/* Sidebar - fixed on left */}
      <Sidebar />

      {/* Main Content Area - shifted right by sidebar width */}
      <div className="pl-72 flex flex-col min-h-screen">
        {/* Persistent Top Bar Header */}
        <TopBar />

        {/* Inner Page Main Contents with Staggered Transition wrapper */}
        <main className="flex-1 px-10 py-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
