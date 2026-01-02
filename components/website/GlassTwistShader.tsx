'use client';
import React, { useRef, useEffect } from 'react';

const GlassTwistShader: React.FC = () => {
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

      void main(){
        vec2 uv=gl_FragCoord.xy/resolution.xy;
        vec2 p=(uv-0.5)*2.0;
        p.x*=resolution.x/resolution.y;
        vec3 bg=mix(vec3(0.85,0.88,0.92),vec3(0.92,0.94,0.96),uv.y);
        vec3 col=bg;
        
        for(float i=0.0;i<4.0;i++){
          float offset=(i-1.5)*0.35;
          float twist=sin(p.x*1.5+time*0.5+i*0.5)*0.5;
          float ribbonY=twist+offset;
          float dist=abs(p.y-ribbonY);
          float ribbon=smoothstep(0.2,0.08,dist);
          float depth=1.0-smoothstep(0.0,0.15,dist);
          
          vec3 glass=vec3(0.0,0.75,0.85);
          vec3 light=vec3(0.5,0.95,1.0);
          vec3 c=mix(glass*0.4,light,pow(depth,1.5));
          
          float fresnel=pow(1.0-depth,2.0);
          c=mix(c,vec3(0.9,0.98,1.0),fresnel*0.7);
          
          float caustic=sin(p.x*15.0+time+i)*sin(p.y*15.0-time)*0.5+0.5;
          caustic=pow(caustic,4.0)*ribbon*0.3;
          c+=glass*caustic;
          
          float alpha=ribbon*0.7;
          col=mix(col,c,alpha);
        }
        
        gl_FragColor=vec4(col,1.0);
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

      gl.clearColor(0.85, 0.88, 0.92, 1);
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
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-gray-200 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default GlassTwistShader;
