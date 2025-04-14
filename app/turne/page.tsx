'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface TourDate {
  date: string;
  city: string;
  location: string;
  ticketLink: string;
  soldOut: boolean;
}

// Tour dates data
const TOUR_DATES: TourDate[] = [
  {
    date: "05. MAR 2025",
    city: "KØBENHAVN",
    location: "VEGA",
    ticketLink: "https://billetto.dk/strikogdrik-kobenhavn",
    soldOut: false
  },
  {
    date: "12. MAR 2025",
    city: "AARHUS",
    location: "TRAIN",
    ticketLink: "https://billetto.dk/strikogdrik-aarhus",
    soldOut: false
  },
  {
    date: "19. MAR 2025",
    city: "ODENSE",
    location: "POSTEN",
    ticketLink: "https://billetto.dk/strikogdrik-odense",
    soldOut: true
  },
  {
    date: "26. MAR 2025",
    city: "AALBORG",
    location: "SKRÅEN",
    ticketLink: "https://billetto.dk/strikogdrik-aalborg",
    soldOut: false
  },
  {
    date: "02. APR 2025",
    city: "ESBJERG",
    location: "TOBAKKEN",
    ticketLink: "https://billetto.dk/strikogdrik-esbjerg",
    soldOut: false
  },
  {
    date: "09. APR 2025",
    city: "HERNING",
    location: "FERMATEN",
    ticketLink: "https://billetto.dk/strikogdrik-herning",
    soldOut: false
  },
  {
    date: "16. APR 2025",
    city: "ROSKILDE",
    location: "GIMLE",
    ticketLink: "https://billetto.dk/strikogdrik-roskilde",
    soldOut: false
  }
];

export default function TurnePage() {
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  useEffect(() => {
    if (visibleItems < TOUR_DATES.length) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => prev + 1);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [visibleItems]);

  return (
    <div className="min-h-screen flex flex-col items-center relative">
      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 relative z-10">
        {/* Titel */}
        <div className="flex flex-col items-center justify-center mb-12 mt-6">
          <div className="mb-2">
            <Image 
              src="/TOURCHROME.png?v=3"
              alt="TOUR 2025"
              width={700}
              height={180}
              className="mx-auto"
              priority
            />
          </div>
        </div>
        
        {/* Tour dates - minimalistisk design */}
        <div className="mb-16">
          <h2 className="text-xl font-medium text-white/80 mb-8 text-center">UPCOMING SHOWS</h2>
          
          <div className="space-y-4">
            {TOUR_DATES.slice(0, visibleItems).map((show, index) => (
              <div 
                key={index}
                className={`relative overflow-hidden transition-all duration-500 ease-out
                ${visibleItems === index + 1 ? 'animate-fade-in' : ''}
                ${hoveredIndex === index ? 'transform scale-[1.01]' : ''}`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="backdrop-blur-sm bg-black/20 border border-pink-500/20 hover:border-pink-500/40 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300">
                  {/* Date */}
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-pink-300">{show.date}</span>
                    <span className="text-sm text-white/60 mt-1 hidden sm:block">{show.location}</span>
                  </div>
                  
                  {/* Location */}
                  <div className="text-center flex-grow">
                    <span className="text-xl font-bold text-white tracking-wide">{show.city}</span>
                    <span className="text-sm text-white/60 block sm:hidden mt-1">{show.location}</span>
                  </div>
                  
                  {/* Status/Button */}
                  <div>
                    {show.soldOut ? (
                      <span className="inline-block py-2 px-4 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300 text-sm font-medium">
                        UDSOLGT
                      </span>
                    ) : (
                      <a 
                        href={show.ticketLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block py-2 px-5 bg-pink-600/20 hover:bg-pink-500/30 border border-pink-500/40 rounded-lg text-white transition-all duration-300 text-sm font-medium"
                      >
                        BILLETTER
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Animated gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-pink-500/50 to-transparent opacity-50"></div>
              </div>
            ))}
            
            {visibleItems < TOUR_DATES.length && (
              <div className="h-12 flex items-center justify-center">
                <div className="w-6 h-6 border-t-2 border-l-2 border-pink-400 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* All tickets button */}
          <div className="mt-10 text-center">
            <a 
              href="https://billetto.dk/strikogdrik" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-3 px-8 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/40 hover:to-purple-600/40 border border-pink-500/40 rounded-lg text-white transition-all duration-300 text-sm font-medium"
            >
              <span>SE ALLE BILLETTER</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
        
        {/* Featured image - Nu placeret mellem tour dates og show highlights */}
        <div className="relative w-full max-w-5xl mx-auto h-[50vh] md:h-[70vh] overflow-hidden rounded-2xl mb-16">
          <Image 
            src="/baggerogfeldthaus/feldthausogbagger2.jpg"
            alt="Bagger & Feldthaus Live Performance"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70"></div>
        </div>
        
        {/* Show highlights - mere minimalistisk og moderne */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="backdrop-blur-sm bg-black/20 border border-pink-500/20 p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:border-pink-500/40 hover:bg-black/30">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">SJOV & UNDERHOLDNING</h3>
            <p className="text-white/70 text-sm">Comedy, musik og strik i en unik kombination der sikrer en aften med både grin og kreativitet.</p>
          </div>
          
          <div className="backdrop-blur-sm bg-black/20 border border-pink-500/20 p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:border-pink-500/40 hover:bg-black/30">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">GAVER & PRÆMIER</h3>
            <p className="text-white/70 text-sm">Mulighed for at vinde eksklusive strikketing og drikkevarer til at tage med hjem efter showet.</p>
          </div>
          
          <div className="backdrop-blur-sm bg-black/20 border border-pink-500/20 p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:border-pink-500/40 hover:bg-black/30">
            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">FÆLLESSKAB</h3>
            <p className="text-white/70 text-sm">Mød andre strikke-glade mennesker og bliv en del af det hyggelige STRIK & DRIK fællesskab.</p>
          </div>
        </div>
        
        {/* Simpel footer */}
        <div className="text-center text-xs text-pink-300/60 mt-6 mb-8">
          <p>© {new Date().getFullYear()} BAGGER & FELDTHAUS • STRIK & DRIK</p>
        </div>
      </div>
    </div>
  );
} 