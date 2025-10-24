'use client';
import { useState } from 'react';
import Header from '@/components/website/header';
import HeroSec from '@/components/website/hero-sec';
import ShaderGallery from '@/components/website/ShaderGallery';
import { Shader } from '@/components/website/ShaderSelector';
import LiquidOrangeShader from '@/components/website/LiquidOrangeShader';
import PlasmaShader from '@/components/website/PlasmaShader';
import AuroraShader from '@/components/website/AuroraShader';

const shaders: Shader[] = [
  {
    id: 'liquid-orange',
    name: 'Liquid Orange',
    description: 'Flowing liquid with warm orange tones',
    component: LiquidOrangeShader,
    thumbnail: '',
    colors: ['#CC4500', '#FF6347', '#FF8C00', '#FFD700'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        
        vec2 u = f * f * (3.0 - 2.0 * f);
        
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st, int octaves) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 8; i++) {
          if(i >= octaves) break;
          value += amplitude * noise(st * frequency);
          frequency *= 1.8;
          amplitude *= 0.55;
        }
        return value;
      }

      vec2 curl(vec2 p, float time) {
        float eps = 0.01;
        float n1 = fbm(p + vec2(eps, 0.0) + time * 0.1, 6);
        float n2 = fbm(p + vec2(-eps, 0.0) + time * 0.1, 6);
        float n3 = fbm(p + vec2(0.0, eps) + time * 0.1, 6);
        float n4 = fbm(p + vec2(0.0, -eps) + time * 0.1, 6);
        
        return vec2(n3 - n4, n2 - n1) / (2.0 * eps);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 st = uv * 2.0 - 1.0;
        st.x *= resolution.x / resolution.y;
        
        vec2 flow1 = curl(st * 1.2 + vec2(time * 0.03), time);
        vec2 flow2 = curl(st * 1.5 - vec2(time * 0.02, time * 0.025), time * 1.2);
        
        vec2 totalFlow = flow1 * 0.6 + flow2 * 0.4;
        
        vec2 distorted = st;
        for(int i = 0; i < 2; i++) {
          distorted += curl(distorted * 1.5 + totalFlow, time + float(i) * 0.5) * 0.1;
        }
        
        float liquid = 0.0;
        
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          vec2 offset = vec2(
            sin(time * 0.15 + fi * 2.1) * 0.6,
            cos(time * 0.12 + fi * 1.7) * 0.5
          );
          
          vec2 flowOffset = totalFlow * (0.3 + fi * 0.1);
          vec2 pos = offset + flowOffset;
          
          float dist = length(distorted - pos);
          float size = 0.4 + sin(time * 0.2 + fi) * 0.15;
          liquid += smoothstep(size, 0.0, dist) * (1.0 - fi * 0.15);
        }
        
        float turbulence = fbm(distorted * 2.0 + totalFlow + time * 0.05, 4);
        liquid += turbulence * 0.15;
        
        float tendrils = 0.0;
        for(int i = 0; i < 2; i++) {
          float fi = float(i);
          vec2 tendrilFlow = distorted * 2.5 + totalFlow * 1.5 + time * (0.08 + fi * 0.03);
          float t = sin(tendrilFlow.x * 2.0 + cos(tendrilFlow.y * 1.5)) * 
                   cos(tendrilFlow.y * 2.0 + sin(tendrilFlow.x * 1.5));
          tendrils += t * (0.1 - fi * 0.03);
        }
        liquid += tendrils;
        
        float edgeDetail = fbm(distorted * 5.0 + totalFlow * 2.0 + time * 0.1, 3);
        liquid += edgeDetail * 0.08 * smoothstep(0.3, 0.8, liquid);
        
        float grain1 = random(uv * 800.0 + time * 15.0) * 0.08;
        float grain2 = random(uv * 400.0 + sin(time * 8.0)) * 0.05;
        liquid += grain1 + grain2;
        
        vec3 dark = vec3(0.8, 0.2, 0.0);
        vec3 mid = vec3(1.0, 0.4, 0.05);
        vec3 bright = vec3(1.0, 0.6, 0.15);
        vec3 highlight = vec3(1.0, 0.75, 0.3);
        
        float colorFlow = fbm(distorted * 2.0 + time * 0.06, 4);
        vec3 color = mix(dark, mid, liquid * 0.6);
        color = mix(color, bright, liquid * liquid * 0.8);
        color = mix(color, highlight, pow(liquid, 3.0) * 0.5);
        color = mix(color, color * 1.2, colorFlow * 0.3);
        
        float alpha = liquid * 0.8;
        alpha = smoothstep(0.15, 0.7, alpha);
        alpha *= 1.0 - smoothstep(0.9, 1.2, liquid) * 0.5;
        
        gl_FragColor = vec4(color * alpha, alpha);
      }
    `
  },
  {
    id: 'plasma',
    name: 'Plasma',
    description: 'Electric plasma with purple-pink colors',
    component: PlasmaShader,
    thumbnail: '',
    colors: ['#6B46C1', '#9333EA', '#C084FC', '#F3E8FF'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      vec3 plasma(vec2 uv, float time) {
        float v = 0.0;
        vec2 c = uv;
        
        v += sin((c.x + time) * 2.0);
        v += sin((c.y + time) * 3.0);
        v += sin((c.x + c.y + time) * 2.0);
        
        c += vec2(sin(time * 0.5) * 2.0, cos(time * 0.3) * 2.0);
        v += sin(sqrt(c.x * c.x + c.y * c.y + 1.0) + time);
        
        return vec3(
          sin(v * 3.14159),
          sin(v * 3.14159 + 2.094),
          sin(v * 3.14159 + 4.188)
        ) * 0.5 + 0.5;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        uv *= 2.0;
        
        vec3 color = plasma(uv, time * 0.8);
        
        float glow = 1.0 - length(uv) * 0.3;
        color *= glow;
        
        vec3 purpleGradient = mix(
          vec3(0.4, 0.1, 0.8),
          vec3(0.8, 0.2, 0.6),
          (uv.y + 1.0) * 0.5
        );
        
        color = mix(color, purpleGradient, 0.3);
        
        gl_FragColor = vec4(color, 0.9);
      }
    `
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Volumetric aurora with realistic atmospheric effects',
    component: AuroraShader,
    thumbnail: '',
    colors: ['#00FFB3', '#00A3FF', '#7B61FF', '#FF6EC7', '#9FFF6A'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

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

      // Aurora density function
      float auroraDensity(vec3 pos, float time) {
        vec3 curl = curlNoise(pos * 0.5 + vec3(0.0, time * 0.1, 0.0)) * 0.4;
        vec3 samplePos = pos + curl;
        
        float turbulence = fbm(samplePos * 1.5 + vec3(time * 0.15, time * 0.08, 0.0), 4);
        
        float bands = sin(samplePos.y * 3.0 + turbulence * 2.0 + time * 0.3) * 0.5 + 0.5;
        bands *= sin(samplePos.x * 1.5 + turbulence * 1.5) * 0.5 + 0.5;
        
        float bands2 = sin(samplePos.y * 4.5 + turbulence * 1.5 - time * 0.2) * 0.5 + 0.5;
        bands = max(bands, bands2 * 0.6);
        
        float density = bands * turbulence;
        
        float heightFalloff = smoothstep(0.0, 0.3, pos.y) * smoothstep(1.0, 0.6, pos.y);
        density *= heightFalloff;
        
        float detail = noise(samplePos * 8.0 + vec3(time * 0.3, 0.0, 0.0)) * 0.3;
        density += detail * density;
        
        return clamp(density, 0.0, 1.0);
      }

      // Volumetric raymarching
      vec4 volumetricAurora(vec3 rayOrigin, vec3 rayDir, float time) {
        int maxSteps = 24;
        float stepSize = 0.08;
        
        vec3 accumulatedColor = vec3(0.0);
        float accumulatedAlpha = 0.0;
        
        vec3 currentPos = rayOrigin;
        
        for(int i = 0; i < 24; i++) {
          if(i >= maxSteps) break;
          
          if(accumulatedAlpha > 0.95) break;
          
          float density = auroraDensity(currentPos, time);
          
          if(density > 0.01) {
            float height = (currentPos.y + 0.5) / 1.5;
            float colorPhase = currentPos.x * 0.3 + currentPos.z * 0.2 + time * 0.1;
            
            // Aurora colors
            vec3 color1 = vec3(0.0, 1.0, 0.7);  // Green
            vec3 color2 = vec3(0.0, 0.6, 1.0);  // Blue
            vec3 color3 = vec3(0.5, 0.4, 1.0);  // Purple
            vec3 color4 = vec3(1.0, 0.4, 0.8);  // Pink
            vec3 color5 = vec3(0.6, 1.0, 0.4);  // Light green
            
            vec3 baseColor = mix(color1, color2, fract(colorPhase));
            baseColor = mix(baseColor, color3, fract(colorPhase + 0.33));
            baseColor = mix(baseColor, color4, fract(colorPhase + 0.66));
            
            float heightShift = smoothstep(0.0, 1.0, height);
            vec3 heightTint = mix(vec3(0.2, 1.0, 0.5), vec3(0.8, 0.3, 1.0), heightShift);
            
            vec3 color = baseColor * heightTint;
            
            float attenuation = exp(-length(currentPos - rayOrigin) * 0.8);
            float brightness = density * attenuation * stepSize * 1.2;
            
            vec3 sampledColor = color * brightness;
            accumulatedColor += sampledColor * (1.0 - accumulatedAlpha);
            accumulatedAlpha += brightness * (1.0 - accumulatedAlpha);
          }
          
          currentPos += rayDir * stepSize;
        }
        
        return vec4(accumulatedColor, accumulatedAlpha);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 ndc = (uv - 0.5) * 2.0;
        ndc.x *= resolution.x / resolution.y;
        
        vec3 rayOrigin = vec3(0.0, 0.3, -1.5);
        vec3 rayDir = normalize(vec3(ndc.x, ndc.y - 0.2, 1.0));
        
        vec4 auroraColor = volumetricAurora(rayOrigin, rayDir, time);
        
        float skyGradient = smoothstep(0.0, 0.8, uv.y);
        vec3 backgroundColor = mix(
          vec3(0.0, 0.0, 0.01),
          vec3(0.0, 0.0, 0.0),
          skyGradient
        );
        
        vec3 finalColor = mix(backgroundColor, auroraColor.rgb, auroraColor.a);
        
        // Atmospheric fog
        float horizonFade = smoothstep(0.5, 0.0, uv.y);
        vec3 fogColor = vec3(0.05, 0.1, 0.2);
        float fogAmount = horizonFade * 0.4;
        finalColor = mix(finalColor, fogColor, fogAmount);
        
        // Tone mapping
        float a = 2.51;
        float b = 0.03;
        float c = 2.43;
        float d = 0.59;
        float e = 0.14;
        finalColor = clamp((finalColor * (a * finalColor + b)) / (finalColor * (c * finalColor + d) + e), 0.0, 1.0);
        
        // Gamma correction
        finalColor = pow(finalColor, vec3(1.0 / 2.2));
        
        // Film grain
        float grain = (hash(vec3(uv * 999.0, time)) - 0.5) * 0.02;
        finalColor += grain;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
  }
];

