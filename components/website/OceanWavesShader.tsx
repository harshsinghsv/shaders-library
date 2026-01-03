// 'use client';
// import React, { useRef, useEffect } from 'react';

// const OceanWavesShader: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const animationRef = useRef<number | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const container = containerRef.current;
//     if (!canvas || !container) return;

//     const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
//     if (!gl) return;

//     const resizeCanvas = () => {
//       const rect = container.getBoundingClientRect();
//       canvas.width = rect.width;
//       canvas.height = rect.height;
//       gl.viewport(0, 0, canvas.width, canvas.height);
//     };

//     resizeCanvas();
//     window.addEventListener('resize', resizeCanvas);

//     const vertexShaderSource = `
//       attribute vec2 position;
//       void main() {
//         gl_Position = vec4(position, 0.0, 1.0);
//       }
//     `;

//     const fragmentShaderSource = `
//       precision highp float;
//       uniform vec2 resolution;
//       uniform float time;

//       // Hash function for pseudo-random values
//       float hash(vec2 p) {
//         p = fract(p * vec2(123.34, 456.21));
//         p += dot(p, p + 45.32);
//         return fract(p.x * p.y);
//       }

//       // 2D noise function
//       float noise(vec2 p) {
//         vec2 i = floor(p);
//         vec2 f = fract(p);
//         f = f * f * (3.0 - 2.0 * f);

//         float a = hash(i);
//         float b = hash(i + vec2(1.0, 0.0));
//         float c = hash(i + vec2(0.0, 1.0));
//         float d = hash(i + vec2(1.0, 1.0));

//         return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
//       }

//       // Fractal Brownian Motion
//       float fbm(vec2 p) {
//         float value = 0.0;
//         float amplitude = 0.5;
//         float frequency = 1.0;

//         for(int i = 0; i < 6; i++) {
//           value += amplitude * noise(p * frequency);
//           frequency *= 2.0;
//           amplitude *= 0.5;
//         }
//         return value;
//       }

//       // Ocean wave function
//       float wave(vec2 p, float time) {
//         float w = 0.0;

//         // Large rolling waves
//         w += sin(p.x * 0.5 + time * 0.3) * 0.3;
//         w += sin(p.x * 0.3 - p.y * 0.2 + time * 0.2) * 0.2;

//         // Medium waves
//         w += sin(p.x * 1.0 + p.y * 0.5 + time * 0.5) * 0.15;
//         w += sin(p.x * 1.5 - p.y * 0.8 + time * 0.4) * 0.1;

//         // Small ripples
//         w += fbm(p * 2.0 + vec2(time * 0.1, time * 0.05)) * 0.1;

//         return w;
//       }

//       void main() {
//         vec2 uv = gl_FragCoord.xy / resolution.xy;
//         vec2 p = (uv - 0.5) * 2.0;
//         p.x *= resolution.x / resolution.y;

//         // Create wave motion
//         float waves = wave(p * 2.0, time);

//         // Add foam patterns
//         float foam = fbm(p * 4.0 + vec2(time * 0.2, waves * 2.0));
//         foam = smoothstep(0.5, 0.7, foam);

//         // Ocean colors
//         vec3 deepWater = vec3(0.0, 0.2, 0.4);      // Deep blue
//         vec3 shallowWater = vec3(0.0, 0.4, 0.6);   // Lighter blue
//         vec3 foamColor = vec3(0.7, 0.9, 1.0);      // White-blue foam

//         // Mix colors based on wave height
//         float waveHeight = waves * 0.5 + 0.5;
//         vec3 color = mix(deepWater, shallowWater, waveHeight);

//         // Add foam highlights
//         color = mix(color, foamColor, foam * 0.4);

//         // Add depth gradient
//         float depth = smoothstep(0.0, 1.0, 1.0 - uv.y);
//         color = mix(color, deepWater, depth * 0.3);

//         // Add shimmer effect
//         float shimmer = fbm(p * 8.0 + vec2(time * 0.5, time * 0.3));
//         shimmer = pow(shimmer, 3.0) * 0.2;
//         color += vec3(shimmer);

//         // Vignette effect
//         float vignette = 1.0 - length(uv - 0.5) * 0.5;
//         color *= vignette;

