'use client';

import React, { useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PageTransition from './PageTransition';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const mobileMenuOpen = useAppStore((s) => s.mobileMenuOpen);
  const setSidebarCollapsed = useAppStore((s) => s.setSidebarCollapsed);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);

  // Load sidebarCollapsed on mount to avoid Next SSR hydration difference
  useEffect(() => {
    const saved = localStorage.getItem('oktra_sidebar_collapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

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

      {/* Mobile Drawer Backdrop overlay with smooth backdrop blur */}
      <div 
        className={`fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => toggleMobileMenu(false)}
      />

      {/* Sidebar - fixed on left, collapsible and responsive */}
      <Sidebar />

      {/* Main Content Area - shifted right by sidebar width on desktop */}
      <div 
        className={`flex flex-col min-h-screen transition-all duration-300 ease-out pl-0 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Persistent Top Bar Header */}
        <TopBar />

        {/* Inner Page Main Contents with Staggered Transition wrapper */}
        <main className="flex-1 px-4 sm:px-10 py-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <PageTransition>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