export default function Home() {
  const [activeShader, setActiveShader] = useState('liquid-orange');

  return (
    <>
      <Header />
      <main className='relative'>
        <HeroSec activeShader={activeShader} />

        {/* Shader Gallery Section */}
        <ShaderGallery 
          shaders={shaders}
          activeShader={activeShader}
          onShaderChange={setActiveShader}
        />
      </main>
      
      <footer className='border-t border-white/10 py-12 bg-black'>
        <div className='container mx-auto px-6'>
          <p className='text-balance text-center text-sm leading-loose text-gray-400'>
            Built by{' '}
            <a
              href='https://x.com/harshsinghsv'
              target='_blank'
              rel='noreferrer'
              className='font-medium text-white underline underline-offset-4 hover:text-gray-300 transition-colors'
            >
              harsh
            </a>{' '}
            and{' '}
            <a
              href='https://x.com/shubhamm069'
              target='_blank'
              rel='noreferrer'
              className='font-medium text-white underline underline-offset-4 hover:text-gray-300 transition-colors'
            >
              shubham
            </a>{' '}
            . The source code is available on{' '}
            <a
              href='https://github.com/naymurdev/uilayout'
              target='_blank'
              rel='noreferrer'
              className='font-medium text-white underline underline-offset-4 hover:text-gray-300 transition-colors'
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </>
  );
}
