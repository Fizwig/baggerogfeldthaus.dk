'use client';

import React, { useRef, useEffect, useState } from 'react';

// Fragment shader kombineret med plasma baggrund og metaballs
const fragmentShader = `
  precision highp float;
  
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;
  uniform float mouseActive;
  
  const int NUM_METABALLS = 25;
  uniform vec3 metaballs[25];
  
  // Blue/Silver Chrome theme colors
  vec3 color1 = vec3(0.20, 0.40, 0.75); // Blue
  vec3 color2 = vec3(0.15, 0.25, 0.60); // Dark blue
  vec3 color3 = vec3(0.70, 0.75, 0.85); // Silver
  vec3 color4 = vec3(0.55, 0.65, 0.95); // Light blue
  vec3 color5 = vec3(0.40, 0.65, 0.90); // Medium blue
  
  // Colormap funktioner for plasma baggrund
  float colormap_red(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else {
        return 1.0;
    }
  }

  float colormap_green(float x) {
    if (x < 20049.0 / 82979.0) {
        return 0.0;
    } else if (x < 327013.0 / 810990.0) {
        return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
    } else if (x <= 1.0) {
        return (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0;
    } else {
        return 1.0;
    }
  }

  float colormap_blue(float x) {
    if (x < 0.0) {
        return 54.0 / 255.0;
    } else if (x < 7249.0 / 82979.0) {
        return (829.79 * x + 54.51) / 255.0;
    } else if (x < 20049.0 / 82979.0) {
        return 127.0 / 255.0;
    } else if (x < 327013.0 / 810990.0) {
        return (792.02249341361393720147485376583 * x - 64.364790735602331034989206222672) / 255.0;
    } else {
        return 1.0;
    }
  }

  vec4 colormap(float x) {
    return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
  }

  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);

    float res = mix(
        mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
        mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
    return res*res;
  }

  const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);

  float fbm(vec2 p) {
    float f = 0.0;

    f += 0.500000*noise(p + time * 0.2); p = mtx*p*2.02;
    f += 0.031250*noise(p); p = mtx*p*2.01;
    f += 0.250000*noise(p); p = mtx*p*2.03;
    f += 0.125000*noise(p); p = mtx*p*2.01;
    f += 0.062500*noise(p); p = mtx*p*2.04;
    f += 0.015625*noise(p + sin(time * 0.3));

    return f/0.96875;
  }

  float pattern(in vec2 p) {
    return fbm(p + fbm(p + fbm(p)));
  }
  
  // Metaballs funktioner
  float computeMetaballs(float x, float y) {
    float v = 0.0;
    
    // Add mouse metaball if active
    if (mouseActive > 0.5) {
      float mouseSize = 0.3 * resolution.x; // Larger mouse influence
      float dx = mouse.x - x;
      float dy = mouse.y - y;
      v += mouseSize * mouseSize / (dx * dx + dy * dy);
    }
    
    // Regular metaballs
    for (int i = 0; i < NUM_METABALLS; i++) {
      vec3 mb = metaballs[i];
      float dx = mb.x - x;
      float dy = mb.y - y;
      float r = mb.z;
      
      v += r*r/(dx*dx + dy*dy);
    }
    
    return v;
  }
  
  // Original noise function for metaballs texture
  float metaballNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  
  // Fractal noise for metaballs texture
  float metaballFbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    
    for (int i = 0; i < 4; i++) {
      v += a * metaballNoise(p);
      p = rot * p * 2.0 + shift;
      a *= 0.5;
    }
    
    return v;
  }
  
  vec3 pulseColor(vec3 color, float factor) {
    // Make the color pulse with time
    return color * (1.0 + 0.1 * sin(time * factor));
  }
  
  vec4 metaballGradient(vec2 uv) {
    // Create gradient with time-based color cycling for chrome/blue look
    vec3 chrome = vec3(0.75, 0.78, 0.82); // Base silver chrome
    vec3 blue1 = vec3(0.23, 0.45, 0.80); // Vivid blue
    vec3 blue2 = vec3(0.14, 0.24, 0.58); // Deep blue
    vec3 highlight = vec3(0.95, 0.98, 1.0); // White highlight
    
    // Distance from center for radial gradient
    float t = length(uv - 0.5) * 1.5;
    
    // Chrome effect with reflective highlight
    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float highlightIntensity = pow(0.5 + 0.5 * sin(angle * 5.0 + time * 2.0), 3.0); // Creates streaks
    
    // Mirror-like reflections that move with time
    float reflection = pow(0.5 + 0.5 * sin(angle * 3.0 + t * 8.0 + time), 5.0) * 0.5;
    
    // Mix colors based on time and position for chrome effect
    float mixFactor = sin(time * 0.2) * 0.5 + 0.5;
    vec3 baseColor = mix(blue1, blue2, t);
    
    // Add chrome reflective quality
    baseColor = mix(baseColor, chrome, 0.6 * (1.0 - t)); 
    
    // Add highlight streaks
    baseColor = mix(baseColor, highlight, highlightIntensity * 0.3);
    
    // Add moving reflections
    baseColor = mix(baseColor, highlight, reflection * 0.4);
    
    // Add subtle noise for texture
    float n = metaballFbm(uv * 3.0 + time * 0.1) * 0.1;
    baseColor += n * vec3(0.1, 0.15, 0.2); // Blue-tinted noise
    
    return vec4(baseColor, 1.0);
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float x = gl_FragCoord.x;
    float y = gl_FragCoord.y;
    
    // Beregn plasma baggrund
    float shade = pattern(uv * 2.0);
    vec4 bgColor = colormap(shade);
    
    // Gør baggrunden lidt mere gennemsigtig
    bgColor.a = 0.85;
    
    // Metaballs calculation
    float v = computeMetaballs(x, y);
    
    // Hvis vi er inde i en metaball
    if (v > 1.0) {
      // Base gradient color
      vec4 metaballColor = metaballGradient(uv);
      
      // Add noise effect for texture
      float noiseVal = metaballFbm(gl_FragCoord.xy / 80.0 + time * 0.05);
      
      // Create shiny chrome-like highlights
      if (noiseVal > 0.6) {
        // Bright silver highlight
        metaballColor = metaballColor + vec4(0.25, 0.25, 0.3, 0.0) * noiseVal;
      } else {
        // Slightly darker for contrast
        metaballColor = metaballColor * 0.90;
      }
      
      // Create a pulsing glow effect based on metaball strength
      float glowPulse = sin(time * 1.5) * 0.5 + 0.5;
      
      // Add chrome shine on edges - more pronounced for metallic look
      float edge = smoothstep(1.0, 1.5, v);
      metaballColor += vec4(0.3, 0.35, 0.4, 0.0) * edge * (0.8 + glowPulse * 0.4);
      
      // Add cool blue glow around edges
      float glow = min(v * 0.02, 0.3);
      metaballColor += vec4(glow * 0.2, glow * 0.3, glow * 0.6, 0.0);
      
      // Enhanced silver/blue sparkles effect for chrome appearance
      float sparkle = pow(noiseVal, 8.0) * sin(time * 4.0 + uv.x * 15.0 + uv.y * 15.0);
      if (sparkle > 0.4) {
        // Brighter blue-white sparkles
        metaballColor += vec4(0.2, 0.3, 0.6, 0.0) * (sparkle - 0.4) * 2.5;
      }
      
      gl_FragColor = vec4(metaballColor.rgb, 0.92);
    } else {
      // Udenfor metaballs - vis baggrunden
      gl_FragColor = bgColor;
    }
  }
`;

