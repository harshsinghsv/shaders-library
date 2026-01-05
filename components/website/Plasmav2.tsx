'use client';
import { useEffect, useRef } from 'react';

function Plasmav2Shader() {
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

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 1.0; // Faster animation
        
        vec2 p = uv * 4.0;
        
        // More dynamic fluid-like wrapping
        for(float i=1.0; i<6.0; i++){
            p.x += 0.4/i * sin(i*2.5*p.y + t * (1.0 + i*0.15));
            p.y += 0.4/i * cos(i*2.5*p.x + t * (0.9 + i*0.1));
        }
        
        // Rich, deep color mixing
        float r = 0.5 + 0.5 * sin(p.x + p.y + t * 1.2);
        float g = 0.5 + 0.5 * sin(p.x * 2.0 - p.y * 0.5 + t * 0.8);
        float b = 0.5 + 0.5 * sin(p.y * 2.0 + t * 1.0 + 1.0);
        
        vec3 color = vec3(r, g, b);
        
        // Deep, rich dark palette
        vec3 deepPurple = vec3(0.15, 0.0, 0.3);
        vec3 midnightBlue = vec3(0.0, 0.1, 0.4);
        vec3 darkMagenta = vec3(0.4, 0.0, 0.5);
        vec3 electricViolet = vec3(0.5, 0.1, 0.9);
        
        // Dynamic palette mixing
        float mixer = sin(t * 0.6) * 0.5 + 0.5;
        vec3 palette = mix(
            mix(deepPurple, midnightBlue, color.b),
            mix(darkMagenta, electricViolet, color.r),
            mixer
        );
        
        color = mix(palette, color * 0.8, 0.3);
        
        // Boost saturation for vibrancy
        float gray = dot(color, vec3(0.299, 0.587, 0.114));
        color = mix(vec3(gray), color, 1.8);
        
        // Soft glow / vignette
        float glow = 1.0 - length(uv * 0.65);
        color *= smoothstep(-0.1, 1.0, glow);
        
        // Add subtle pulsing highlights
        float pulse = sin(t * 2.5) * 0.1 + 0.9;
        color *= pulse;
        
        // Boost deep colors
        color = pow(color, vec3(0.9));
        color *= 1.3;
        
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

    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1
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
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-95"
      />
    </div>
  );
}

export default Plasmav2Shader;