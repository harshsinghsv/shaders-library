'use client';
import React, { useRef, useEffect } from 'react';

const CosmicNebulaShader: React.FC = () => {
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

      // Hash for pseudo-random values
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      // 3D noise
      float noise(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        
        return mix(
          mix(mix(hash(p), hash(p + vec3(1,0,0)), f.x),
              mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
              mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y),
          f.z);
      }

      // Fractal Brownian Motion for nebula clouds
      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 6; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.1;
          amplitude *= 0.45;
        }
        return value;
      }

      // Domain warping for nebula distortion
      vec3 domainWarp(vec3 p, float time) {
        vec3 q = vec3(
          fbm(p + vec3(0.0, 0.0, time * 0.1)),
          fbm(p + vec3(5.2, 1.3, time * 0.15)),
          fbm(p + vec3(1.7, 9.2, time * 0.08))
        );
        
        return p + q * 0.5;
      }

      // Stars
      float stars(vec2 p, float count) {
        vec2 pos = floor(p * count);
        float star = hash(vec3(pos, 1.0));
        
        if(star > 0.98) {
          vec2 center = (pos + 0.5) / count;
          float dist = length(p - center);
          float brightness = hash(vec3(pos, 2.0));
          float twinkle = sin(time * 2.0 + brightness * 10.0) * 0.5 + 0.5;
          return (1.0 - smoothstep(0.0, 0.002, dist)) * brightness * twinkle;
        }
        return 0.0;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        float t = time * 0.15;
        
        // 3D position for nebula
        vec3 pos = vec3(p * 1.5, t);
        
        // Domain warp for swirling nebula
        vec3 warped = domainWarp(pos, t);
        
        // Layered nebula clouds
        float nebula1 = fbm(warped * 2.0);
        float nebula2 = fbm(warped * 3.0 + vec3(2.0, 1.0, 0.0));
        float nebula3 = fbm(warped * 4.0 - vec3(1.0, 2.0, 0.0));
        
        // Combine nebula layers
        float nebulaDensity = nebula1 * 0.6 + nebula2 * 0.3 + nebula3 * 0.1;
        nebulaDensity = pow(nebulaDensity, 1.5);
        
        // Cosmic color palette
        vec3 deepPurple = vec3(0.15, 0.05, 0.3);
        vec3 magenta = vec3(0.8, 0.1, 0.6);
        vec3 pink = vec3(1.0, 0.3, 0.7);
        vec3 cyan = vec3(0.2, 0.7, 1.0);
        vec3 violet = vec3(0.5, 0.2, 0.9);
        
        // Color mixing based on density and position
        vec3 nebulaColor = mix(deepPurple, magenta, nebulaDensity);
        nebulaColor = mix(nebulaColor, pink, nebula2 * 0.7);
        nebulaColor = mix(nebulaColor, violet, nebula3 * 0.5);
        
        // Add cyan highlights in dense areas
        float highlights = smoothstep(0.6, 0.9, nebulaDensity);
        nebulaColor = mix(nebulaColor, cyan, highlights * 0.4);
        
        // Glow effect
        float glow = pow(nebulaDensity, 0.8) * 1.5;
        nebulaColor *= glow;
        
        // Add stars
        float starField = stars(uv, 200.0);
        starField += stars(uv * 1.5, 300.0) * 0.7;
        starField += stars(uv * 2.0, 400.0) * 0.5;
        
        vec3 starColor = vec3(1.0, 0.95, 0.9) * starField;
        
        // Combine nebula and stars
        vec3 finalColor = nebulaColor + starColor;
        
        // Add subtle color shift animation
        float colorShift = sin(t * 0.5 + length(p)) * 0.5 + 0.5;
        finalColor += vec3(0.1, 0.0, 0.15) * colorShift * nebulaDensity * 0.3;
        
        // Center bright spot
        float centerGlow = 1.0 - length(p * 0.5);
        centerGlow = pow(centerGlow, 3.0) * 0.15;
        finalColor += vec3(0.6, 0.2, 0.8) * centerGlow;
        
        // Vignette
        float vignette = 1.0 - length(uv - 0.5) * 0.7;
        finalColor *= vignette;
        
        gl_FragColor = vec4(finalColor, 1.0);
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

export default CosmicNebulaShader;
