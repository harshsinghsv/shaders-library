'use client';
import { useEffect, useRef, useCallback } from 'react';

function DarkVeil() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    const animationRef = useRef<number | null>(null);
    const isContextLostRef = useRef(false);

    const initWebGL = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const gl = canvas.getContext('webgl', {
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
        });

        if (!gl) {
            console.error('WebGL not supported');
            return null;
        }

        return gl;
    }, []);

    const setupShaders = useCallback((gl: WebGLRenderingContext) => {
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

      // Simplex-like noise for smooth distortion
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 center = uv - 0.5;
        center.x *= resolution.x / resolution.y;
        
        // Floating movement - smooth and organic
        float floatX = sin(time * 0.3) * 0.15 + cos(time * 0.2) * 0.1;
        float floatY = cos(time * 0.25) * 0.12 + sin(time * 0.35) * 0.08;
        center -= vec2(floatX, floatY);
        
        // Distance from center
        float dist = length(center);
        
        // Smooth noise-based distortion (no sharp angles)
        float n1 = noise(center * 3.0 + time * 0.2) * 0.1;
        float n2 = noise(center * 5.0 - time * 0.15) * 0.05;
        dist += n1 + n2;
        
        // Very soft gradient falloff - blurred edges
        float gradient = 1.0 - smoothstep(0.0, 0.8, dist);
        gradient = pow(gradient, 0.8); // Softer power for blur effect
        
        // Smooth the center completely - no sharp point
        float centerBlur = smoothstep(0.0, 0.15, dist);
        gradient *= centerBlur * 0.5 + 0.5;
        
        // Blue to Purple gradient based on smooth noise
        vec3 blue = vec3(0.2, 0.4, 0.9);
        vec3 purple = vec3(0.6, 0.2, 0.8);
        vec3 magenta = vec3(0.8, 0.1, 0.6);
        
        // Smooth color mixing based on noise (not angle)
        float colorNoise = noise(center * 2.0 + time * 0.1);
        float colorNoise2 = noise(center * 1.5 - time * 0.08);
        
        vec3 gradientColor = mix(blue, purple, colorNoise);
        gradientColor = mix(gradientColor, magenta, colorNoise2 * 0.4);
        
        // Apply gradient strength
        vec3 col = gradientColor * gradient;
        
        // Soft outer glow
        float glow = 1.0 - smoothstep(0.0, 1.2, dist);
        glow = pow(glow, 2.5) * 0.2;
        col += gradientColor * glow;
        
        // Pure black background
        gl_FragColor = vec4(col, 1.0);
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

        if (!vertexShader || !fragmentShader) return null;

        const program = gl.createProgram();
        if (!program) return null;

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let gl = initWebGL();
        if (!gl) return;

        glRef.current = gl;

        const resizeCanvas = () => {
            if (!canvas || !gl || isContextLostRef.current) return;
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        let program = setupShaders(gl);
        if (!program) return;

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

        let positionLocation = gl.getAttribLocation(program, 'position');
        let resolutionLocation = gl.getUniformLocation(program, 'resolution');
        let timeLocation = gl.getUniformLocation(program, 'time');

        const startTime = performance.now();

        const render = () => {
            if (isContextLostRef.current || !gl || !program) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            const elapsedTime = (performance.now() - startTime) * 0.001;

            gl.clearColor(0.0, 0.0, 0.0, 1.0); // Pure black
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(program);

            gl.enableVertexAttribArray(positionLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, elapsedTime);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            animationRef.current = requestAnimationFrame(render);
        };

        const handleContextLost = (event: Event) => {
            event.preventDefault();
            isContextLostRef.current = true;
        };

        const handleContextRestored = () => {
            isContextLostRef.current = false;
            gl = initWebGL();
            if (!gl) return;
            glRef.current = gl;
            resizeCanvas();
            program = setupShaders(gl);
            if (!program) return;
            programRef.current = program;

            const newBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, newBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

            positionLocation = gl.getAttribLocation(program, 'position');
            resolutionLocation = gl.getUniformLocation(program, 'resolution');
            timeLocation = gl.getUniformLocation(program, 'time');
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !isContextLostRef.current) {
                resizeCanvas();
            }
        };

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        animationRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [initWebGL, setupShaders]);

    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
        </div>
    );
}

// Export the fragment shader for ShaderPreview compatibility
export const fragment = `
precision highp float;
uniform vec2 resolution;
uniform float time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 center = uv - 0.5;
  center.x *= resolution.x / resolution.y;
  
  float floatX = sin(time * 0.3) * 0.15 + cos(time * 0.2) * 0.1;
  float floatY = cos(time * 0.25) * 0.12 + sin(time * 0.35) * 0.08;
  center -= vec2(floatX, floatY);
  
  float dist = length(center);
  
  float n1 = noise(center * 3.0 + time * 0.2) * 0.1;
  float n2 = noise(center * 5.0 - time * 0.15) * 0.05;
  dist += n1 + n2;
  
  float gradient = 1.0 - smoothstep(0.0, 0.8, dist);
  gradient = pow(gradient, 0.8);
  
  float centerBlur = smoothstep(0.0, 0.15, dist);
  gradient *= centerBlur * 0.5 + 0.5;
  
  vec3 blue = vec3(0.2, 0.4, 0.9);
  vec3 purple = vec3(0.6, 0.2, 0.8);
  vec3 magenta = vec3(0.8, 0.1, 0.6);
  
  float colorNoise = noise(center * 2.0 + time * 0.1);
  float colorNoise2 = noise(center * 1.5 - time * 0.08);
  
  vec3 gradientColor = mix(blue, purple, colorNoise);
  gradientColor = mix(gradientColor, magenta, colorNoise2 * 0.4);
  
  vec3 col = gradientColor * gradient;
  
  float glow = 1.0 - smoothstep(0.0, 1.2, dist);
  glow = pow(glow, 2.5) * 0.2;
  col += gradientColor * glow;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

export default DarkVeil;
