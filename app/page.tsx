'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DecorativeElement from '@/app/components/DecorativeElement';

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });

  // Handle mouse move effect for the header
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setGlowPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center py-12 relative">
      {/* Opdateret baggrund med smooth shader effekter */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Base gradient baggrund */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950/40 to-black"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-pulse-slower"></div>
        </div>
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-noise opacity-[0.015] mix-blend-overlay"></div>
        
        {/* Smooth scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(219,39,119,0.05)_50%,transparent_100%)] bg-[length:100%_4px]"></div>
        
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]"></div>
        
        {/* Animated glow */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_100%_200px,rgba(219,39,119,0.1),transparent_100%)] animate-glow-1"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_0%_300px,rgba(219,39,119,0.1),transparent_100%)] animate-glow-2"></div>
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto p-4 relative z-10">
        {/* Main Content Card med forbedret glaseffekt */}
        <div className="backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(219,39,119,0.15)]">
          {/* Header Section med logo */}
          <div 
            className="p-8 border-b border-pink-500/20 flex flex-col items-center relative overflow-hidden"
            onMouseMove={handleMouseMove}
          >
            {/* Dynamic glow effect */}
            <div 
              className="absolute pointer-events-none transition-transform duration-300"
              style={{
                left: `${glowPosition.x}px`,
                top: `${glowPosition.y}px`,
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
              }}
            />

            {/* Logo */}
            <div className="w-full text-center mb-8 relative">
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 animate-pulse opacity-50 blur-xl bg-gradient-to-r from-transparent via-pink-500/20 to-transparent"></div>
                </div>
                <div className="relative group">
                  <Image
                    src="/baggerogfeldthaus/LOGO.png"
                    alt="BAGGER & FELDTHAUS Logo"
                    width={600}
                    height={200}
                    className="w-full h-auto transition-all duration-500 
                             hover:scale-105 hover:brightness-110
                             group-hover:drop-shadow-[0_0_25px_rgba(236,72,153,0.5)]"
                    style={{
                      filter: 'drop-shadow(0 0 10px rgba(236,72,153,0.3))'
                    }}
                    priority
                  />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-1 
                                bg-gradient-to-r from-transparent via-pink-500/50 to-transparent 
                                blur-sm animate-pulse"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
                                transition-opacity duration-300 pointer-events-none
                                bg-gradient-to-r from-transparent via-pink-500/10 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Enhanced Navigation */}
            <nav className="mt-10 mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent animate-pulse"></div>
              <ul className="flex flex-wrap justify-center gap-4">
                {[
                  { href: "/", text: "Forside" },
                  { href: "/turne", text: "Turné" },
                  { href: "/brevkasse", text: "Brevkasse" },
                  { href: "/opslagstavle", text: "Opslagstavle" }
                ].map((item) => (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      className={`relative px-6 py-2 group transition-all duration-300 ${
                        item.href === "/" 
                          ? "backdrop-blur-md bg-pink-600/20 border border-pink-400/50" 
                          : "backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/20"
                      } rounded-md inline-block text-white font-medium overflow-hidden`}
                    >
                      <span className="relative z-10 group-hover:text-white transition-colors">
                        {item.text}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Improved Image Display with Better Scaling */}
          <div className="p-10">
            <div className="aspect-[1.5/1] relative overflow-hidden rounded-lg border border-pink-500/30 shadow-xl bg-black/40">
              {/* Pink effect overlays */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/20 via-transparent to-pink-400/10 mix-blend-overlay pointer-events-none z-10"></div>
              <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(219,39,119,0.05)_3px,transparent_4px)] pointer-events-none z-10"></div>
              
              {/* Pink glow borders */}
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent z-10"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent z-10"></div>
              <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-pink-500/40 to-transparent z-10"></div>
              <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-pink-500/40 to-transparent z-10"></div>
              
              {/* Optimized image display */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image 
                  src="/baggerogfeldthaus/STRIKOGDRIKBILLEDE1.jpg"
                  alt="STRIK Live Performance"
                  fill
                  className="object-contain transition-all duration-700 hover:scale-[1.02] hover:brightness-105"
                  priority
                />
              </div>
            </div>
          </div>
          
          {/* Footer Section with Pink Effect */}
          <div className="py-6 px-8 border-t border-pink-500/20 text-center">
            <div className="text-sm text-pink-200/80 font-medium tracking-wide">
              <div className="flex items-center justify-center space-x-6">
                <Link href="/kontakt" className="hover:text-white transition-colors">Kontakt</Link>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/70"></span>
                <Link href="/om" className="hover:text-white transition-colors">Om STRIK</Link>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400/70"></span>
                <Link href="/projekter" className="hover:text-white transition-colors">Projekter</Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-pink-300/60 mt-6">
          <p>© {new Date().getFullYear()} BAGGER & FELDTHAUS • STRIK & DRIK • Danmark</p>
          <p className="text-pink-300/50 text-xs mt-1">// SECURE CONNECTION ESTABLISHED //</p>
        </div>
      </div>
    </main>
  );
} 