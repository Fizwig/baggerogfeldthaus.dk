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
    <main className="flex min-h-screen flex-col items-center py-4 relative">
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
      
      <div className="w-full max-w-6xl mx-auto p-4 relative z-10">
        {/* Header med stiliseret titel */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-pink-300">
              STRIK BREVKASSE
            </span>
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-400 mx-auto mt-2"></div>
          <p className="text-pink-300/80 text-sm mt-3 font-medium">// SECURE CONNECTION ESTABLISHED //</p>
        </div>
        
        {/* Moderne navigation */}
        <nav className="mt-10 mb-8">
          <ul className="flex flex-wrap justify-center gap-3">
            <li>
              <Link 
                href="/" 
                className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
              >
                <span className="relative z-10">Forside</span>
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
                className="relative px-6 py-2 group backdrop-blur-md bg-pink-600/20 border border-pink-400/50 rounded-md inline-block text-white font-medium"
              >
                <span className="relative z-10">Brevkasse</span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-400 animate-pulse"></span>
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
        
        {/* Terminal container med en mere moderne look */}
        <div className="backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(219,39,119,0.15)]">
          <div className="p-6">
            <div className="terminal-content">
              <Terminal />
            </div>
          </div>
        </div>
        
        {/* Info sektion - lækker oprydning, kun tekstual information */}
        <div className="mt-10 text-center">
          <div className="max-w-lg mx-auto bg-black/30 backdrop-blur-md border border-pink-500/20 rounded-lg p-5 shadow-lg">
            <h3 className="text-lg text-pink-300 mb-2 font-medium">Sådan fungerer brevkassen</h3>
            <p className="text-white/80 text-sm mb-4">
              Skriv en besked og se den blive vist på vores digitale opslagstavle. Du kan også tilføje et billede til din besked.
            </p>
            <div className="text-xs text-pink-300/70 flex items-center justify-center space-x-4">
              <span>Krypteret</span>
              <span>•</span>
              <span>Sikker</span>
              <span>•</span>
              <span>Open Source</span>
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