'use client';
import { useEffect, useRef, useState } from 'react';

interface ShaderPreviewProps {
  fragmentShader: string;
  className?: string;
}

function ShaderPreview({ fragmentShader, className = "" }: ShaderPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer to handle visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '100px' } // Load slightly before view, unload when out
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // WebGL Logic - Only runs when isVisible is true
  useEffect(() => {
    if (!isVisible) return; // Clean up or don't start if not visible

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try to get context
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
      powerPreference: "low-power" // Optimize for mobile battery/perf
    });
    glRef.current = gl;

    if (!gl) {
      console.warn('WebGL not supported or context limit reached');
      return;
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      // Use lower resolution for previews to save performance on mobile
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    // window.addEventListener('resize', resizeCanvas); // Verify if needed, ResizeObserver might be better but skipping for simplicity

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        // console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShaderObj = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    if (!vertexShader || !fragmentShaderObj) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShaderObj);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // console.error('Program link error:', gl.getProgramInfoLog(program));
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

    let startTime = performance.now();
    const render = (now: number) => {
      if (!gl) return;

      const time = (now - startTime) * 0.001;

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

    // cleanup function
    return () => {
      //   window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Aggressively lose context to free up resources
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
  }, [fragmentShader, isVisible]); // Re-run when visibility changes

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      {isVisible && (
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      )}
    </div>
  );
}

export default ShaderPreview;