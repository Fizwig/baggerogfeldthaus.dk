'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamisk import af Terminal-komponenten med ssr: false
const Terminal = dynamic(() => import('../components/Terminal'), {
  ssr: false, // Dette sikrer at komponenten kun renderes på klientsiden
  loading: () => (
    <div className="text-center p-8 text-pink-300">
      <p>Loading terminal...</p>
      <div className="mt-4 mx-auto w-24 h-1 bg-pink-500 animate-pulse"></div>
    </div>
  )
});

export default function BrevkassePage() {
  return (
    <main className="flex min-h-screen flex-col items-center py-4 px-4 sm:px-6 relative">
      {/* Feminine pink hacker baggrund */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Matrix-lignende baggrund med pink nuancer */}
        <div className="absolute inset-0 bg-black opacity-80 z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(219,39,119,0.03),transparent)] bg-[length:100px_100%] z-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(219,39,119,0.1)_1px,transparent_1px)] bg-[size:15px_15px] z-2"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.7),transparent_150px,transparent_calc(100%-150px),rgba(0,0,0,0.7))]"></div>
        
        {/* Scanline effekt */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(255,0,255,0.05)_3px,transparent_4px)]"></div>
      </div>
      
      <div className="w-full max-w-6xl mx-auto relative z-10">
        {/* Header med stiliseret titel */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="font-['Space_Grotesk'] font-black text-white relative inline-block">
              <span className="relative">STRIK</span>
              <span className="relative mx-2 sm:mx-4 text-pink-500">BREVKASSE</span>
            </span>
          </h1>
        </div>
        
        {/* Moderne navigation */}
        <nav className="mt-6 sm:mt-10 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 sm:mx-0">
          <ul className="flex justify-start sm:justify-center gap-2 sm:gap-3 px-4 sm:px-0 min-w-max sm:min-w-0">
            <li>
              <Link 
                href="/" 
                className="relative px-4 sm:px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white text-sm sm:text-base font-medium whitespace-nowrap"
              >
                Forside
              </Link>
            </li>
            <li>
              <Link 
                href="/turne" 
                className="relative px-4 sm:px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white text-sm sm:text-base font-medium whitespace-nowrap"
              >
                Turné
              </Link>
            </li>
            <li>
              <Link 
                href="/brevkasse" 
                className="relative px-4 sm:px-6 py-2 group backdrop-blur-md bg-pink-600/20 border border-pink-400/50 rounded-md inline-block text-white text-sm sm:text-base font-medium whitespace-nowrap"
              >
                Brevkasse
              </Link>
            </li>
            <li>
              <Link 
                href="/opslagstavle" 
                className="relative px-4 sm:px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white text-sm sm:text-base font-medium whitespace-nowrap"
              >
                Opslagstavle
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Terminal container */}
        <div className="w-full">
          <Terminal />
        </div>
        
        {/* Info sektion */}
        <div className="mt-8 sm:mt-10 text-center">
          <div className="max-w-lg mx-auto px-4 sm:px-6">
            <div className="text-xs sm:text-sm text-pink-300/70 flex items-center justify-center flex-wrap gap-2 sm:gap-4">
              <span>Krypteret</span>
              <span className="hidden sm:inline">•</span>
              <span>Sikker</span>
              <span className="hidden sm:inline">•</span>
              <span>Open Source</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-[10px] sm:text-xs text-pink-300/60 mt-6">
          <p>© {new Date().getFullYear()} BAGGER & FELDTHAUS • STRIK & DRIK • Danmark</p>
        </div>
      </div>
    </main>
  );
} 