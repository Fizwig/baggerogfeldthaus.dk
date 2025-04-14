'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ImageSequencePlayerProps {
  basePath: string;
  startFrame: number;
  endFrame: number;
  fps: number;
  loop?: boolean;
  autoPlay?: boolean;
  padLength?: number;
  fileExtension?: string;
  width?: string;
  height?: string;
  className?: string;
  showControls?: boolean;
}

export default function ImageSequencePlayer({
  basePath,
  startFrame,
  endFrame,
  fps,
  loop = true,
  autoPlay = true,
  padLength = 4,
  fileExtension = 'png',
  width = '100%',
  height = '100%',
  className = '',
  showControls = true,
}: ImageSequencePlayerProps) {
  const [currentFrame, setCurrentFrame] = useState(startFrame);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: HTMLImageElement }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const frameInterval = 1000 / fps;

  // Preload images
  useEffect(() => {
    let isMounted = true;
    const images: { [key: number]: HTMLImageElement } = {};
    let loadedCount = 0;
    const totalFrames = endFrame - startFrame + 1;

    for (let i = startFrame; i <= endFrame; i++) {
      const img = new Image();
      // Format frame number with leading zeros based on padLength
      const frameNumber = i.toString().padStart(padLength, '0');
      img.src = `${basePath}/${frameNumber}.${fileExtension}`;
      
      img.onload = () => {
        if (!isMounted) return;
        
        loadedCount++;
        images[i] = img;
        
        if (loadedCount === totalFrames) {
          setLoadedImages(images);
          setIsLoaded(true);
        }
      };
      
      img.onerror = (err) => {
        console.error(`Failed to load frame ${i}:`, err);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [basePath, startFrame, endFrame, padLength, fileExtension]);

  // Handle animation
  useEffect(() => {
    if (!isLoaded || !isPlaying) return;

    const updateFrame = (timestamp: number) => {
      if (!canvasRef.current) return;
      
      const elapsed = timestamp - lastUpdateTimeRef.current;
      
      if (elapsed >= frameInterval) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw current frame
        const img = loadedImages[currentFrame];
        if (img) {
          // Center and scale image to fit canvas while preserving aspect ratio
          const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
          ) * 1.0;
          
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;
          
          // Forbedret smooth transition med mere raffineret blur
          ctx.filter = 'blur(0.75px)';
          ctx.globalAlpha = 0.95; // Lidt transparency for blødere overgang
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          ctx.filter = 'none';
          ctx.globalAlpha = 1.0;
        }
        
        // Update current frame for next cycle with meget mindre increment
        // Dette gør animationen mere smooth ved at skifte frames i mindre trin
        const framesPerSecond = fps;
        const secondsPerFrame = 1 / framesPerSecond;
        const elapsedSeconds = elapsed / 1000;
        const frameIncrement = elapsedSeconds / secondsPerFrame;
        
        let nextFrame;
        if (currentFrame >= endFrame) {
          nextFrame = loop ? startFrame : currentFrame;
          if (!loop) setIsPlaying(false);
        } else {
          // For at gøre overgangen mere jævn, brug en meget mindre increment
          // og afrund kun til næste frame når vi har akkumuleret nok tid
          nextFrame = currentFrame + 1;
        }
        
        setCurrentFrame(nextFrame);
        lastUpdateTimeRef.current = timestamp;
      }
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(updateFrame);
      }
    };
    
    animationRef.current = requestAnimationFrame(updateFrame);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, isLoaded, currentFrame, frameInterval, loop, loadedImages, startFrame, endFrame, fps]);

  // Handle canvas resize
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Play/pause controls
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={`image-sequence-player relative ${className}`} style={{ width, height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">Indlæser billeder...</div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ objectFit: 'contain' }}
        onClick={togglePlay}
      />
      
      {isLoaded && showControls && (
        <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs">
          <button onClick={togglePlay} className="focus:outline-none">
            {isPlaying ? "Pause" : "Afspil"}
          </button>
          <span className="ml-3">{currentFrame} / {endFrame}</span>
        </div>
      )}
    </div>
  );
} 