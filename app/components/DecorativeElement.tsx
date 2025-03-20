'use client';

import React, { useState, useEffect } from 'react';

type PatternType = 'grid' | 'dots' | 'wave' | 'lines' | 'circles' | 'matrix' | 'scanlines' | 'hexagons';

interface DecorativeElementProps {
  pattern: PatternType;
  className?: string;
  size?: number;
  color?: string;
}

export default function DecorativeElement({ 
  pattern, 
  className = '',
  size = 100,
  color = 'currentColor'
}: DecorativeElementProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // Render SVG patterns if needed
  const renderPattern = () => {
    switch (pattern) {
      case 'grid':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="1" fill={color} fillOpacity="0.2" />
            <rect y="25" width="100" height="1" fill={color} fillOpacity="0.2" />
            <rect y="50" width="100" height="1" fill={color} fillOpacity="0.2" />
            <rect y="75" width="100" height="1" fill={color} fillOpacity="0.2" />
            <rect y="100" width="100" height="1" fill={color} fillOpacity="0.2" />
            <rect width="1" height="100" fill={color} fillOpacity="0.2" />
            <rect x="25" width="1" height="100" fill={color} fillOpacity="0.2" />
            <rect x="50" width="1" height="100" fill={color} fillOpacity="0.2" />
            <rect x="75" width="1" height="100" fill={color} fillOpacity="0.2" />
            <rect x="100" width="1" height="100" fill={color} fillOpacity="0.2" />
          </svg>
        );
      case 'dots':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="0" cy="0" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="25" cy="0" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="50" cy="0" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="75" cy="0" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="100" cy="0" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="0" cy="25" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="25" cy="25" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="50" cy="25" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="75" cy="25" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="100" cy="25" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="0" cy="50" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="25" cy="50" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="50" cy="50" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="75" cy="50" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="100" cy="50" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="0" cy="75" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="25" cy="75" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="50" cy="75" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="75" cy="75" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="100" cy="75" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="0" cy="100" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="25" cy="100" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="50" cy="100" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="75" cy="100" r="2" fill={color} fillOpacity="0.3" />
            <circle cx="100" cy="100" r="2" fill={color} fillOpacity="0.3" />
          </svg>
        );
      case 'wave':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 20C10 10 15 30 25 20C35 10 40 30 50 20C60 10 65 30 75 20C85 10 90 30 100 20V100H0V20Z" fill={color} fillOpacity="0.1" />
            <path d="M0 40C10 30 15 50 25 40C35 30 40 50 50 40C60 30 65 50 75 40C85 30 90 50 100 40V100H0V40Z" fill={color} fillOpacity="0.1" />
            <path d="M0 60C10 50 15 70 25 60C35 50 40 70 50 60C60 50 65 70 75 60C85 50 90 70 100 60V100H0V60Z" fill={color} fillOpacity="0.1" />
          </svg>
        );
      case 'lines':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="10" x2="100" y2="10" stroke={color} strokeOpacity="0.2" />
            <line x1="10" y1="0" x2="10" y2="100" stroke={color} strokeOpacity="0.2" />
            <line x1="0" y1="30" x2="100" y2="30" stroke={color} strokeOpacity="0.15" />
            <line x1="30" y1="0" x2="30" y2="100" stroke={color} strokeOpacity="0.15" />
            <line x1="0" y1="50" x2="100" y2="50" stroke={color} strokeOpacity="0.2" />
            <line x1="50" y1="0" x2="50" y2="100" stroke={color} strokeOpacity="0.2" />
            <line x1="0" y1="70" x2="100" y2="70" stroke={color} strokeOpacity="0.15" />
            <line x1="70" y1="0" x2="70" y2="100" stroke={color} strokeOpacity="0.15" />
            <line x1="0" y1="90" x2="100" y2="90" stroke={color} strokeOpacity="0.2" />
            <line x1="90" y1="0" x2="90" y2="100" stroke={color} strokeOpacity="0.2" />
          </svg>
        );
      case 'circles':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill={color} fillOpacity="0.05" />
            <circle cx="50" cy="50" r="30" fill={color} fillOpacity="0.07" />
            <circle cx="50" cy="50" r="20" fill={color} fillOpacity="0.1" />
            <circle cx="50" cy="50" r="10" fill={color} fillOpacity="0.12" />
            <circle cx="80" cy="20" r="15" fill={color} fillOpacity="0.07" />
            <circle cx="20" cy="80" r="12" fill={color} fillOpacity="0.1" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Handle CSS class based patterns
  const getPatternClasses = (): string => {
    switch (pattern) {
      case 'matrix':
        return 'bg-matrix bg-repeat animate-scan';
      case 'grid':
        return 'bg-grid bg-repeat';
      case 'scanlines':
        return 'bg-scanlines bg-repeat';
      case 'hexagons':
        return 'bg-hexagons bg-repeat';
      default:
        return 'bg-scanlines bg-repeat';
    }
  };

  return (
    <div 
      className={`${getPatternClasses()} w-full h-full transition-opacity duration-1000 ${isLoaded ? 'opacity-20' : 'opacity-0'} ${className}`}
    />
  );
}