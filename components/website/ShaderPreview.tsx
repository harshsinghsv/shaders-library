'use client';
import { useEffect, useRef, useCallback } from 'react';

interface ShaderPreviewProps {
  fragmentShader: string;
  className?: string;
}

function ShaderPreview({ fragmentShader, className = "" }: ShaderPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isContextLostRef = useRef(false);

  const setupWebGL = useCallback((canvas: HTMLCanvasElement) => {
    // Get WebGL context with preserveDrawingBuffer to prevent black screen
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    });

    if (!gl) {
      console.warn('WebGL not supported');
      return null;
    }

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
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShaderObj = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    if (!vertexShader || !fragmentShaderObj) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShaderObj);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return null;
    }

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

    return {
      gl,
      program,
      positionBuffer,
      positionLocation,
      resolutionLocation,
      timeLocation,
      vertexShader,
      fragmentShaderObj,
    };
  }, [fragmentShader]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let webglResources = setupWebGL(canvas);
    if (!webglResources) return;

    let { gl, program, positionBuffer, positionLocation, resolutionLocation, timeLocation, vertexShader, fragmentShaderObj } = webglResources;

    const resizeCanvas = () => {
      if (!canvas || !gl || isContextLostRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(canvas);

    let startTime = performance.now();

    const render = (now: number) => {
      if (isContextLostRef.current || !gl || !program) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

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

    // Handle WebGL context loss
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      isContextLostRef.current = true;
    };

    // Handle WebGL context restoration
    const handleContextRestored = () => {
      isContextLostRef.current = false;

      // Re-initialize WebGL
      webglResources = setupWebGL(canvas);
      if (!webglResources) return;

      gl = webglResources.gl;
      program = webglResources.program;
      positionBuffer = webglResources.positionBuffer;
      positionLocation = webglResources.positionLocation;
      resolutionLocation = webglResources.resolutionLocation;
      timeLocation = webglResources.timeLocation;
      vertexShader = webglResources.vertexShader;
      fragmentShaderObj = webglResources.fragmentShaderObj;

      resizeCanvas();
      startTime = performance.now();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    animationRef.current = requestAnimationFrame(render);

    // Cleanup function
    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Clean up WebGL resources
      if (gl && !isContextLostRef.current) {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShaderObj);
        gl.deleteBuffer(positionBuffer);
      }
    };
  }, [fragmentShader, setupWebGL]);

  return (
    <div ref={containerRef} className={`w-full h-full relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}

export default ShaderPreview;