'use client';
import React, { useRef, useEffect } from 'react';

interface ElectricStormProps {
    hue?: number;
    speed?: number;
    intensity?: number;
    branches?: number;
    glow?: number;
    className?: string;
}

const ElectricStorm: React.FC<ElectricStormProps> = ({
    hue = 270,
    speed = 1.0,
    intensity = 1.5,
    branches = 3,
    glow = 1.2,
    className = ''
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeCanvas = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const gl = canvas.getContext('webgl');
        if (!gl) {
            console.error('WebGL not supported');
            return;
        }

        const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

        const fragmentShaderSource = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uBranches;
      uniform float uGlow;
      
      #define OCTAVE_COUNT 8

      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p * frequency);
              p *= rotate2d(0.5);
              frequency *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      // Lightning strike flash effect
      float strikeEffect(float t) {
          float strike = sin(t * 3.14159 * 0.5) * 0.5 + 0.5;
          strike = pow(strike, 3.0);
          float flash = smoothstep(0.8, 1.0, sin(t * 12.0)) * 0.3;
          return strike + flash;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          
          float time = iTime * uSpeed;
          
          // Start with BLACK background
          vec3 col = vec3(0.0);
          
          for (float i = 0.0; i < 5.0; i++) {
              if (i >= uBranches) break;
              
              float offset = i * 0.4 - (uBranches - 1.0) * 0.2;
              vec2 branchUV = uv;
              branchUV.x += offset;
              
              // Animated distortion for organic lightning movement
              float warp = fbm(branchUV * 1.0 + time * 0.6 + i * 1.5) * 2.0 - 1.0;
              branchUV.x += warp * 0.5;
              
              // Calculate distance from lightning bolt center
              float dist = abs(branchUV.x);
              
              // MEDIUM thickness lightning bolt with sharp falloff
              float core = smoothstep(0.025, 0.0, dist);  // Thinner core
              float glow = smoothstep(0.12, 0.0, dist) * 0.4 * uGlow;  // Smaller, softer glow
              
              float lightning = core + glow;
              
              // Secondary branching - thinner
              float secondaryBranch = sin(branchUV.y * 6.0 + time * 2.0 + i * 3.0) * 0.06;
              float secondary = smoothstep(0.02, 0.0, abs(branchUV.x + secondaryBranch)) * 0.3;
              lightning += secondary;
              
              // Lightning color - purple/violet
              vec3 lightningColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 1.0));
              
              // White hot core - less intense
              vec3 finalColor = mix(lightningColor, vec3(1.0), core * 0.6);
              
              col += finalColor * lightning * (1.0 - i * 0.2) * uIntensity * 0.7;
          }
          
          // Lightning strike flash effect
          float strikeTime = mod(time, 3.0) / 3.0;
          float strike = pow(sin(strikeTime * 3.14159), 4.0) * 0.3;
          col *= 1.0 + strike;
          
          // Keep colors under control - pure black background
          col = min(col, vec3(1.5));
          
          fragColor = vec4(col, 1.0);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

        const compileShader = (source: string, type: number): WebGLShader | null => {
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

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);

        const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const aPosition = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
        const iTimeLocation = gl.getUniformLocation(program, 'iTime');
        const uHueLocation = gl.getUniformLocation(program, 'uHue');
        const uSpeedLocation = gl.getUniformLocation(program, 'uSpeed');
        const uIntensityLocation = gl.getUniformLocation(program, 'uIntensity');
        const uBranchesLocation = gl.getUniformLocation(program, 'uBranches');
        const uGlowLocation = gl.getUniformLocation(program, 'uGlow');

        const startTime = performance.now();
        const render = () => {
            resizeCanvas();
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
            const currentTime = performance.now();
            gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
            gl.uniform1f(uHueLocation, hue);
            gl.uniform1f(uSpeedLocation, speed);
            gl.uniform1f(uIntensityLocation, intensity);
            gl.uniform1f(uBranchesLocation, branches);
            gl.uniform1f(uGlowLocation, glow);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [hue, speed, intensity, branches, glow]);

    return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};

export default ElectricStorm;
