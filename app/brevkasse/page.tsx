'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Terminal from '../components/Terminal';

export default function BrevkassePage() {
  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col items-center">
      {/* Hovedindhold */}
      <div className="w-full flex-1 flex flex-col items-center justify-center pb-16 px-4">
        {/* Hero sektion */}
        <div className="max-w-5xl w-full text-center mb-4 sm:mb-6 mt-8">
          <div className="mb-2">
            <Image 
              src="/BREVKASSECHROME.png?v=6"
              alt="BREVKASSEN"
              width={950}
              height={235}
              className="mx-auto"
              priority
            />
          </div>
        </div>
        
        {/* Terminal sektion - større og mere central */}
        <div className="w-full max-w-4xl mx-auto">
          <Terminal />
        </div>
        
        {/* Kort info sektion - mere diskret nu hvor terminalen er hovedfokus */}
        <div className="mt-10 w-full max-w-4xl mx-auto">
          <div className="bg-black/40 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-pink-400 mb-2">Om Brevkassen</h3>
                <p className="text-white/80">
                  Alle beskeder vises på <Link href="/opslagstavle" className="text-pink-400 hover:underline">opslagstavlen</Link> og 
                  kan blive brugt i forestillingen "STRIK & DRIK".
                </p>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-pink-400 mb-2">Tips</h3>
                <ul className="text-white/80 space-y-1">
                  <li>• Vær ærlig og personlig</li>
                  <li>• Inkluder et billede hvis relevant</li>
                  <li>• Alle emner er velkomne</li>
                </ul>
              </div>
              
              <div className="flex flex-col justify-center">
                <Link 
                  href="/opslagstavle" 
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition-colors text-center"
                >
                  Se alle beskeder
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 