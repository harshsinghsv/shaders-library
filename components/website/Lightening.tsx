import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface LightPillarProps {
  topColor?: string;
  bottomColor?: string;
  accentColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  className?: string;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
  pillarRotation?: number;
  quality?: 'low' | 'medium' | 'high';
  chromaticAberration?: number;
  energyPulse?: boolean;
  particleEffect?: boolean;
}

const LightPillar: React.FC<LightPillarProps> = ({
  topColor = '#5227FF',
  bottomColor = '#FF9FFC',
  accentColor = '#00FFFF',
  intensity = 1.0,
  rotationSpeed = 0.3,
  interactive = false,
  className = '',
  glowAmount = 0.005,
  pillarWidth = 3.0,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  mixBlendMode = 'screen',
  pillarRotation = 0,
  quality = 'high',
  chromaticAberration = 0.003,
  energyPulse = true,
  particleEffect = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const timeRef = useRef(0);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setWebGLSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !webGLSupported) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = isMobile || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

    let effectiveQuality = quality;
    if (isLowEndDevice && quality === 'high') effectiveQuality = 'medium';
    if (isMobile && quality !== 'low') effectiveQuality = 'low';

    const qualitySettings = {
      low: { iterations: 24, waveIterations: 1, pixelRatio: 0.5, precision: 'mediump', stepMultiplier: 1.5 },
      medium: { iterations: 40, waveIterations: 2, pixelRatio: 0.65, precision: 'mediump', stepMultiplier: 1.2 },
      high: { iterations: 80, waveIterations: 4, pixelRatio: Math.min(window.devicePixelRatio, 2), precision: 'highp', stepMultiplier: 1.0 }
    };

    const settings = qualitySettings[effectiveQuality] || qualitySettings.medium;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: effectiveQuality === 'low' ? 'low-power' : 'high-performance',
        precision: settings.precision as any,
        stencil: false,
        depth: false
      });
    } catch (error) {
      console.error('Failed to create WebGL renderer:', error);
      setWebGLSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(settings.pixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Convert hex colors to RGB
    const parseColor = (hex: string): THREE.Vector3 => {
      const color = new THREE.Color(hex);
      return new THREE.Vector3(color.r, color.g, color.b);
    };

    // Enhanced shader with chromatic aberration, energy pulses, and particles
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform vec3 uAccentColor;
      uniform float uIntensity;
      uniform bool uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uRotCos;
      uniform float uRotSin;
      uniform float uPillarRotCos;
      uniform float uPillarRotSin;
      uniform float uWaveSin[4];
      uniform float uWaveCos[4];
      uniform float uChromaticAberration;
      uniform bool uEnergyPulse;
      uniform bool uParticleEffect;
      varying vec2 vUv;
      
      const float PI = 3.141592653589793;
      const float EPSILON = 0.001;
      const float E = 2.71828182845904523536;
      
      float noise(vec2 coord) {
        vec2 r = (E * sin(E * coord));
        return fract(r.x * r.y * (1.0 + coord.x));
      }
      
      // Enhanced 3D noise
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      
      float noise3d(vec3 x) {
        vec3 p = floor(x);
        vec3 f = fract(x);
        f = f * f * (3.0 - 2.0 * f);
        
        return mix(
          mix(mix(hash(p), hash(p + vec3(1.0, 0.0, 0.0)), f.x),
              mix(hash(p + vec3(0.0, 1.0, 0.0)), hash(p + vec3(1.0, 1.0, 0.0)), f.x), f.y),
          mix(mix(hash(p + vec3(0.0, 0.0, 1.0)), hash(p + vec3(1.0, 0.0, 1.0)), f.x),
              mix(hash(p + vec3(0.0, 1.0, 1.0)), hash(p + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
      }
      
      // Particle field function
      float particleField(vec3 p, float time) {
        float particles = 0.0;
        for(int i = 0; i < 3; i++) {
          float fi = float(i);
          vec3 offset = vec3(sin(time * 0.5 + fi), cos(time * 0.3 + fi * 2.0), sin(time * 0.4 + fi * 3.0)) * 2.0;
          float dist = length(p - offset);
          particles += 0.03 / (dist * dist + 0.1);
        }
        return particles;
      }
      
      vec3 raymarch(vec2 uv, float aberration) {
        vec3 origin = vec3(0.0, 0.0, -10.0);
        vec3 direction = normalize(vec3(uv, 1.0));
        
        float maxDepth = 50.0;
        float depth = 0.1;
        
        float rotCos = uRotCos;
        float rotSin = uRotSin;
        
        if(uInteractive && length(uMouse) > 0.0) {
          float mouseAngle = uMouse.x * PI * 2.0;
          rotCos = cos(mouseAngle);
          rotSin = sin(mouseAngle);
        }
        
        vec3 color = vec3(0.0);
        float energyAccum = 0.0;
        
        const int ITERATIONS = ${settings.iterations};
        const int WAVE_ITERATIONS = ${settings.waveIterations};
        const float STEP_MULT = ${settings.stepMultiplier.toFixed(1)};
        
        for(int i = 0; i < ITERATIONS; i++) {
          vec3 pos = origin + direction * depth;
          
          // Rotation
          float newX = pos.x * rotCos - pos.z * rotSin;
          float newZ = pos.x * rotSin + pos.z * rotCos;
          pos.x = newX;
          pos.z = newZ;
          
          // Wave deformation
          vec3 deformed = pos;
          deformed.y *= uPillarHeight;
          deformed = deformed + vec3(0.0, uTime, 0.0);
          
          float frequency = 1.0;
          float amplitude = 1.0;
          
          for(int j = 0; j < WAVE_ITERATIONS; j++) {
            float wx = deformed.x * uWaveCos[j] - deformed.z * uWaveSin[j];
            float wz = deformed.x * uWaveSin[j] + deformed.z * uWaveCos[j];
            deformed.x = wx;
            deformed.z = wz;
            
            float phase = uTime * float(j) * 2.0;
            vec3 oscillation = cos(deformed.zxy * frequency - phase);
            deformed += oscillation * amplitude;
            
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          
          // Distance field
          vec2 cosinePair = cos(deformed.xz);
          float fieldDistance = length(cosinePair) - 0.2;
          
          // Add 3D noise distortion
          float noiseVal = noise3d(deformed * 2.0 + uTime * 0.5) * 0.15;
          fieldDistance += noiseVal;
          
          // Radial boundary
          float radialBound = length(pos.xz) - uPillarWidth;
          float k = 4.0;
          float h = max(k - abs(-radialBound - (-fieldDistance)), 0.0);
          fieldDistance = -(min(-radialBound, -fieldDistance) - h * h * 0.25 / k);
          fieldDistance = abs(fieldDistance) * 0.15 + 0.01;
          
          // Dynamic gradient with accent color
          float heightGrad = smoothstep(15.0, -15.0, pos.y);
          vec3 gradient = mix(uBottomColor, uTopColor, heightGrad);
          
          // Add accent color in the middle
          float midGrad = 1.0 - abs(heightGrad - 0.5) * 2.0;
          gradient = mix(gradient, uAccentColor, midGrad * 0.3);
          
          // Energy pulse effect
          if(uEnergyPulse) {
            float pulse = sin(uTime * 2.0 + pos.y * 0.5) * 0.5 + 0.5;
            gradient = mix(gradient, gradient * 1.5, pulse * 0.3);
          }
          
          // Add chromatic aberration influence
          gradient *= (1.0 + aberration * 10.0);
          
          color += gradient / fieldDistance;
          energyAccum += 1.0 / (fieldDistance * 10.0);
          
          if(fieldDistance < EPSILON || depth > maxDepth) break;
          
          depth += fieldDistance * STEP_MULT;
        }
        
        // Add particle field
        if(uParticleEffect) {
          vec3 particlePos = origin + direction * 5.0;
          float newX = particlePos.x * rotCos - particlePos.z * rotSin;
          float newZ = particlePos.x * rotSin + particlePos.z * rotCos;
          particlePos.x = newX;
          particlePos.z = newZ;
          
          float particles = particleField(particlePos, uTime);
          color += uAccentColor * particles * 0.5;
        }
        
        return color;
      }
      
      void main() {
        vec2 fragCoord = vUv * uResolution;
        vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;
        
        // Apply pillar rotation
        uv = vec2(
          uv.x * uPillarRotCos - uv.y * uPillarRotSin,
          uv.x * uPillarRotSin + uv.y * uPillarRotCos
        );
        
        // Chromatic aberration - sample three times with offset
        vec3 colorR = raymarch(uv + vec2(uChromaticAberration, 0.0), uChromaticAberration);
        vec3 colorG = raymarch(uv, 0.0);
        vec3 colorB = raymarch(uv - vec2(uChromaticAberration, 0.0), -uChromaticAberration);
        
        vec3 color = vec3(colorR.r, colorG.g, colorB.b);
        
        // Normalize and apply glow
        float widthNormalization = uPillarWidth / 3.0;
        color = tanh(color * uGlowAmount / widthNormalization);
        
        // Enhanced noise with color variation
        float rnd = noise(gl_FragCoord.xy + uTime * 0.1);
        color -= rnd / 15.0 * uNoiseIntensity;
        
        // Add subtle vignette for depth
        float dist = length(vUv - 0.5);
        color *= 1.0 - dist * 0.3;
        
        // Color grading - boost saturation and contrast
        color = pow(color, vec3(0.9)) * 1.1;
        
        gl_FragColor = vec4(color * uIntensity, 1.0);
      }
    `;

    // Pre-compute wave rotation values
    const waveAngle = 0.4;
    const waveSinValues = new Float32Array(4);
    const waveCosValues = new Float32Array(4);
    for (let i = 0; i < 4; i++) {
      waveSinValues[i] = Math.sin(waveAngle);
      waveCosValues[i] = Math.cos(waveAngle);
    }

    // Pre-compute pillar rotation
    const pillarRotRad = (pillarRotation * Math.PI) / 180.0;
    const pillarRotCos = Math.cos(pillarRotRad);
    const pillarRotSin = Math.sin(pillarRotRad);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: mouseRef.current },
        uTopColor: { value: parseColor(topColor) },
        uBottomColor: { value: parseColor(bottomColor) },
        uAccentColor: { value: parseColor(accentColor) },
        uIntensity: { value: intensity },
        uInteractive: { value: interactive },
        uGlowAmount: { value: glowAmount },
        uPillarWidth: { value: pillarWidth },
        uPillarHeight: { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uRotCos: { value: 1.0 },
        uRotSin: { value: 0.0 },
        uPillarRotCos: { value: pillarRotCos },
        uPillarRotSin: { value: pillarRotSin },
        uWaveSin: { value: waveSinValues },
        uWaveCos: { value: waveCosValues },
        uChromaticAberration: { value: chromaticAberration },
        uEnergyPulse: { value: energyPulse },
        uParticleEffect: { value: particleEffect }
      },
      transparent: true,
      depthWrite: false,
      depthTest: false
    });

    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    geometryRef.current = geometry;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse interaction
    let mouseMoveTimeout: number | null = null;
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      if (mouseMoveTimeout) return;

      mouseMoveTimeout = window.setTimeout(() => {
        mouseMoveTimeout = null;
      }, 16);

      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(x, y);
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    // Animation loop
    let lastTime = performance.now();
    const targetFPS = effectiveQuality === 'low' ? 30 : 60;
    const frameTime = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameTime) {
        timeRef.current += 0.016 * rotationSpeed;
        materialRef.current.uniforms.uTime.value = timeRef.current;

        const rotAngle = timeRef.current * 0.3;
        materialRef.current.uniforms.uRotCos.value = Math.cos(rotAngle);
        materialRef.current.uniforms.uRotSin.value = Math.sin(rotAngle);

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        lastTime = currentTime - (deltaTime % frameTime);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    // Handle resize
    let resizeTimeout: number | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      resizeTimeout = window.setTimeout(() => {
        if (!rendererRef.current || !materialRef.current || !containerRef.current) return;

        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;

        rendererRef.current.setSize(newWidth, newHeight);
        materialRef.current.uniforms.uResolution.value.set(newWidth, newHeight);
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }

      rendererRef.current = null;
      materialRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      geometryRef.current = null;
      rafRef.current = null;
    };
  }, [
    topColor,
    bottomColor,
    accentColor,
    intensity,
    rotationSpeed,
    interactive,
    glowAmount,
    pillarWidth,
    pillarHeight,
    noiseIntensity,
    pillarRotation,
    webGLSupported,
    quality,
    chromaticAberration,
    energyPulse,
    particleEffect
  ]);

  if (!webGLSupported) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-gray-400">WebGL not supported</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        mixBlendMode: mixBlendMode,
        position: 'relative'
      }}
    />
  );
};

// Demo component
const Lightening = () => {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <div className="relative w-full h-full">
        <LightPillar
          topColor="#00FFFF"
          bottomColor="#FF00FF"
          accentColor="#FFFF00"
          intensity={1.2}
          rotationSpeed={0.4}
          interactive={true}
          glowAmount={0.006}
          pillarWidth={3.5}
          pillarHeight={0.35}
          noiseIntensity={0.4}
          chromaticAberration={0.004}
          energyPulse={true}
          particleEffect={true}
          quality="high"
          mixBlendMode="screen"
        />
        
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
          <h1 className="text-6xl font-bold text-white mb-2 tracking-wider">
            LIGHT PILLAR
          </h1>
          <p className="text-cyan-400 text-lg tracking-widest">
            INTERACTIVE 3D VISUALIZATION
          </p>
        </div>
        
        <div className="absolute bottom-8 right-8 text-white text-sm opacity-70 pointer-events-none">
          <p>Move your mouse to interact</p>
        </div>
      </div>
    </div>
  );
};

export default Lightening;