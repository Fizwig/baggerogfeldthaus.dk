'use client';

import React, { useState, useEffect } from 'react';

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

export default function AboutUs() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

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