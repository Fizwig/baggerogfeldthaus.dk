'use client';

import React, { useRef, useEffect } from 'react';

const fragmentShader = `
  precision highp float;
  
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;
  
  float colormap_red(float x) {
    return mix(0.8, 1.0, x); // Meget lysere rød base
  }
  
  float colormap_green(float x) {
    return mix(0.6, 0.8, x); // Lysere grøn base
  }
  
  float colormap_blue(float x) {
    return mix(0.9, 1.0, x); // Meget lysere blå base
  }
  
  vec4 colormap(float x) {
    return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 0.3); // Meget mere transparent
  }
  
  // Noise functions remain the same
  float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    
    float res = mix(
      mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
      mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x),
      u.y);
    return res*res;
  }
  
  const mat2 mtx = mat2(0.80, 0.60, -0.60, 0.80);
  
  float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    
    f += amp * noise(p + time * 0.03); p = mtx * p * 2.02;
    amp *= 0.5;
    
    f += amp * noise(p); p = mtx * p * 2.01;
    amp *= 0.5;
    
    f += amp * noise(p + sin(time * 0.03));
    
    return f/0.96875;
  }
  
  float pattern(vec2 p) {
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0)),
                  fbm(p + vec2(5.2, 1.3)));
    
    return fbm(p + 4.0 * q);
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.x;
    vec2 mouse_norm = mouse / resolution.xy;
    
    // Meget mindre mouse influence
    float dist = length(uv - mouse_norm);
    float mouse_influence = smoothstep(0.5, 0.0, dist) * 0.05;
    
    // Generér basis pattern
    float shade = pattern(uv * 1.2 + mouse_influence);
    
    // Juster brightness og contrast
    shade = pow(shade, 0.5); // Meget lysere
    shade = smoothstep(0.3, 0.7, shade);
    
    // Få base farve fra colormap
    vec4 color = colormap(shade);
    
    // Mix med næsten hvid base farve
    color.rgb = mix(vec3(1.0, 0.98, 1.0), color.rgb, 0.2);
    
    // Meget mildere vignette
    float vignette = 1.0 - smoothstep(0.8, 2.0, length((uv - 0.5) * 2.0));
    color.rgb *= mix(0.98, 1.0, vignette);
    
    gl_FragColor = color;
  }
`;

// Simple vertex shader
const vertexShader = `
  attribute vec2 position;
  
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export default function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { 
      alpha: true,
      antialias: true,
      premultipliedAlpha: false
    });
    
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Create shader program
    const program = createShaderProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    // Set up attributes and uniforms
    const positionLocation = gl.getAttribLocation(program, 'position');
    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const mouseLocation = gl.getUniformLocation(program, 'mouse');

    // Create vertex buffer
    const vertices = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Handle resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Track mouse position
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    let startTime = performance.now();
    const animate = () => {
      const time = (performance.now() - startTime) * 0.001;

      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouseX, mouseY);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (program) gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ opacity: 1.0 }} // Fuld opacity
    />
  );
}

// Helper function to create shader program
function createShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  
  if (!vertexShader || !fragmentShader) return null;
  
  gl.shaderSource(vertexShader, vsSource);
  gl.shaderSource(fragmentShader, fsSource);
  
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);
  
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader));
    return null;
  }
  
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
    return null;
  }
  
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return null;
  }
  
  return program;
} 