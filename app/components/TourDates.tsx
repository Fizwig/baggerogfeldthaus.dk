'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface TourDate {
  date: string;
  month: string;
  city: string;
  venue: string;
  tickets: string;
  isSoldOut: boolean;
}

const tourDates: TourDate[] = [
  {
    date: '10',
    month: 'MAR',
    city: 'København',
    venue: 'VEGA',
    tickets: '#',
    isSoldOut: false
  },
  {
    date: '15',
    month: 'MAR',
    city: 'Aarhus',
    venue: 'Train',
    tickets: '#',
    isSoldOut: false
  },
  {
    date: '22',
    month: 'MAR',
    city: 'Odense',
    venue: 'Posten',
    tickets: '#',
    isSoldOut: false
  },
  {
    date: '28',
    month: 'MAR',
    city: 'Aalborg',
    venue: 'Skråen',
    tickets: '#',
    isSoldOut: true
  },
  {
    date: '5',
    month: 'APR',
    city: 'Esbjerg',
    venue: 'Tobakken',
    tickets: '#',
    isSoldOut: false
  }
];

const TOUR_DATES = [
  {
    date: "12. MAR 2025",
    city: "KØBENHAVN",
    location: "VEGA",
    ticketLink: "https://billetto.dk/strikogdrik-kobenhavn",
    soldOut: false
  },
  {
    date: "19. MAR 2025",
    city: "AARHUS",
    location: "TRAIN",
    ticketLink: "https://billetto.dk/strikogdrik-aarhus",
    soldOut: false
  },
  {
    date: "26. MAR 2025",
    city: "ODENSE",
    location: "POSTEN",
    ticketLink: "https://billetto.dk/strikogdrik-odense",
    soldOut: true
  },
  {
    date: "02. APR 2025",
    city: "AALBORG",
    location: "SKRÅEN",
    ticketLink: "https://billetto.dk/strikogdrik-aalborg",
    soldOut: false
  },
  {
    date: "09. APR 2025",
    city: "ESBJERG",
    location: "TOBAKKEN",
    ticketLink: "https://billetto.dk/strikogdrik-esbjerg",
    soldOut: false
  },
  {
    date: "16. APR 2025",
    city: "HERNING",
    location: "FERMATEN",
    ticketLink: "https://billetto.dk/strikogdrik-herning",
    soldOut: false
  },
  {
    date: "23. APR 2025",
    city: "ROSKILDE",
    location: "GIMLE",
    ticketLink: "https://billetto.dk/strikogdrik-roskilde",
    soldOut: false
  }
];

const TourDates: React.FC = () => {
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
    <div>
      <div className="terminal-box mx-auto max-w-3xl mb-10">
        <div className="terminal-header">
          <span className="font-mono text-accent">tour_dates.log</span>
        </div>
        <div className="terminal-body font-mono">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-accent border-b border-gray-700">
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
                  className="border-b border-gray-800 hover:bg-terminal-gray transition-colors"
                >
                  <td className="py-3 px-2 text-primary">{show.date}</td>
                  <td className="py-3 px-2">{show.city}</td>
                  <td className="py-3 px-2 hidden md:table-cell text-gray-400">{show.location}</td>
                  <td className="py-3 px-2 text-right">
                    {show.soldOut ? (
                      <span className="text-red-500">SOLD_OUT</span>
                    ) : (
                      <a 
                        href={show.ticketLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan inline-block hover:text-primary transition-colors"
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
                    <span className="inline-block w-3 h-5 bg-primary animate-blink-caret"></span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="neu-container p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Tour Image */}
          <div className="neu-card overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 relative">
              <Image 
                src="/baggerogfeldthaus/STRIKOGDRIKBILLEDE1.jpg" 
                alt="Strik og Drik Tour" 
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="p-4 text-center">
              <h3 className="text-2xl font-bold text-pink-600 mb-2">STRIK OG DRIK TOUR 2025</h3>
              <p className="text-gray-600">Tag med på en unik oplevelse med strik, drinks og god stemning!</p>
            </div>
          </div>

          {/* Tour Dates */}
          <div>
            <h2 className="text-2xl font-bold text-pink-600 mb-4">Kommende datoer</h2>
            <div className="space-y-4">
              {tourDates.map((tour, index) => (
                <div key={index} className="neu-card-pink p-0 overflow-hidden">
                  <div className="flex items-center">
                    <div className="neu-date-badge flex flex-col justify-center items-center mr-4 min-w-[4rem] p-3">
                      <span className="text-white font-bold text-2xl">{tour.date}</span>
                      <span className="text-white text-sm">{tour.month}</span>
                    </div>
                    <div className="flex-grow p-4">
                      <h3 className="font-bold text-lg">{tour.city}</h3>
                      <p className="text-gray-600">{tour.venue}</p>
                    </div>
                    <div className="p-4">
                      {tour.isSoldOut ? (
                        <span className="neu-badge-sold-out inline-block">Udsolgt</span>
                      ) : (
                        <a 
                          href={tour.tickets} 
                          className="neu-button-small"
                          rel="noopener noreferrer"
                        >
                          Billetter
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <a 
                href="https://billetto.dk/strikogdrik" 
                target="_blank" 
                rel="noopener noreferrer"
                className="neu-button-pink-lg inline-block"
              >
                Køb Billetter
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-10 neu-card p-6">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">Hvad kan du forvente?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="neu-card p-4">
              <h3 className="font-bold text-lg mb-2">Strikketips</h3>
              <p>Lær nye teknikker og få inspiration til dine strikprojekter.</p>
            </div>
            <div className="neu-card p-4">
              <h3 className="font-bold text-lg mb-2">Cocktails</h3>
              <p>Smag på lækre cocktails, der er specielt designet til arrangementet.</p>
            </div>
            <div className="neu-card p-4">
              <h3 className="font-bold text-lg mb-2">Fællesskab</h3>
              <p>Mød andre strikkeglade mennesker og del din passion.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDates; 