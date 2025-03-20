'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DecorativeElement from '@/app/components/DecorativeElement';

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
  
  useEffect(() => {
    if (visibleItems < TOUR_DATES.length) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [visibleItems]);

  return (
    <div className="min-h-screen flex min-h-screen flex-col items-center py-4 relative">
      {/* Feminine pink hacker baggrund - matcher brevkassen og opslagstavlen */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Matrix-lignende baggrund med pink nuancer */}
        <div className="absolute inset-0 bg-black opacity-80 z-0"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(219,39,119,0.03),transparent)] bg-[length:100px_100%] z-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(219,39,119,0.1)_1px,transparent_1px)] bg-[size:15px_15px] z-2"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.7),transparent_150px,transparent_calc(100%-150px),rgba(0,0,0,0.7))]"></div>
        
        {/* Scanline effekt */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-10 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_2px,rgba(255,0,255,0.05)_3px,transparent_4px)]"></div>
      </div>
      
      {/* Navigation */}
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
              className="relative px-6 py-2 group backdrop-blur-md bg-pink-600/20 border border-pink-400/50 rounded-md inline-block text-white font-medium"
            >
              <span className="relative z-10">Turné</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-400 animate-pulse"></span>
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

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto p-4 relative z-10">
        {/* Header med stiliseret titel - matcher brevkassen og opslagstavlen */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-pink-300">
              STRIK TURNÉ 2025
            </span>
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-400 mx-auto mt-2"></div>
          <p className="text-pink-300/80 text-sm mt-3 font-medium">// SECURE CONNECTION ESTABLISHED //</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Tour image */}
          <div className="lg:col-span-1 backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl p-6 h-fit">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md mb-4 group">
              <Image 
                src="/baggerogfeldthaus/feldthausogbagger2.jpg"
                alt="Bagger & Feldthaus Live Performance"
                fill
                className="object-contain transition-all duration-700 hover:scale-[1.02] hover:brightness-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <h3 className="text-xl font-bold text-pink-300 mb-3">STRIK OG DRIK LIVE</h3>
            <p className="text-pink-100/80 mb-6">Oplev vores unikke elektroniske live-show i en by nær dig. Med nye visuelle elementer og eksklusive tracks.</p>
            <a 
              href="https://billetto.dk/strikogdrik" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative px-6 py-2 group backdrop-blur-md bg-black/30 border border-pink-400/30 hover:bg-pink-600/10 transition-colors rounded-md inline-block text-white font-medium"
            >
              Alle billetter
            </a>
          </div>
          
          {/* Tour dates terminal */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl overflow-hidden">
              <div className="py-2 px-4 bg-black/60 border-b border-pink-500/30 flex items-center">
                <div className="flex gap-1.5 mr-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="font-mono text-pink-300">tour_dates.log</span>
              </div>
              <div className="p-4 font-mono">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-pink-300 border-b border-pink-900/50">
                      <th className="py-3 px-2 text-left">DATE</th>
                      <th className="py-3 px-2 text-left">CITY</th>
                      <th className="py-3 px-2 text-left hidden md:table-cell">VENUE</th>
                      <th className="py-3 px-2 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TOUR_DATES.slice(0, visibleItems).map((show, index) => (
                      <tr 
                        key={index} 
                        className="border-b border-pink-900/30 hover:bg-pink-500/10 transition-colors"
                      >
                        <td className="py-3 px-2 text-pink-100">{show.date}</td>
                        <td className="py-3 px-2 text-white">{show.city}</td>
                        <td className="py-3 px-2 hidden md:table-cell text-gray-400">{show.location}</td>
                        <td className="py-3 px-2 text-right">
                          {show.soldOut ? (
                            <span className="text-red-400">SOLD_OUT</span>
                          ) : (
                            <a 
                              href={show.ticketLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-pink-300 inline-block hover:text-pink-100 transition-colors"
                            >
                              [TICKETS]
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                    {visibleItems < TOUR_DATES.length && (
                      <tr>
                        <td colSpan={4} className="py-2 px-2">
                          <span className="inline-block w-3 h-5 bg-pink-400 animate-blink-caret"></span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tour info cards */}
        <div className="backdrop-blur-md bg-black/40 border border-pink-500/30 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-400 to-pink-300 mb-6">HVAD KAN DU FORVENTE?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-md bg-pink-900/10 border border-pink-500/20 p-5 rounded-lg">
              <div className="text-pink-300 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Electronics</h3>
              <p className="text-pink-100/70">En unik blanding af elektronisk produktion og akustiske elementer der skaber et unikt lydbillede.</p>
            </div>
            <div className="backdrop-blur-md bg-pink-900/10 border border-pink-500/20 p-5 rounded-lg">
              <div className="text-pink-300 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visuelle Effekter</h3>
              <p className="text-pink-100/70">Specialdesignede visuals der akkompagnerer musikken og skaber en fuldstændig immersiv oplevelse.</p>
            </div>
            <div className="backdrop-blur-md bg-pink-900/10 border border-pink-500/20 p-5 rounded-lg">
              <div className="text-pink-300 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fællesskab</h3>
              <p className="text-pink-100/70">Mød andre musikelskere og bliv en del af den voksende STRIK-familie på vores turnédatoer.</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-pink-300/60 mb-12">
          <p>© {new Date().getFullYear()} STRIK • Elektronisk Musik • Danmark</p>
        </div>
      </div>
    </div>
  );
} 