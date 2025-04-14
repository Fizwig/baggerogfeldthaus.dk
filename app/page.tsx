'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageSequencePlayer from '@/app/components/ImageSequencePlayer';

export default function Home() {
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
    <main className="flex min-h-screen flex-col items-center p-0 relative">
      <div className="w-full relative z-10">
        {/* Billedsekvens som logo i toppen - nu fuld skærm */}
        <div 
          className="w-full flex flex-col items-center relative -mt-16"
          onMouseMove={handleMouseMove}
          style={{ height: '100vh', marginTop: '-20px' }}
        >
          {/* Dynamic glow effect */}
          <div 
            className="absolute pointer-events-none transition-transform duration-300 z-10"
            style={{
              left: `${glowPosition.x}px`,
              top: `${glowPosition.y}px`,
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
            }}
          />

          {/* Billedsekvens som logo - fuld skærmstørrelse */}
          <div className="absolute inset-0 w-screen overflow-hidden flex items-center justify-center" style={{ maxWidth: '100vw', paddingTop: '0', marginTop: '-45px' }}>
            <ImageSequencePlayer
              basePath="/newimagesequence"
              startFrame={8}
              endFrame={196}
              fps={15}
              loop={true}
              autoPlay={true}
              padLength={4}
              fileExtension="png"
              className="w-full h-full object-contain scale-110"
              showControls={false}
            />
          </div>
        </div>
        
        {/* Resten af indholdet */}
        <div className="w-full max-w-5xl mx-auto px-4">
          {/* Footer fjernet */}
        </div>
      </div>
    </main>
  );
} 