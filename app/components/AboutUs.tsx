'use client';

import React, { useState, useEffect } from 'react';

const ABOUT_TEXT = [
  'Strik & Drik er en unik oplevelse, hvor strik og comedy mødes i en perfekt kombination.',
  '',
  'Vores turnéshow i 2025 tager publikum med på en rejse gennem hele Danmark,',
  'hvor vi skaber et hyggeligt fællesskab omkring strikkepindene og de sjove historier.',
  '',
  'Under showet vil vi:',
  '- Lære dig nye strikketeknikker',
  '- Dele sjove historier og anekdoter',
  '- Nyde gode drikkevarer',
  '- Skabe et unikt fællesskab',
  '',
  'Tag dine strikkepinde med og vær klar til en aften fuld af garn, grin og godt selskab!',
  '',
  'Alle er velkomne - fra nybegyndere til erfarne strikkere.'
];

const NeuAboutUs = () => {
  return (
    <div className="space-y-6">
      <div className="neu-text-container">
        <h3 className="text-xl font-medium text-neupink-600 mb-3">Om Strik & Drik</h3>
        <p className="text-neugray-700 mb-4">
          Velkommen til Strik & Drik - et innovativt koncept hvor håndarbejde møder social hygge!
        </p>
        <p className="text-neugray-700 mb-4">
          Vi turnerer i hele Danmark i 2025 med vores helt særlige event, hvor du kan lære at strikke mens du nyder lækre drinks og godt selskab. Alle er velkomne - både begyndere og erfarne strikkere!
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neu-info-card">
          <div className="neu-info-icon">🧶</div>
          <h4 className="text-lg font-medium text-neupink-500 mb-2">Hvad skal jeg medbringe?</h4>
          <p className="text-neugray-600">
            Vi sørger for strikkepinde, garn og opskrifter, så du skal bare medbringe dit gode humør! Alle materialer er inkluderet i billetten.
          </p>
        </div>
        
        <div className="neu-info-card">
          <div className="neu-info-icon">🍹</div>
          <h4 className="text-lg font-medium text-neupink-500 mb-2">Hvad er inkluderet?</h4>
          <p className="text-neugray-600">
            Din billet inkluderer et strikkesæt, professionel vejledning og to speciallavede drinks. Ekstra drikkevarer kan købes til favorable priser.
          </p>
        </div>
      </div>
      
      <div className="neu-text-container">
        <h3 className="text-xl font-medium text-neupink-600 mb-3">Event Information</h3>
        <ul className="space-y-3 text-neugray-700">
          <li className="flex items-start">
            <span className="neu-list-bullet mr-3">⏱️</span>
            <span>Varighed: 3 timer (19:00 - 22:00)</span>
          </li>
          <li className="flex items-start">
            <span className="neu-list-bullet mr-3">👥</span>
            <span>Maksimalt 30 deltagere pr. event</span>
          </li>
          <li className="flex items-start">
            <span className="neu-list-bullet mr-3">🎯</span>
            <span>Perfekt til vennegrupper, polterabends og teambuilding</span>
          </li>
          <li className="flex items-start">
            <span className="neu-list-bullet mr-3">💌</span>
            <span>Kontakt os for private arrangementer og firmabookinger</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default function AboutUs() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  
  const aboutText = [
    "// ABOUT_STRIK&DRIK",
    "Strik & Drik er en anderledes og interaktiv comedy-oplevelse,",
    "hvor der bliver strikket og drukket øl live på scenen.",
    "",
    "Oplev stand-up komikeren og skuespilleren Anders Grau,",
    "samt journalist og forfatter Emilie Meng Lund,",
    "der tager publikum med på en underholdende rejse gennem",
    "strikkeprojekter, øl-smagning og historier fra deres karrierer.",
    "",
    "Under showet vil Anders og Emilie drikke specialøl,",
    "som publikum også får mulighed for at smage.",
    "Samtidig vil de strikke på et fællesprojekt,",
    "som vil blive færdiggjort i løbet af touren.",
    "",
    "Et unikt show for alle der elsker comedy, øl, håndarbejde",
    "eller bare en anderledes aften i byen.",
    "",
    "// BOOKING_INFO",
    "For booking: kontakt@strikogdrik.dk",
    "",
    "> END_OF_FILE"
  ];

  useEffect(() => {
    if (visibleLines < aboutText.length) {
      const timer = setTimeout(() => {
        setVisibleLines(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [visibleLines, aboutText.length]);

  return (
    <div className="terminal-box max-w-3xl mx-auto">
      <div className="terminal-header">
        <span className="font-mono text-accent">about_us.txt</span>
      </div>
      <div className="terminal-body p-6 font-mono text-left">
        <pre className="whitespace-pre-wrap">
          {aboutText.slice(0, visibleLines).map((line, index) => {
            if (line.startsWith('//')) {
              return <div key={index} className="text-primary font-bold mb-2">{line}</div>;
            } else if (line.startsWith('>')) {
              return <div key={index} className="text-accent italic mt-4">{line}</div>;
            } else if (line === "") {
              return <div key={index}>&nbsp;</div>;
            } else {
              return <div key={index} className="text-gray-300">{line}</div>;
            }
          })}
          {visibleLines < aboutText.length && (
            <span className="inline-block w-3 h-5 bg-primary animate-blink-caret"></span>
          )}
        </pre>
      </div>
    </div>
  );
} 