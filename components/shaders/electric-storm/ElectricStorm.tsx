'use client';
import React, { useRef, useEffect } from 'react';

interface ElectricStormProps {
    hue?: number;
    speed?: number;
    intensity?: number;
    branches?: number;
    cloudDensity?: number;
    className?: string;
}

const ElectricStorm: React.FC<ElectricStormProps> = ({
    hue = 260,
    speed = 1.0,
    intensity = 1.2,
    branches = 3,
    cloudDensity = 0.5,
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
      uniform float uCloudDensity;
      
      #define OCTAVE_COUNT 10

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
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }
      
      // Cloud FBM - different pattern for clouds
      float cloudFbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 6; ++i) {
              value += amplitude * noise(p);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      // Single lightning bolt using original technique
      float lightningBolt(vec2 uv, float time, float seed, float size) {
          vec2 p = uv;
          
          // Original technique: FBM distortion (no horizontal seed offset to keep centered)
          p += 2.0 * fbm(p * size + 0.8 * time + seed * 10.0) - 1.0;
          
          float dist = abs(p.x);
          
          // Lightning intensity with flicker
          float flicker = mix(0.0, 0.1, hash11(time * 2.0 + seed));
          float lightning = flicker / max(dist, 0.001);
          
          return lightning;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / iResolution.xy;
          vec2 p = uv * 2.0 - 1.0;
          p.x *= iResolution.x / iResolution.y;
          
          float time = iTime * uSpeed;
          
          // Dark sky background
          vec3 col = vec3(0.0);
          
          // Storm clouds - dark gray, subtle
          float cloudTime = time * 0.1;
          float clouds = cloudFbm(p * 1.5 + vec2(cloudTime, cloudTime * 0.5));
          clouds = smoothstep(0.3, 0.7, clouds) * uCloudDensity;
          
          // Base cloud color - very dark
          vec3 cloudColor = vec3(0.03, 0.03, 0.05);
          col += cloudColor * clouds;
          
          // Calculate lightning for each bolt
          vec3 lightningColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          float totalLightning = 0.0;
          
          for (float i = 0.0; i < 5.0; i++) {
              if (i >= uBranches) break;
              
              // Symmetric offsets: -0.15, 0.0, 0.15 for 3 bolts
              float xOffset = (i - (uBranches - 1.0) * 0.5) * 0.15;
              vec2 boltUV = p;
              boltUV.x += xOffset;
              
              float bolt = lightningBolt(boltUV, time, i * 1.337, 1.0);
              
              // Flashing effect for each bolt - more frequent
              float flashCycle = mod(time + i * 0.4, 1.0 + i * 0.15);
              float flash = 0.0;
              if (flashCycle < 0.2) {
                  flash = smoothstep(0.0, 0.05, flashCycle) * smoothstep(0.2, 0.1, flashCycle);
              } else if (flashCycle > 0.25 && flashCycle < 0.45) {
                  flash = smoothstep(0.25, 0.3, flashCycle) * smoothstep(0.45, 0.4, flashCycle) * 0.6;
              } else if (flashCycle > 0.6 && flashCycle < 0.75) {
                  flash = smoothstep(0.6, 0.65, flashCycle) * smoothstep(0.75, 0.7, flashCycle) * 0.4;
              }
              
              float boltIntensity = bolt * flash * uIntensity;
              col += lightningColor * boltIntensity;
              totalLightning += boltIntensity;
          }
          
          // Clouds glow when lightning strikes
          vec3 glowColor = hsv2rgb(vec3(uHue / 360.0, 0.4, 0.5));
          col += glowColor * clouds * totalLightning * 0.5;
          
          // Atmospheric flash
          float atmosphereFlash = 0.0;
          for (float i = 0.0; i < 5.0; i++) {
              if (i >= uBranches) break;
              float flashCycle = mod(time + i * 0.4, 1.0 + i * 0.15);
              if (flashCycle < 0.15) {
                  atmosphereFlash += smoothstep(0.0, 0.05, flashCycle) * smoothstep(0.15, 0.1, flashCycle) * 0.05;
              }
          }
          col += vec3(0.05, 0.04, 0.08) * atmosphereFlash;
          
          // Clamp and output
          col = clamp(col, 0.0, 1.0);
          
          gl_FragColor = vec4(col, 1.0);
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
        const uCloudDensityLocation = gl.getUniformLocation(program, 'uCloudDensity');

        const startTime = performance.now();
        let animationId: number;

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
            gl.uniform1f(uCloudDensityLocation, cloudDensity);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationId = requestAnimationFrame(render);
        };
        animationId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [hue, speed, intensity, branches, cloudDensity]);

    return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};

export default ElectricStorm;
