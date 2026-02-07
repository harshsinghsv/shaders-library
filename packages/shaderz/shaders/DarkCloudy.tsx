'use client';
/* eslint-disable react/no-unknown-property */
import React, { forwardRef, useMemo, useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree, RootState } from '@react-three/fiber';
import { Color, Mesh, ShaderMaterial } from 'three';
import { IUniform } from 'three';

type NormalizedRGB = [number, number, number];

const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

interface UniformValue<T = number | Color> {
  value: T;
}

interface SilkUniforms {
  uSpeed: UniformValue<number>;
  uScale: UniformValue<number>;
  uNoiseIntensity: UniformValue<number>;
  uColor: UniformValue<Color>;
  uRotation: UniformValue<number>;
  uTime: UniformValue<number>;
  [uniform: string]: IUniform;
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

// --------------------------------------------------------
// Helper functions
// --------------------------------------------------------

vec2 rotate(vec2 uv, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c) * uv;
}

// Simple hash for noise
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// 2D Value Noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f); // Smoothstep interpolation
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractional Brownian Motion with rotation for "silky" look
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 5; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + vec2(1.3, 2.7);
        a *= 0.5;
    }
    return v;
}

void main() {
    // 1. Setup Coordinates
    vec2 uv = vUv * uScale;
    // Rotate entire field
    uv = rotate(uv, uRotation);
    
    // 2. Animate Layout
    // Strong unidirectional flow: (1.0, 0.5) is the primary direction
    float t = uTime * uSpeed;
    vec2 flowDir = vec2(1.0, 0.5); 
    
    // Shift UVs over time to create flow
    vec2 q = uv - flowDir * t;
    
    // 3. Generate Pattern (Domain Warping)
    // The "warp" adds that liquid/silk fluid feel
    vec2 warp = vec2(0.0);
    warp.x = fbm(q + vec2(0.0, 0.0));
    warp.y = fbm(q + vec2(5.2, 1.3));
    
    // Second layer of warping for more detail
    vec2 r = vec2(0.0);
    r.x = fbm(q + 1.0 * warp + vec2(1.7, 9.2) + 0.15 * t); 
    r.y = fbm(q + 1.0 * warp + vec2(8.3, 2.8) + 0.126 * t);
    
    float f = fbm(q + r); // Final noise value
    
    // 4. Lighting & Color
    // Create highlights based on the noise value (fake height)
    vec3 baseColor = uColor;
    
    // Darker "shadows" in the deep parts of the wave
    vec3 col = mix(baseColor * 0.4, baseColor, smoothstep(0.0, 1.0, f));
    
    // Brighter "highlights" on the peaks
    // We emphasize the "ridges" of the noise
    float ridge = 1.0 - abs(f * 2.0 - 1.0); // Create ridges
    ridge = pow(ridge, 3.0); // Sharpen them
    
    // Mix in the highlight color (whitetinged base)
    vec3 highlight = mix(baseColor, vec3(1.0), 0.3); // 30% white added
    col = mix(col, highlight, ridge * 0.6); // Apply highlights
    
    // 5. Texture/Grain
    float grain = hash(gl_FragCoord.xy + t) * uNoiseIntensity * 0.05;
    col += grain;
    
    // 6. Contrast boost
    col = pow(col, vec3(1.1)); // Slight contrast curve
    
    gl_FragColor = vec4(col, 1.0);
}
`;

interface SilkPlaneProps {
  uniforms: SilkUniforms;
}

const SilkPlane = forwardRef<Mesh, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
  const { viewport } = useThree();

  useLayoutEffect(() => {
    const mesh = ref as React.MutableRefObject<Mesh | null>;
    if (mesh.current) {
      mesh.current.scale.set(viewport.width, viewport.height, 1);
    }
  }, [ref, viewport]);

  useFrame((_state: RootState, delta: number) => {
    const mesh = ref as React.MutableRefObject<Mesh | null>;
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial & {
        uniforms: SilkUniforms;
      };
      material.uniforms.uTime.value += 0.1 * delta;
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
    </mesh>
  );
});
SilkPlane.displayName = 'SilkPlane';

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

const DarkCloudy: React.FC<SilkProps> = ({ speed = 5, scale = 1, color = '#e1bfffff', noiseIntensity = 1.5, rotation = 0 }) => {
  const meshRef = useRef<Mesh>(null);

  const uniforms = useMemo<SilkUniforms>(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 }
    }),
    [speed, scale, noiseIntensity, color, rotation]
  );

  return (
    <Canvas dpr={[1, 2]} frameloop="always">
      <SilkPlane ref={meshRef} uniforms={uniforms} />
    </Canvas>
  );
};

export default DarkCloudy;
