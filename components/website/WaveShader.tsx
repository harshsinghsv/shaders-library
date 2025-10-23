'use client';
import { useEffect, useRef } from 'react';

function WaveShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl');
    glRef.current = gl;

    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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

      float wave(vec2 uv, float freq, float amplitude, float phase) {
        return sin(uv.x * freq + phase) * amplitude;
      }

      float layeredWaves(vec2 uv, float time) {
        float waves = 0.0;
        
        // Multiple wave layers
        waves += wave(uv, 8.0, 0.1, time * 2.0);
        waves += wave(uv, 12.0, 0.08, time * 1.5 + 1.0);
        waves += wave(uv, 16.0, 0.06, time * 1.8 + 2.0);
        waves += wave(uv, 20.0, 0.04, time * 2.2 + 3.0);
        
        return waves;
      }

      vec3 oceanColor(float height, vec2 uv) {
        vec3 deepBlue = vec3(0.0, 0.1, 0.3);
        vec3 lightBlue = vec3(0.2, 0.6, 0.9);
        vec3 white = vec3(0.9, 0.95, 1.0);
        
        float t = smoothstep(-0.2, 0.2, height);
        vec3 color = mix(deepBlue, lightBlue, t);
        
        // Add foam on wave peaks
        float foam = smoothstep(0.15, 0.25, height);
        color = mix(color, white, foam * 0.7);
        
        return color;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 waveUv = (uv - 0.5) * 2.0;
        waveUv.x *= resolution.x / resolution.y;
        
        // Create wave displacement
        float waveHeight = layeredWaves(waveUv, time);
        
        // Add vertical gradient effect
        float gradient = 1.0 - abs(uv.y - 0.5) * 2.0;
        waveHeight *= gradient;
        
        // Secondary wave for more complexity
        vec2 secondaryUv = waveUv * 0.5 + vec2(time * 0.1, 0.0);
        float secondaryWave = sin(secondaryUv.x * 6.0 + time) * 0.05;
        waveHeight += secondaryWave;
        
        vec3 color = oceanColor(waveHeight, uv);
        
        // Add depth effect
        float depth = 1.0 - smoothstep(0.0, 1.0, length(waveUv) * 0.8);
        color *= depth * 0.8 + 0.2;
        
        // Add some shimmer
        float shimmer = sin(uv.x * 50.0 + time * 3.0) * sin(uv.y * 50.0 + time * 2.0);
        shimmer = smoothstep(0.8, 1.0, shimmer) * 0.1;
        color += shimmer;
        
        float alpha = 0.85;
        gl_FragColor = vec4(color, alpha);
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

    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const timeLocation = gl.getUniformLocation(program, 'time');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const render = (time: number) => {
      time *= 0.001;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-90"
      />
    </div>
  );
}

export default WaveShader;