import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

// ============================================================================
// VOLUMETRIC AURORA SHADER - GLSL
// This shader uses raymarching through a 3D noise volume to simulate
// realistic aurora curtains with depth, parallax, and atmospheric scattering
// ============================================================================

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uIntensity;
uniform float uSpeed;
uniform vec3 uPalette[5];
uniform int uPaletteSize;
uniform int uQuality; // 0=low, 1=medium, 2=high
uniform bool uReducedMotion;
uniform vec3 uCameraOffset; // Parallax camera yaw/pitch

varying vec2 vUv;

// ============================================================================
// NOISE FUNCTIONS - Foundation for volumetric density
// ============================================================================

// Hash function for pseudo-random values
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// 3D Simplex-like noise (optimized version)
float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  
  float n = p.x + p.y * 157.0 + 113.0 * p.z;
  return mix(
    mix(mix(hash(p + vec3(0.0, 0.0, 0.0)), hash(p + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(p + vec3(0.0, 1.0, 0.0)), hash(p + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(p + vec3(0.0, 0.0, 1.0)), hash(p + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(p + vec3(0.0, 1.0, 1.0)), hash(p + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

// Fractal Brownian Motion - layered noise for detail
// Octaves controlled by quality setting
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for(int i = 0; i < 6; i++) {
    if(i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.1;
    amplitude *= 0.48;
  }
  return value;
}

// Curl noise for swirling ribbon motion
// Produces divergence-free flow field
vec3 curlNoise(vec3 p) {
  float eps = 0.1;
  float n1, n2;
  vec3 curl;
  
  n1 = noise(p + vec3(0.0, eps, 0.0));
  n2 = noise(p - vec3(0.0, eps, 0.0));
  curl.x = (n1 - n2) / (2.0 * eps);
  
  n1 = noise(p + vec3(eps, 0.0, 0.0));
  n2 = noise(p - vec3(eps, 0.0, 0.0));
  curl.y = (n1 - n2) / (2.0 * eps);
  
  n1 = noise(p + vec3(0.0, 0.0, eps));
  n2 = noise(p - vec3(0.0, 0.0, eps));
  curl.z = (n1 - n2) / (2.0 * eps);
  
  return curl;
}

// ============================================================================
// SPECTRAL COLOR MAPPING - Height and wavelength-based aurora colors
// ============================================================================

vec3 spectralColor(float t, float height) {
  // Interpolate through palette based on t
  t = clamp(t, 0.0, 1.0);
  float index = t * float(uPaletteSize - 1);
  int i1 = int(floor(index));
  int i2 = int(ceil(index));
  float blend = fract(index);
  
  i1 = clamp(i1, 0, uPaletteSize - 1);
  i2 = clamp(i2, 0, uPaletteSize - 1);
  
  vec3 baseColor = mix(uPalette[i1], uPalette[i2], blend);
  
  // Apply height-based color shift (greens at low altitude, purples higher)
  float heightShift = smoothstep(0.0, 1.0, height);
  vec3 heightTint = mix(vec3(0.2, 1.0, 0.5), vec3(0.8, 0.3, 1.0), heightShift);
  
  return baseColor * heightTint;
}

// ============================================================================
// VOLUMETRIC AURORA DENSITY FUNCTION
// This is the core: samples 3D noise to create ribbon-like structures
// ============================================================================

float auroraDensity(vec3 pos, float time, int quality) {
  // Apply curl noise for swirling motion
  vec3 curl = curlNoise(pos * 0.5 + vec3(0.0, time * 0.1, 0.0)) * 0.4;
  vec3 samplePos = pos + curl;
  
  // Multi-scale turbulence for ribbon detail
  int octaves = quality == 2 ? 5 : (quality == 1 ? 4 : 3);
  float turbulence = fbm(samplePos * 1.5 + vec3(time * 0.15, time * 0.08, 0.0), octaves);
  
  // Create ribbon bands using sine waves modulated by noise
  float bands = sin(samplePos.y * 3.0 + turbulence * 2.0 + time * 0.3) * 0.5 + 0.5;
  bands *= sin(samplePos.x * 1.5 + turbulence * 1.5) * 0.5 + 0.5;
  
  // Add secondary layer for depth
  float bands2 = sin(samplePos.y * 4.5 + turbulence * 1.5 - time * 0.2) * 0.5 + 0.5;
  bands = max(bands, bands2 * 0.6);
  
  // Modulate with FBM for organic variation
  float density = bands * turbulence;
  
  // Apply vertical gradient - stronger aurora at mid-altitudes
  float heightFalloff = smoothstep(0.0, 0.3, pos.y) * smoothstep(1.0, 0.6, pos.y);
  density *= heightFalloff;
  
  // Add fine detail with high-frequency noise
  float detail = noise(samplePos * 8.0 + vec3(time * 0.3, 0.0, 0.0)) * 0.3;
  density += detail * density;
  
  return clamp(density, 0.0, 1.0);
}

// ============================================================================
// VOLUMETRIC RAYMARCHING
// March through 3D space accumulating aurora light
// ============================================================================

vec4 volumetricAurora(vec3 rayOrigin, vec3 rayDir, float time, int quality) {
  // Raymarch parameters - adjust step count based on quality
  int maxSteps = quality == 2 ? 32 : (quality == 1 ? 24 : 16);
  float stepSize = 0.08;
  float maxDist = float(maxSteps) * stepSize;
  
  vec3 accumulatedColor = vec3(0.0);
  float accumulatedAlpha = 0.0;
  
  // Start raymarching from camera
  vec3 currentPos = rayOrigin;
  
  for(int i = 0; i < 32; i++) {
    if(i >= maxSteps) break;
    
    // Early termination if we've accumulated enough light
    if(accumulatedAlpha > 0.95) break;
    
    // Sample density at current position
    float density = auroraDensity(currentPos, time, quality);
    
    if(density > 0.01) {
      // Calculate height for color variation (0 = horizon, 1 = zenith)
      float height = (currentPos.y + 0.5) / 1.5;
      
      // Color based on position and time
      float colorPhase = currentPos.x * 0.3 + currentPos.z * 0.2 + time * 0.1;
      vec3 color = spectralColor(fract(colorPhase), height);
      
      // Apply exponential attenuation - light scattering through atmosphere
      float attenuation = exp(-length(currentPos - rayOrigin) * 0.8);
      
      // Density modulates brightness
      float brightness = density * attenuation * stepSize * uIntensity;
      
      // Accumulate color with alpha blending
      vec3 sampledColor = color * brightness;
      accumulatedColor += sampledColor * (1.0 - accumulatedAlpha);
      accumulatedAlpha += brightness * (1.0 - accumulatedAlpha);
    }
    
    // March forward
    currentPos += rayDir * stepSize;
  }
  
  return vec4(accumulatedColor, accumulatedAlpha);
}

// ============================================================================
// ATMOSPHERIC SCATTERING & POST PROCESSING
// ============================================================================

vec3 atmosphericFog(vec3 color, float depth, vec2 uv) {
  // Blue atmospheric haze near horizon
  float horizonFade = smoothstep(0.5, 0.0, uv.y);
  vec3 fogColor = vec3(0.05, 0.1, 0.2);
  float fogAmount = horizonFade * 0.4;
  
  return mix(color, fogColor, fogAmount);
}

// Simple bloom approximation - sample neighboring pixels for glow
vec3 simpleBloom(vec3 color, vec2 uv) {
  float brightness = dot(color, vec3(0.299, 0.587, 0.114));
  
  if(brightness > 0.6) {
    // Add glow for bright regions
    float glow = pow(brightness, 3.0) * 0.5;
    return color + color * glow;
  }
  
  return color;
}

// ACES filmic tone mapping for cinematic look
vec3 acesToneMap(vec3 color) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
}

// ============================================================================
// MAIN SHADER
// ============================================================================

void main() {
  // Normalized coordinates
  vec2 uv = vUv;
  vec2 ndc = (uv - 0.5) * 2.0;
  ndc.x *= uResolution.x / uResolution.y;
  
  float time = uReducedMotion ? 0.0 : uTime * uSpeed;
  
  // ========================================================================
  // CAMERA SETUP WITH PARALLAX
  // ========================================================================
  
  // Ray origin (camera position) - slightly above and back from scene
  vec3 rayOrigin = vec3(0.0, 0.3, -1.5);
  
  // Apply mouse parallax for camera rotation
  rayOrigin.x += uMouse.x * 0.3;
  rayOrigin.y += uMouse.y * 0.2;
  
  // Add camera offset for additional parallax
  rayOrigin += uCameraOffset;
  
  // Ray direction - simulate perspective
  // Add subtle horizontal distortion toward edges for depth
  float edgeDistortion = pow(abs(ndc.x), 2.0) * 0.15;
  vec3 rayDir = normalize(vec3(
    ndc.x * (1.0 + edgeDistortion),
    ndc.y - 0.2, // Look slightly upward
    1.0
  ));
  
  // ========================================================================
  // VOLUMETRIC RENDERING
  // ========================================================================
  
  vec4 auroraColor = volumetricAurora(rayOrigin, rayDir, time, uQuality);
  
  // ========================================================================
  // BACKGROUND - Deep night sky
  // ========================================================================
  
  float skyGradient = smoothstep(0.0, 0.8, uv.y);
  vec3 backgroundColor = mix(
    vec3(0.0, 0.0, 0.01),  // Horizon - very dark blue
    vec3(0.0, 0.0, 0.0),    // Zenith - pure black
    skyGradient
  );
  
  // ========================================================================
  // COMPOSITING
  // ========================================================================
  
  // Blend aurora over background
  vec3 finalColor = mix(backgroundColor, auroraColor.rgb, auroraColor.a);
  
  // Apply atmospheric fog
  finalColor = atmosphericFog(finalColor, 1.0, uv);
  
  // Add bloom for bright regions
  finalColor = simpleBloom(finalColor, uv);
  
  // Tone mapping for filmic look
  finalColor = acesToneMap(finalColor);
  
  // Gamma correction (2.2)
  finalColor = pow(finalColor, vec3(1.0 / 2.2));
  
  // Subtle film grain for organic feel
  float grain = (hash(vec3(uv * 999.0, time)) - 0.5) * 0.02;
  finalColor += grain;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

// ============================================================================
// TYPESCRIPT TYPES & INTERFACES
// ============================================================================

type Quality = 'low' | 'medium' | 'high';

interface AuroraHeroProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  palette?: string[];
  intensity?: number;
  speed?: number;
  quality?: Quality;
  interactive?: boolean;
  prefersReducedMotion?: boolean;
  onReady?: () => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const hexToRgb = (hex: string): THREE.Vector3 => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? new THREE.Vector3(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      )
    : new THREE.Vector3(0, 0, 0);
};

const getQualitySettings = (quality: Quality) => {
  switch (quality) {
    case 'low':
      return { pixelRatio: 0.5, qualityInt: 0 };
    case 'medium':
      return { pixelRatio: 0.75, qualityInt: 1 };
    case 'high':
      return { pixelRatio: 1.0, qualityInt: 2 };
  }
};

// ============================================================================
// MAIN VOLUMETRIC AURORA COMPONENT
// ============================================================================

const VolumetricAuroraHero: React.FC<AuroraHeroProps> = ({
  width = '100%',
  height = '100vh',
  className = '',
  palette = ['#00FFB3', '#00A3FF', '#7B61FF', '#FF6EC7', '#9FFF6A'],
  intensity = 1.2,
  speed = 1.0,
  quality = 'high',
  interactive = false,
  prefersReducedMotion,
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const materialRef = useRef<THREE.ShaderMaterial>();
  const animationFrameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const startTimeRef = useRef(Date.now());

  const [isWebGLAvailable, setIsWebGLAvailable] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Detect prefers-reduced-motion
  const reducedMotion = useMemo(() => {
    if (prefersReducedMotion !== undefined) return prefersReducedMotion;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [prefersReducedMotion]);

  // Quality settings
  const qualitySettings = useMemo(() => getQualitySettings(quality), [quality]);

  // Convert palette to RGB vectors
  const paletteVectors = useMemo(() => palette.map(hexToRgb), [palette]);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setIsWebGLAvailable(false);
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Orthographic camera for fullscreen quad
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    // Renderer with high precision
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2) * qualitySettings.pixelRatio
    );
    rendererRef.current = renderer;

    // Shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2() },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uIntensity: { value: intensity },
        uSpeed: { value: speed },
        uPalette: { value: paletteVectors },
        uPaletteSize: { value: paletteVectors.length },
        uQuality: { value: qualitySettings.qualityInt },
        uReducedMotion: { value: reducedMotion },
        uCameraOffset: { value: new THREE.Vector3(0, 0, 0) },
      },
      transparent: false,
    });
    materialRef.current = material;

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !materialRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      rendererRef.current.setSize(width, height);
      materialRef.current.uniforms.uResolution.value.set(width, height);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse/touch interaction for parallax
    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    if (interactive) {
      window.addEventListener('pointermove', handlePointerMove);
    }

    // Visibility detection for performance
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Animation loop
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !materialRef.current) return;

      if (isVisible) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        materialRef.current.uniforms.uTime.value = elapsed;
        
        // Smooth mouse interpolation for parallax
        const targetX = mouseRef.current.x * 0.1;
        const targetY = mouseRef.current.y * 0.05;
        const currentMouse = materialRef.current.uniforms.uMouse.value;
        currentMouse.x += (targetX - currentMouse.x) * 0.1;
        currentMouse.y += (targetY - currentMouse.y) * 0.1;

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Ready callback
    if (onReady) {
      setTimeout(onReady, 100);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      
      if (geometry) {
        geometry.dispose();
      }
    };
  }, []);

  // Update uniforms when props change
  useEffect(() => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uIntensity.value = intensity;
    materialRef.current.uniforms.uSpeed.value = speed;
    materialRef.current.uniforms.uPalette.value = paletteVectors;
    materialRef.current.uniforms.uPaletteSize.value = paletteVectors.length;
    materialRef.current.uniforms.uQuality.value = qualitySettings.qualityInt;
    materialRef.current.uniforms.uReducedMotion.value = reducedMotion;
  }, [intensity, speed, paletteVectors, qualitySettings, reducedMotion]);

  // Fallback for no WebGL
  if (!isWebGLAvailable) {
    return (
      <div
        className={className}
        style={{
          width,
          height,
          background: 'linear-gradient(180deg, #001a33 0%, #000000 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
        }}
      >
        <p>WebGL not supported. Please use a modern browser.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height, position: 'relative', overflow: 'hidden', background: '#000' }}
      aria-label="Volumetric aurora borealis animated background"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  );
};

// ============================================================================
// DEMO
// ============================================================================

const Demo: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <VolumetricAuroraHero
        width="100%"
        height="100%"
        intensity={1.2}
        speed={1.0}
        quality="high"
        interactive={false}
      />
    </div>
  );
};

export default Demo;