'use client';

import { useEffect, useRef } from 'react';

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Få WebGL kontekst
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL er ikke understøttet');
      return;
    }

    // Tilpas canvas til skærmens størrelse
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Vertex shader - simpel passthrough
    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    // Fragment shader - custom shader med pink farve i stedet for guld
    // Opdateret for langsommere og mere flydende animation
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;

      void main() {
        // Langsommere tid faktor
        float slowTime = iTime * 0.35;
        
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 p = 4.5 * ((fragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;
        vec2 i = p;
        float c = 0.0;
        
        // Mere subtil og langsommere bevægelse
        float r = length(p + vec2(sin(slowTime * 0.4), sin(slowTime * 0.1 + 99.0)) * 1.2);
        float d = length(p);
        
        // Langsommere rotation
        float rot = d + slowTime * 0.5 + p.x * 0.1; 
        
        for (float n = 0.0; n < 4.0; n++) {
          // Langsommere transformation
          p *= mat2(cos(rot-sin(slowTime/8.0)), sin(rot), -sin(cos(rot*0.6)-slowTime*0.5), cos(rot)) * -0.12;
          
          // Langsommere bølge animation
          float t = r - slowTime / (n + 2.5);
          
          // Mere blød bevægelse
          i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r) * 0.8;
          
          c += 1.0 / length(vec2((sin(i.x + t) / 0.15), (cos(i.y + t) / 0.15)));
        }
        
        c /= 4.0;
        
        // Blødere og mere saturerede neon pink farver
        vec3 color = vec3(c) * vec3(4.0, 0.35, 2.4) - 0.3;
        
        // Smooth pulsering af farveintensiteten
        float pulseIntensity = 1.0 + sin(slowTime * 0.2) * 0.1;
        color *= pulseIntensity;
        
        gl_FragColor = vec4(color, 0.85);
      }
    `;

    // Kompiler shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Tjek for kompileringsfejl
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader kompileringsfejl:', gl.getShaderInfoLog(vertexShader));
      return;
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader kompileringsfejl:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    // Opret og link program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Tjek for linkningsfejl
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linkningsfejl:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Opret vertices for at dække hele skærmen
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Få shader attributter og uniforms
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const iResolutionUniform = gl.getUniformLocation(program, 'iResolution');
    const iTimeUniform = gl.getUniformLocation(program, 'iTime');

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    // Animation loop med en mere stabil frame rate
    let startTime = Date.now();
    let lastFrame = 0;
    let animationFrameId: number;

    const render = (timestamp: number) => {
      // Mere jævn tidsopdatering
      const currentTime = (Date.now() - startTime) / 1000;
      
      gl.uniform2f(iResolutionUniform, canvas.width, canvas.height);
      gl.uniform1f(iTimeUniform, currentTime);
      
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(vertexBuffer);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full -z-10 bg-black"
      style={{ pointerEvents: 'none' }}
    />
  );
} 