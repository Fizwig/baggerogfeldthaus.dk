'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DecorativeElement from '@/app/components/DecorativeElement';

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('');

  return (
    <main className="flex min-h-screen flex-col items-center py-12 relative">
      {/* Feminine pink hacker baggrund - matcher brevkassen, opslagstavlen og turne */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Matrix-lignende baggrund med pink nuancer */}
        <div className="absolute inset-0 bg-black opacity-80 z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(219,39,119,0.03),transparent)] bg-[length:100px_100%] z-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(219,39,119,0.1)_1px,transparent_1px)] bg-[size:15px_15px] z-2"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.7),transparent_150px,transparent_calc(100%-150px),rgba(0,0,0,0.7))]"></div>
        
        {/* Scanline effekt */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(255,0,255,0.05)_3px,transparent_4px)]"></div>
      </div>

      <div className="w-full max-w-5xl mx-auto p-4 relative z-10">
        {/* Main Content Card med forbedret glaseffekt */}
        <div className="backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(219,39,119,0.15)]">
          {/* Header Section med centreret logo */}
          <div className="p-8 border-b border-pink-500/20 flex flex-col items-center relative">
            {/* Decorative scanlines */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(to_bottom,transparent_0%,rgba(219,39,119,0.05)_50%,transparent_100%)] bg-[length:100%_4px]"></div>
            
            {/* Tydelig og markant overskrift som virkelig fanger øjet */}
            <div className="w-full text-center mb-8">
              <h1 className="text-6xl sm:text-7xl font-bold mb-0 relative inline-block">
                <span className="inline-block text-white" style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "700",
                  textShadow: "0 0 15px rgba(236, 72, 153, 0.8), 0 0 30px rgba(236, 72, 153, 0.5)"
                }}>
                  BAGGER & FELDTHAUS
                </span>
              </h1>
              <div className="w-full flex justify-center mt-4">
                <div className="w-2/3 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
              </div>
            </div>
            
            {/* Navigation - konsistent med andre sider */}
            <nav className="mt-10 mb-8">
              <ul className="flex flex-wrap justify-center gap-3">
                <li>
                  <Link 
                    href="/" 
                    className="relative px-6 py-2 group backdrop-blur-md bg-pink-600/20 border border-pink-400/50 rounded-md inline-block text-white font-medium"
                  >
                    <span className="relative z-10">Forside</span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-400 animate-pulse"></span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/turne" 
                    className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
                  >
                    <span className="relative z-10">Turné</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/brevkasse" 
                    className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
                  >
                    <span className="relative z-10">Brevkasse</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/opslagstavle" 
                    className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
                  >
                    <span className="relative z-10">Opslagstavle</span>
                  </Link>
                </li>
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
          <p>© {new Date().getFullYear()} STRIK • Elektronisk Musik • Danmark</p>
          <p className="text-pink-300/50 text-xs mt-1">// SECURE CONNECTION ESTABLISHED //</p>
        </div>
      </div>
    </main>
  );
} 