//         gl_FragColor = vec4(color, 1.0);
//       }
//     `;

//     const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
//       const shader = gl.createShader(type);
//       if (!shader) return null;

//       gl.shaderSource(shader, source);
//       gl.compileShader(shader);

//       if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//         console.error('Shader compile error:', gl.getShaderInfoLog(shader));
//         gl.deleteShader(shader);
//         return null;
//       }

//       return shader;
//     };

//     const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
//     const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

//     if (!vertexShader || !fragmentShader) return;

//     const program = gl.createProgram();
//     if (!program) return;

//     gl.attachShader(program, vertexShader);
//     gl.attachShader(program, fragmentShader);
//     gl.linkProgram(program);

//     if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
//       console.error('Program link error:', gl.getProgramInfoLog(program));
//       return;
//     }

//     const positionBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//     gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array([
//         -1, -1,
//          1, -1,
//         -1,  1,
//          1,  1,
//       ]),
//       gl.STATIC_DRAW
//     );

//     const positionLocation = gl.getAttribLocation(program, 'position');
//     const resolutionLocation = gl.getUniformLocation(program, 'resolution');
//     const timeLocation = gl.getUniformLocation(program, 'time');

//     let startTime = Date.now();

//     const render = () => {
//       if (!gl || !canvas) return;

//       gl.clearColor(0, 0, 0, 1);
//       gl.clear(gl.COLOR_BUFFER_BIT);

//       gl.useProgram(program);

//       gl.enableVertexAttribArray(positionLocation);
//       gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
//       gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

//       gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
//       gl.uniform1f(timeLocation, (Date.now() - startTime) / 1000);

//       gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

//       animationRef.current = requestAnimationFrame(render);
//     };

//     render();

//     return () => {
//       window.removeEventListener('resize', resizeCanvas);
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//       gl.deleteProgram(program);
//       gl.deleteShader(vertexShader);
//       gl.deleteShader(fragmentShader);
//       gl.deleteBuffer(positionBuffer);
//     };
//   }, []);

//   return (
//     <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black overflow-hidden">
//       <canvas
//         ref={canvasRef}
//         className="absolute top-0 left-0 w-full h-full"
//       />
//     </div>
//   );
// };

// export default OceanWavesShader;


'use client';
import React, { useRef, useEffect } from 'react';

const OceanWavesShader: React.FC = () => {
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

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

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

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        // Smooth flowing waves
        float wave1 = sin(p.x * 2.0 + time * 0.5) * 0.3;
        float wave2 = sin(p.x * 1.5 - p.y * 0.8 + time * 0.4) * 0.2;
        float wave3 = sin(p.x * 3.0 + p.y * 1.5 + time * 0.6) * 0.15;
        float waves = wave1 + wave2 + wave3;
        
        // Add noise detail
        waves += fbm(p * 2.0 + vec2(time * 0.1, 0.0)) * 0.2;
        
        // Normalized wave height
        float h = waves * 0.5 + 0.5;
        
        // Beautiful gradient colors
        vec3 color1 = vec3(0.1, 0.3, 0.6);   // Deep blue
        vec3 color2 = vec3(0.2, 0.5, 0.8);   // Medium blue
        vec3 color3 = vec3(0.4, 0.7, 0.9);   // Light blue
        vec3 color4 = vec3(0.6, 0.85, 0.95); // Pale blue
        
        // Smooth color transitions
        vec3 color;
        if (h < 0.33) {
          color = mix(color1, color2, h * 3.0);
        } else if (h < 0.66) {
          color = mix(color2, color3, (h - 0.33) * 3.0);
        } else {
          color = mix(color3, color4, (h - 0.66) * 3.0);
        }
        
        // Add shimmer
        float shimmer = fbm(p * 6.0 + vec2(time * 0.3, time * 0.2));
        shimmer = pow(shimmer, 2.0) * 0.3;
        color += vec3(shimmer);
        
        // Depth fade
        color = mix(color, color1 * 0.8, (1.0 - uv.y) * 0.4);
        
        // Subtle vignette
        float dist = length(uv - 0.5);
        color *= 1.0 - dist * 0.3;
        
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
        -1, 1,
        1, 1,
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

export default OceanWavesShader;