// Vertex shader (basic)
const vertexShader = `
  attribute vec2 position;
  
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

interface ShaderBackgroundProps {
  className?: string;
}

const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);
  const metaballsRef = useRef<Float32Array | null>(null);
  const originalPositionsRef = useRef<Float32Array | null>(null);
  const mouseRef = useRef<{x: number, y: number, active: boolean}>({ x: 0, y: 0, active: false });
  
  // Track mouse position
  const [mousePosition, setMousePosition] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  const [mouseActive, setMouseActive] = useState<boolean>(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    const handleMouseEnter = () => {
      setMouseActive(true);
      mouseRef.current.active = true;
    };
    
    const handleMouseLeave = () => {
      setMouseActive(false);
      mouseRef.current.active = false;
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Initialize WebGL context
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) {
      console.error('WebGL not supported');
      
      // Fallback to CSS gradient if WebGL is not supported
      if (canvas.parentElement) {
        canvas.parentElement.style.background = 'linear-gradient(to bottom right, #152a8e, #b1376c)';
      }
      return;
    }
    
    // Enable alpha blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Compile shaders
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertShader) return;
    gl.shaderSource(vertShader, vertexShader);
    gl.compileShader(vertShader);
    
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragShader) return;
    gl.shaderSource(fragShader, fragmentShader);
    gl.compileShader(fragShader);
    
    // Check for shader compilation errors
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error: ', gl.getShaderInfoLog(fragShader));
      return;
    }
    
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation error: ', gl.getShaderInfoLog(vertShader));
      return;
    }
    
    // Create shader program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    
    // Check for program linking errors
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error: ', gl.getProgramInfoLog(program));
      return;
    }
    
    gl.useProgram(program);
    
    // Create a buffer for the quad
    const vertices = new Float32Array([
      -1.0, -1.0,  // bottom left
       1.0, -1.0,  // bottom right
      -1.0,  1.0,  // top left
       1.0,  1.0,  // top right
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'position');
    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const metaballsLocation = gl.getUniformLocation(program, 'metaballs');
    const mouseLocation = gl.getUniformLocation(program, 'mouse');
    const mouseActiveLocation = gl.getUniformLocation(program, 'mouseActive');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Initialize metaballs
    initMetaballs(canvas.width, canvas.height);
    
    // Handle canvas resize
    const handleResize = () => {
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        
        // Reinitialize metaballs for new size
        initMetaballs(canvas.width, canvas.height);
      }
    };
    
    // Initialize metaballs with predefined groups similar to the reference
    function initMetaballs(width: number, height: number) {
      const NUM_METABALLS = 25; // Increased number of metaballs
      const metaballs = new Float32Array(NUM_METABALLS * 3);
      const originalPositions = new Float32Array(NUM_METABALLS * 2);
      
      // Create metaballs distributed across the screen in groups
      for (let i = 0; i < NUM_METABALLS; i++) {
        // Distribute metaballs across the screen in clusters
        let posX, posY, radius;
        
        // Create clusters in different regions
        if (i < 6) {
          // Top left cluster
          posX = width * (0.1 + Math.random() * 0.25);
          posY = height * (0.1 + Math.random() * 0.25);
          radius = Math.min(width, height) * (0.03 + Math.random() * 0.05);
        } else if (i < 12) {
          // Bottom right cluster
          posX = width * (0.65 + Math.random() * 0.3);
          posY = height * (0.65 + Math.random() * 0.3);
          radius = Math.min(width, height) * (0.03 + Math.random() * 0.06);
        } else if (i < 18) {
          // Middle/center cluster
          posX = width * (0.4 + Math.random() * 0.3);
          posY = height * (0.35 + Math.random() * 0.3);
          radius = Math.min(width, height) * (0.04 + Math.random() * 0.07);
        } else {
          // Scattered individuals
          posX = width * Math.random();
          posY = height * Math.random();
          radius = Math.min(width, height) * (0.02 + Math.random() * 0.04);
        }
        
        // Store original positions for animation
        originalPositions[i * 2] = posX;
        originalPositions[i * 2 + 1] = posY;
        
        // Set initial positions and radius
        metaballs[i * 3] = posX;
        metaballs[i * 3 + 1] = posY;
        metaballs[i * 3 + 2] = radius;
      }
      
      metaballsRef.current = metaballs;
      originalPositionsRef.current = originalPositions;
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Animation loop
    const animate = (time: number) => {
      timeRef.current = time * 0.001; // Convert to seconds
      
      // Clear the canvas
      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Update mouse uniform
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(mouseActiveLocation, mouseRef.current.active ? 1.0 : 0.0);
      
      // Update metaballs positions
      if (metaballsRef.current && originalPositionsRef.current) {
        const metaballs = metaballsRef.current;
        const originalPositions = originalPositionsRef.current;
        
        for (let i = 0; i < 25; i++) {
          const t = timeRef.current;
          
          // Get original position (center of movement)
          const origX = originalPositions[i * 2];
          const origY = originalPositions[i * 2 + 1];
          const radius = metaballs[i * 3 + 2];
          
          // Factor to influence metaballs by mouse position when active
          let mouseInfluence = 0;
          if (mouseRef.current.active) {
            const dx = mouseRef.current.x - origX;
            const dy = mouseRef.current.y - origY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.min(canvas.width, canvas.height) * 0.3;
            
            // Only influence if within range
            if (dist < maxDist) {
              // Attraction strength decreases with distance
              mouseInfluence = 1 - dist / maxDist;
              
              // Make some metaballs attracted and some repelled
              if (i % 3 === 0) mouseInfluence *= -0.5; // Repel some
            }
          }
          
          // Different movement patterns for different groups, but always around original position
          let xOffset = 0;
          let yOffset = 0;
          
          if (i < 6) {
            // Top left group - gentle circular motion
            const speed = 0.2 + i * 0.02;
            const radiusX = canvas.width * 0.05;
            const radiusY = canvas.height * 0.05;
            xOffset = Math.sin(t * speed) * radiusX;
            yOffset = Math.cos(t * speed) * radiusY;
          } else if (i < 12) {
            // Bottom right group - more complex motion
            const speed = 0.15 + i * 0.01;
            const radiusX = canvas.width * 0.07;
            const radiusY = canvas.height * 0.04;
            xOffset = Math.sin(t * speed) * Math.cos(t * 0.3) * radiusX;
            yOffset = Math.cos(t * speed) * Math.sin(t * 0.2) * radiusY;
          } else if (i < 18) {
            // Middle group - wobbling motion
            const speed = 0.3 + (i - 12) * 0.015;
            const radiusX = canvas.width * 0.06;
            const radiusY = canvas.height * 0.06;
            xOffset = Math.sin(t * speed + i) * radiusX;
            yOffset = Math.sin(t * speed * 0.7 + i * 2) * radiusY;
          } else {
            // Individual scattered metaballs - random wandering
            const speed = 0.1 + (i - 18) * 0.03;
            const radiusX = canvas.width * 0.08;
            const radiusY = canvas.height * 0.08;
            xOffset = Math.sin(t * speed + i * 3) * Math.cos(t * 0.2) * radiusX;
            yOffset = Math.cos(t * speed * 0.8) * Math.sin(t * 0.3 + i) * radiusY;
          }
          
          // Add mouse influence
          if (mouseInfluence !== 0) {
            const dx = mouseRef.current.x - origX;
            const dy = mouseRef.current.y - origY;
            const mouseFactor = mouseInfluence * 0.3; // Scale the influence
            
            xOffset += dx * mouseFactor;
            yOffset += dy * mouseFactor;
          }
          
          // Apply offsets to original position
          metaballs[i * 3] = origX + xOffset;
          metaballs[i * 3 + 1] = origY + yOffset;
          
          // Add subtle size pulsing with time
          const sizePulse = 1.0 + 0.15 * Math.sin(t * 0.5 + i * 0.2);
          const baseRadius = Math.min(canvas.width, canvas.height) * 
            (0.03 + (i < 18 ? 0.03 + i * 0.002 : 0.02));
          metaballs[i * 3 + 2] = baseRadius * sizePulse;
          
          // Ensure metaballs stay within screen bounds (safety check)
          metaballs[i * 3] = Math.max(radius, Math.min(canvas.width - radius, metaballs[i * 3]));
          metaballs[i * 3 + 1] = Math.max(radius, Math.min(canvas.height - radius, metaballs[i * 3 + 1]));
        }
        
        // Update uniform
        gl.uniform3fv(metaballsLocation, metaballs);
      }
      
      // Update time uniform
      gl.uniform1f(timeLocation, timeRef.current);
      
      // Draw the quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      // Schedule the next frame
      requestRef.current = requestAnimationFrame(animate);
    };
    
    requestRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      window.removeEventListener('resize', handleResize);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buffer);
    };
  }, []);
  
  return (
    <div className="shader-background-container fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full" 
           style={{ 
             background: 'linear-gradient(to bottom right, #152a8e, #b1376c)',
             opacity: 0.5,
             zIndex: -6 
           }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-dots opacity-15 z-5"></div>
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full ${className || ''}`}
        style={{ position: 'fixed', zIndex: -5 }} 
      />
    </div>
  );
};

export default ShaderBackground; 