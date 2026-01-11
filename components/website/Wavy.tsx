import { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';

const vertex = `
attribute vec2 position;
varying vec2 vUv;
void main() {
    vUv = position;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const fragment = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uMouse;
uniform float uNoiseIntensity;
uniform float uScanlineIntensity;
uniform float uScanFreq;
uniform float uDistortion;

float random(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}

vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

vec4 buf[8];

vec4 cppn_fn(vec2 coordinate, float in0, float in1, float in2) {
    buf[6] = vec4(coordinate.x, coordinate.y, 0.3948 + in0, 0.36 + in1);
    buf[7] = vec4(0.14 + in2, length(coordinate), 0., 0.);

    buf[0] = mat4(vec4(6.54, -3.61, 0.75, -1.13), vec4(2.45, 3.16, 1.22, 0.06), vec4(-5.47, -6.15, 1.87, -4.77), vec4(6.03, -5.54, -0.90, 3.25)) * buf[6] 
           + mat4(vec4(0.84, -5.72, 3.97, 1.65), vec4(-0.24, 0.58, -1.76, -5.35), vec4(0.), vec4(0.)) * buf[7] 
           + vec4(0.21, 1.12, -1.79, 5.02);
           
    buf[1] = mat4(vec4(-3.35, -6.06, 0.55, -4.47), vec4(0.86, 1.74, 5.64, 1.61), vec4(2.49, -3.50, 1.71, 6.35), vec4(3.31, 8.20, 1.13, -1.16)) * buf[6] 
           + mat4(vec4(5.24, -13.03, 0.009, 15.87), vec4(2.98, 3.12, -0.89, -1.68), vec4(0.), vec4(0.)) * buf[7] 
           + vec4(-5.94, -6.57, -0.88, 1.54);
    
    buf[0] = sigmoid(buf[0]); 
    buf[1] = sigmoid(buf[1]);

    buf[2] = mat4(vec4(-15.21, 8.09, -2.42, -1.93), vec4(-5.95, 4.31, 2.63, 1.27), vec4(-7.31, 6.72, 5.24, 5.94), vec4(5.07, 8.97, -1.72, -1.15)) * buf[6] 
           + mat4(vec4(-11.96, -11.60, 6.14, 11.23), vec4(2.12, -6.26, -1.70, -0.70), vec4(0.), vec4(0.)) * buf[7] 
           + vec4(-4.17, -3.22, -4.57, -3.64);
           
    buf[3] = mat4(vec4(3.18, -13.73, 1.87, 3.23), vec4(0.64, 12.76, 1.91, 0.50), vec4(-0.04, 4.48, 1.47, 1.80), vec4(5.00, 13.00, 3.39, -4.55)) * buf[6] 
           + mat4(vec4(-0.12, 7.72, -3.14, 4.74), vec4(0.63, 3.71, -0.81, -0.39), vec4(0.), vec4(0.)) * buf[7] 
           + vec4(-1.18, -21.62, 0.78, 1.23);

    buf[2] = sigmoid(buf[2]); 
    buf[3] = sigmoid(buf[3]);

    buf[4] = mat4(vec4(5.21, -7.18, 2.72, 2.65), vec4(-5.60, -25.35, 4.06, 0.46), vec4(-10.57, 24.28, 21.10, 37.54), vec4(4.30, -1.96, 2.34, -1.37)) * buf[0] 
           + mat4(vec4(-17.65, -10.50, 2.25, 12.46), vec4(6.26, -502.75, -12.64, 0.91), vec4(-10.98, 20.74, -9.70, -0.76), vec4(5.38, 1.48, -4.19, -4.84)) * buf[1] 
           + mat4(vec4(12.78, -16.34, -0.39, 1.79), vec4(-30.48, -1.83, 1.45, -1.11), vec4(19.87, -7.33, -42.94, -98.52), vec4(8.33, -2.73, -2.29, -36.14)) * buf[2] 
           + mat4(vec4(-16.29, 3.54, -0.44, -9.44), vec4(57.50, -35.60, 16.16, -4.15), vec4(-0.07, -3.86, -7.09, 3.15), vec4(-12.55, -7.07, 1.49, -0.82)) * buf[3] 
           + vec4(-7.67, 15.92, 1.32, -1.66);
    
    buf[4] = sigmoid(buf[4]);

    buf[0] = mat4(vec4(1.67, 1.38, 2.96, 0.), vec4(-1.88, -1.48, -3.59, 0.), vec4(-1.32, -1.09, -2.31, 0.), vec4(0.26, 0.23, 0.44, 0.)) * buf[0] 
           + mat4(vec4(-0.62, -0.59, -0.91, 0.), vec4(0.17, 0.18, 0.18, 0.), vec4(-2.96, -2.58, -4.90, 0.), vec4(1.41, 1.18, 2.51, 0.)) * buf[1] 
           + mat4(vec4(-1.25, -1.05, -2.16, 0.), vec4(-0.72, -0.52, -1.43, 0.), vec4(0.15, 0.15, 0.27, 0.), vec4(0.94, 0.88, 1.27, 0.)) * buf[2] 
           + mat4(vec4(-2.42, -1.96, -4.35, 0.), vec4(-22.68, -18.05, -41.95, 0.), vec4(0.63, 0.54, 1.10, 0.), vec4(-1.54, -1.30, -2.64, 0.)) * buf[3] 
           + mat4(vec4(-0.49, -0.39, -0.91, 0.), vec4(0.95, 0.79, 1.64, 0.), vec4(0.30, 0.15, 0.86, 0.), vec4(1.18, 0.94, 2.17, 0.)) * buf[4] 
           + vec4(-1.54, -3.61, 0.24, 0.);

    buf[0] = sigmoid(buf[0]);
    return buf[0];
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    float time = uTime * 0.2;
    vec2 distort = vec2(
        sin(p.y * 4.0 + time) * 0.1 + sin(p.x * 3.0 + time * 0.5) * 0.05,
        cos(p.x * 4.0 + time) * 0.1 + cos(p.y * 3.0 + time * 0.5) * 0.05
    );
    
    vec2 mouse = (uMouse / uResolution) * 2.0 - 1.0;
    float distToMouse = length(p - mouse);
    vec2 mouseForce = (p - mouse) * (1.0 - smoothstep(0.0, 0.5, distToMouse));
    
    vec2 finalUV = p + (distort * uDistortion) - (mouseForce * 0.3);

    vec4 nnOutput = cppn_fn(
        finalUV, 
        0.15 * sin(0.3 * uTime), 
        0.15 * sin(0.5 * uTime), 
        0.15 * cos(0.4 * uTime)
    );

    vec3 col = palette(
        nnOutput.r * 1.5 + nnOutput.g * 0.5 + uTime * 0.05,
        vec3(0.1, 0.15, 0.2),
        vec3(0.3, 0.4, 0.5),
        vec3(0.8, 1.0, 1.2),
        vec3(0.55, 0.65, 0.75)
    );

    // Cool chromatic aberration - more blue/cyan, less red
    float aberration = length(p) * 0.015;
    col.r -= aberration * 0.5;
    col.g += aberration * 0.2;
    col.b += aberration;

    float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5) * 1.5);
    col *= vignette;

    float scanline = sin(uv.y * uResolution.y * uScanFreq * 0.1) * 0.5 + 0.5;
    col *= 1.0 - scanline * uScanlineIntensity;

    float noise = (random(uv + uTime) - 0.5) * uNoiseIntensity;
    col += noise;

    gl_FragColor = vec4(col, 1.0);
}
`;

type Props = {
    noiseIntensity?: number;
    scanlineIntensity?: number;
    speed?: number;
    distortion?: number;
    resolutionScale?: number;
};

export default function DarkVeilEnhanced({
    noiseIntensity = 0.08,
    scanlineIntensity = 0.05,
    speed = 1.0,
    distortion = 1.2,
    resolutionScale = 1
}: Props) {
    const ref = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef(new Vec2(0, 0));

    useEffect(() => {
        const canvas = ref.current as HTMLCanvasElement;
        const parent = canvas.parentElement as HTMLElement;
        let renderer: any, program: any, mesh: any;

        try {
            renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                canvas,
                alpha: false,
                depth: false
            });

            const gl = renderer.gl;
            const geometry = new Triangle(gl);

            program = new Program(gl, {
                vertex,
                fragment,
                uniforms: {
                    uTime: { value: 0 },
                    uResolution: { value: new Vec2() },
                    uMouse: { value: new Vec2(0, 0) },
                    uNoiseIntensity: { value: noiseIntensity },
                    uScanlineIntensity: { value: scanlineIntensity },
                    uScanFreq: { value: 0.5 },
                    uDistortion: { value: distortion }
                }
            });

            mesh = new Mesh(gl, { geometry, program });
        } catch (e) {
            console.error("WebGL Initialization failed", e);
            return;
        }

        const resize = () => {
            if (!parent) return;
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            renderer.setSize(w * resolutionScale, h * resolutionScale);
            program.uniforms.uResolution.value.set(w * resolutionScale, h * resolutionScale);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * resolutionScale;
            const y = (rect.height - (e.clientY - rect.top)) * resolutionScale;
            mouseRef.current.set(x, y);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        resize();

        let animationId: number;
        const start = performance.now();

        const loop = () => {
            const time = (performance.now() - start) / 1000;

            program.uniforms.uTime.value = time * speed;
            program.uniforms.uMouse.value.lerp(mouseRef.current, 0.1);

            program.uniforms.uNoiseIntensity.value = noiseIntensity;
            program.uniforms.uScanlineIntensity.value = scanlineIntensity;
            program.uniforms.uDistortion.value = distortion;

            renderer.render({ scene: mesh });
            animationId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [noiseIntensity, scanlineIntensity, speed, distortion, resolutionScale]);

    return (
        <div className="w-full h-full bg-black relative overflow-hidden">
            <canvas ref={ref} className="w-full h-full block" />
        </div>
    );
}