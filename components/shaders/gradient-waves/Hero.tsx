'use client';
import React, { useRef, useEffect } from 'react';

const GradientWavesShader: React.FC = () => {
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

      // Improved hash
      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      // 2D rotation matrix
      mat2 rot(float a) {
        float c = cos(a), s = sin(a);
        return mat2(c, -s, s, c);
      }

      // Smooth value noise
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = hash(i.x + i.y * 57.0);
        float b = hash(i.x + 1.0 + i.y * 57.0);
        float c = hash(i.x + (i.y + 1.0) * 57.0);
        float d = hash(i.x + 1.0 + (i.y + 1.0) * 57.0);
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Layered fbm
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        
        for(int i = 0; i < 5; i++) {
          v += a * noise(p);
          p = rot(0.5) * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      // Ribbon-like wave pattern
      float ribbonWave(vec2 p, float time, float index) {
        float freq = 2.0 + index * 0.5;
        float phase = time * (0.3 + index * 0.1);
        
        // Sinusoidal waves with offset
        float wave = sin(p.x * freq + phase) * 0.5 + 0.5;
        wave *= sin(p.x * freq * 1.5 - phase * 0.8) * 0.5 + 0.5;
        
        // Add vertical component
        float yWave = sin(p.y * (freq * 0.5) + phase * 0.5) * 0.3;
        
        return wave + yWave;
      }

      // Distance to ribbon
      float ribbonDist(vec2 p, float time, float index) {
        float offset = index * 0.3 - 0.6;
        float wave = ribbonWave(p, time, index);
        
        float centerY = sin(p.x * (1.5 + index * 0.3) + time * (0.4 + index * 0.1)) * 0.4 + offset;
        float width = 0.15 + sin(time * 0.5 + index) * 0.05;
        
        float dist = abs(p.y - centerY - wave * 0.2);
        return smoothstep(width, 0.0, dist);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        float t = time * 0.4;
        
        // Add subtle flow distortion
        vec2 flow = vec2(
          fbm(p * 1.5 + t * 0.2) - 0.5,
          fbm(p * 1.5 - t * 0.15) - 0.5
        ) * 0.3;
        
        vec2 distorted = p + flow;
        
        // Multiple ribbon waves with depth
        float ribbons = 0.0;
        vec3 color = vec3(0.0);
        
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float ribbon = ribbonDist(distorted, t, fi);
          
          // Depth-based coloring
          float depth = fi / 5.0;
          
          // Gradient colors - deep blue to violet to pink
          vec3 c1 = vec3(0.1, 0.15, 0.4);  // Deep blue
          vec3 c2 = vec3(0.3, 0.2, 0.6);   // Violet
          vec3 c3 = vec3(0.5, 0.25, 0.7);  // Purple
          vec3 c4 = vec3(0.7, 0.3, 0.8);   // Light purple
          
          vec3 ribbonColor = mix(c1, c2, depth);
          ribbonColor = mix(ribbonColor, c3, smoothstep(0.3, 0.7, depth));
          ribbonColor = mix(ribbonColor, c4, smoothstep(0.7, 1.0, depth));
          
          // Add gradient variation based on position
          float gradientShift = sin(distorted.x * 2.0 + t + fi) * 0.5 + 0.5;
          ribbonColor = mix(ribbonColor, ribbonColor * 1.3, gradientShift * 0.4);
          
          // Brightness based on wave position
          float brightness = ribbonWave(distorted, t, fi);
          ribbonColor *= 0.7 + brightness * 0.3;
          
          // Accumulate with depth sorting
          color = mix(color, ribbonColor, ribbon * (0.9 - depth * 0.2));
          ribbons += ribbon;
        }
        
        // Edge highlighting
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float ribbon = ribbonDist(distorted, t, fi);
          float edge = ribbon * (1.0 - ribbon) * 4.0;
          
          // Bright edge glow
          vec3 edgeColor = vec3(0.4, 0.5, 1.0);
          color += edgeColor * edge * 0.3;
        }
        
        // Subtle shimmer overlay
        float shimmer = fbm(distorted * 8.0 + vec2(t * 2.0, t));
        shimmer = pow(shimmer, 4.0);
        color += vec3(0.6, 0.7, 1.0) * shimmer * ribbons * 0.15;
        
        // Vignette for depth
        float vignette = 1.0 - length(uv - 0.5) * 0.5;
        color *= vignette;
        
        // Brightness adjustment for minimalism
        color *= 0.85;
        
        gl_FragColor = vec4(color, 1.0);
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

export default GradientWavesShader;
