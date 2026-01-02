'use client';
import React, { useRef, useEffect } from 'react';

const NeonFluidShader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      // Hash for noise
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      // Smooth noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Fractal Brownian Motion
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 6; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      // Turbulent fbm for flames
      float turbulence(vec2 p) {
        float value = 0.0;
        float amplitude = 1.0;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
          value += amplitude * abs(noise(p * frequency) * 2.0 - 1.0);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        float t = time * 0.3;
        
        // Create upward flowing motion
        vec2 flowDir = vec2(0.0, -1.0);
        vec2 flowPos = p + flowDir * t;
        
        // Add turbulent distortion
        float turbulent = turbulence(flowPos * 1.5 + vec2(t * 0.2, 0.0));
        float displacement = fbm(flowPos * 2.0 + vec2(t * 0.3, -t * 0.5)) * 2.0 - 1.0;
        
        vec2 distorted = p;
        distorted.x += displacement * 0.4;
        distorted.y += turbulent * 0.3;
        
        // Flame shape - stronger at bottom, thinner at top
        float flameShape = 1.0 - abs(distorted.x) * (1.0 + distorted.y * 0.8);
        flameShape = smoothstep(0.0, 0.8, flameShape);
        
        // Multiple flame layers
        float flame1 = fbm(distorted * 2.0 + vec2(t * 0.4, -t * 0.8));
        float flame2 = fbm(distorted * 3.0 + vec2(-t * 0.3, -t * 0.6));
        float flame3 = fbm(distorted * 4.0 + vec2(t * 0.5, -t * 1.0));
        
        // Combine flames with different intensities
        float flames = flame1 * 0.5 + flame2 * 0.3 + flame3 * 0.2;
        flames = pow(flames, 1.5);
        
        // Add turbulent wisps
        float wisps = turbulence(distorted * 3.0 + vec2(t * 0.2, -t * 0.7));
        wisps = pow(wisps, 2.0) * 0.3;
        
        // Combine all elements
        float intensity = flames + wisps;
        intensity *= flameShape;
        
        // Fire color gradient - from dark red to orange to yellow to white
        vec3 color1 = vec3(0.1, 0.0, 0.0);    // Dark red/black
        vec3 color2 = vec3(0.8, 0.1, 0.0);    // Deep red
        vec3 color3 = vec3(1.0, 0.3, 0.0);    // Red-orange
        vec3 color4 = vec3(1.0, 0.6, 0.0);    // Orange
        vec3 color5 = vec3(1.0, 0.9, 0.2);    // Yellow
        vec3 color6 = vec3(1.0, 1.0, 0.8);    // White-yellow
        
        // Color mapping based on intensity
        vec3 fireColor = color1;
        fireColor = mix(fireColor, color2, smoothstep(0.0, 0.2, intensity));
        fireColor = mix(fireColor, color3, smoothstep(0.2, 0.4, intensity));
        fireColor = mix(fireColor, color4, smoothstep(0.4, 0.6, intensity));
        fireColor = mix(fireColor, color5, smoothstep(0.6, 0.8, intensity));
        fireColor = mix(fireColor, color6, smoothstep(0.8, 1.0, intensity));
        
        // Add hot spots
        float hotSpots = pow(flame3, 3.0) * flameShape;
        fireColor += vec3(1.0, 1.0, 0.5) * hotSpots * 0.5;
        
        // Enhance edges with bright orange
        float edge = smoothstep(0.3, 0.5, intensity) * (1.0 - smoothstep(0.7, 0.9, intensity));
        fireColor += vec3(1.0, 0.5, 0.0) * edge * 0.3;
        
        // Darken based on position (darker at edges)
        float vignette = 1.0 - length(vec2(distorted.x, distorted.y * 0.5)) * 0.3;
        fireColor *= vignette;
        
        // Boost overall brightness
        fireColor *= 1.2;
        
        gl_FragColor = vec4(fireColor, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'position');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const timeLocation = gl.getUniformLocation(program, 'time');

    let startTime = Date.now();

    const render = () => {
      if (!gl || !canvas) return;

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (Date.now() - startTime) / 1000);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default NeonFluidShader;
