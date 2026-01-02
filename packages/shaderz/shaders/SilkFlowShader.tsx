'use client';
import React, { useRef, useEffect } from 'react';

const SilkFlowShader: React.FC = () => {
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

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

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

      float fbm(vec3 p) {
        float value = 0.0;
        float amplitude = 0.5;
        
        for(int i = 0; i < 6; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      // Vertical silk ribbons
      float silkRibbon(vec2 p, float offset, float time) {
        float xPos = offset;
        
        // Vertical flowing motion
        float flow = p.y - time * 0.5;
        
        // Wavy horizontal displacement
        float wave = sin(flow * 3.0 + offset * 5.0) * 0.15;
        wave += sin(flow * 5.0 - offset * 3.0) * 0.08;
        
        // Distance from ribbon center
        float dist = abs(p.x - (xPos + wave));
        
        // Ribbon width
        float width = 0.12 + sin(flow * 2.0 + offset) * 0.03;
        
        return smoothstep(width, width * 0.3, dist);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        float t = time * 0.4;
        
        // Add subtle noise distortion
        vec3 noisePos = vec3(p * 2.0, t * 0.3);
        float noiseVal = fbm(noisePos) - 0.5;
        vec2 distorted = p + vec2(noiseVal * 0.1);
        
        // Create multiple silk ribbons
        vec3 finalColor = vec3(0.0);
        float totalMask = 0.0;
        
        float ribbonOffsets[7];
        ribbonOffsets[0] = -0.9;
        ribbonOffsets[1] = -0.6;
        ribbonOffsets[2] = -0.3;
        ribbonOffsets[3] = 0.0;
        ribbonOffsets[4] = 0.3;
        ribbonOffsets[5] = 0.6;
        ribbonOffsets[6] = 0.9;
        
        for(int i = 0; i < 7; i++) {
          float offset = ribbonOffsets[i];
          float fi = float(i);
          
          // Calculate ribbon with individual time offset
          float ribbon = silkRibbon(distorted, offset, t + fi * 0.3);
          
          // Flow position for color
          float flowPos = distorted.y - t * 0.5 + fi * 0.5;
          
          // Color gradient - blue to magenta
          vec3 blueColor = vec3(0.0, 0.3, 1.0);     // Bright blue
          vec3 cyanColor = vec3(0.0, 0.7, 1.0);     // Cyan
          vec3 magentaColor = vec3(1.0, 0.0, 0.8);  // Magenta
          vec3 purpleColor = vec3(0.6, 0.1, 1.0);   // Purple
          
          // Vertical gradient based on flow
          float colorPhase = fract(flowPos * 0.5);
          vec3 color = mix(blueColor, cyanColor, colorPhase);
          color = mix(color, magentaColor, smoothstep(0.3, 0.7, colorPhase));
          color = mix(color, purpleColor, smoothstep(0.7, 1.0, colorPhase));
          
          // Add position-based variation
          float posVariation = sin(offset * 10.0 + t) * 0.5 + 0.5;
          color = mix(color, magentaColor, posVariation * 0.3);
          
          // Silk sheen effect - bright highlights
          float sheen = pow(abs(sin(flowPos * 8.0 + offset * 5.0)), 6.0);
          vec3 sheenColor = vec3(0.8, 0.9, 1.0);
          color += sheenColor * sheen * ribbon * 0.5;
          
          // Edge glow
          float edgeDist = ribbon * (1.0 - ribbon) * 4.0;
          vec3 edgeColor = mix(cyanColor, magentaColor, posVariation);
          color += edgeColor * edgeDist * 0.4;
          
          // Translucent layering
          finalColor = mix(finalColor, color, ribbon * 0.85);
          totalMask += ribbon * 0.3;
        }
        
        // Add flowing particles/streaks
        float streaks = 0.0;
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float streakX = sin(t * 0.7 + fi * 2.0) * 1.5;
          float streakY = fract((distorted.y + t * 0.8 + fi * 0.2) * 0.5) * 4.0 - 2.0;
          
          float streakDist = length(distorted - vec2(streakX, streakY));
          streaks += (1.0 - smoothstep(0.0, 0.05, streakDist)) * 0.3;
        }
        
        finalColor += vec3(0.6, 0.8, 1.0) * streaks;
        
        // Subtle shimmer
        float shimmer = fbm(vec3(distorted * 6.0, t * 2.0));
        shimmer = pow(shimmer, 5.0);
        finalColor += vec3(0.7, 0.6, 1.0) * shimmer * totalMask * 0.2;
        
        // Vignette
        float vignette = 1.0 - length(vec2(uv.x - 0.5, (uv.y - 0.5) * 0.7)) * 0.5;
        finalColor *= vignette;
        
        // Enhance colors
        finalColor *= 1.15;
        
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

export default SilkFlowShader;
