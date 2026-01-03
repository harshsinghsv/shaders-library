
'use client';
import { useEffect, useRef } from 'react';

function LiquidOrangeShader() {
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
      precision mediump float;
      uniform vec2 resolution;
      uniform float time;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st, int octaves) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 8; i++) {
          if(i >= octaves) break;
          value += amplitude * noise(st * frequency);
          frequency *= 1.8;
          amplitude *= 0.55;
        }
        return value;
      }

      vec2 curl(vec2 p, float time) {
        float eps = 0.01;
        float n1 = fbm(p + vec2(eps, 0.0) + time * 0.1, 6);
        float n2 = fbm(p + vec2(-eps, 0.0) + time * 0.1, 6);
        float n3 = fbm(p + vec2(0.0, eps) + time * 0.1, 6);
        float n4 = fbm(p + vec2(0.0, -eps) + time * 0.1, 6);
        
        return vec2(n3 - n4, n2 - n1) / (2.0 * eps);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 st = uv * 2.0 - 1.0;
        st.x *= resolution.x / resolution.y;
        
        vec2 flow1 = curl(st * 1.2 + vec2(time * 0.03), time);
        vec2 flow2 = curl(st * 1.5 - vec2(time * 0.02, time * 0.025), time * 1.2);
        
        vec2 totalFlow = flow1 * 0.6 + flow2 * 0.4;
        
        vec2 distorted = st;
        for(int i = 0; i < 2; i++) {
          distorted += curl(distorted * 1.5 + totalFlow, time + float(i) * 0.5) * 0.1;
        }
        
        float liquid = 0.0;
        
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          vec2 offset = vec2(
            sin(time * 0.15 + fi * 2.1) * 0.6,
            cos(time * 0.12 + fi * 1.7) * 0.5
          );
          
          vec2 flowOffset = totalFlow * (0.3 + fi * 0.1);
          vec2 pos = offset + flowOffset;
          
          float dist = length(distorted - pos);
          float size = 0.4 + sin(time * 0.2 + fi) * 0.15;
          liquid += smoothstep(size, 0.0, dist) * (1.0 - fi * 0.15);
        }
        
        float turbulence = fbm(distorted * 2.0 + totalFlow + time * 0.05, 4);
        liquid += turbulence * 0.15;
        
        float tendrils = 0.0;
        for(int i = 0; i < 2; i++) {
          float fi = float(i);
          vec2 tendrilFlow = distorted * 2.5 + totalFlow * 1.5 + time * (0.08 + fi * 0.03);
          float t = sin(tendrilFlow.x * 2.0 + cos(tendrilFlow.y * 1.5)) * 
                   cos(tendrilFlow.y * 2.0 + sin(tendrilFlow.x * 1.5));
          tendrils += t * (0.1 - fi * 0.03);
        }
        liquid += tendrils;
        
        float edgeDetail = fbm(distorted * 5.0 + totalFlow * 2.0 + time * 0.1, 3);
        liquid += edgeDetail * 0.08 * smoothstep(0.3, 0.8, liquid);
        
        float grain1 = random(uv * 800.0 + time * 15.0) * 0.08;
        float grain2 = random(uv * 400.0 + sin(time * 8.0)) * 0.05;
        liquid += grain1 + grain2;
        
        vec3 dark = vec3(0.8, 0.2, 0.0);
        vec3 mid = vec3(1.0, 0.4, 0.05);
        vec3 bright = vec3(1.0, 0.6, 0.15);
        vec3 highlight = vec3(1.0, 0.75, 0.3);
        
        float colorFlow = fbm(distorted * 2.0 + time * 0.06, 4);
        vec3 color = mix(dark, mid, liquid * 0.6);
        color = mix(color, bright, liquid * liquid * 0.8);
        color = mix(color, highlight, pow(liquid, 3.0) * 0.5);
        color = mix(color, color * 1.2, colorFlow * 0.3);
        
        float alpha = liquid * 0.8;
        alpha = smoothstep(0.15, 0.7, alpha);
        alpha *= 1.0 - smoothstep(0.9, 1.2, liquid) * 0.5;
        
        gl_FragColor = vec4(color * alpha, alpha);
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

export default LiquidOrangeShader;
