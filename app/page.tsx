'use client';
import { useState } from 'react';
import Header from '@/components/website/header';
import HeroSec from '@/components/website/hero-sec';
import ShaderGallery, { VideoBackground } from '@/components/website/ShaderGallery';
import { Shader } from '@/components/website/ShaderSelector';
import LiquidOrangeShader from '@/components/website/LiquidOrangeShader';
import PlasmaShader from '@/components/website/PlasmaShader';
import OceanWavesShader from '@/components/website/OceanWavesShader';
import NeonFluidShader from '@/components/website/NeonFluidShader';
import GradientWavesShader from '@/components/website/GradientWavesShader';
import CosmicNebulaShader from '@/components/website/CosmicNebulaShader';
import SilkFlowShader from '@/components/website/SilkFlowShader';
import Plasmav2Shader from '@/components/website/Plasmav2';
import LiquidMotionShader from '@/components/website/LiquidMotionShader';
import Wavy, { fragment as WavyFragment } from '@/components/website/Wavy';
import FrothyGalaxyShader from '@/components/website/FrothyGalaxyShader';

// Video backgrounds
const videos: VideoBackground[] = [
  {
    id: 'video-glossy-film',
    name: 'Glossy Film',
    description: 'Smooth glossy film with reflective surface',
    src: '/videos/glossy-film.mp4',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
  },
  {
    id: 'video-nova-silk',
    name: 'Nova Silk',
    description: 'Elegant flowing silk with nova-inspired colors',
    src: '/videos/nova-silk.mp4',
    colors: ['#ff6b35', '#f7931e', '#ffd700', '#ffb347'],
  },
];

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
        
        float edgeDetail = fbm(distorted * 3.0 + totalFlow * 1.5 + time * 0.08, 2);
        liquid += edgeDetail * 0.03 * smoothstep(0.3, 0.8, liquid);
        
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
        
        // Blend with black background (to match the actual component which has bg-black)
        vec3 finalColor = mix(vec3(0.0), color, alpha);
        gl_FragColor = vec4(finalColor, 1.0);
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
        
        // Add some glow effect
        float glow = 1.0 - length(uv) * 0.3;
        color *= glow;
        
        // Purple-pink gradient overlay
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
    id: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Animated ocean with realistic wave motion and foam',
    component: OceanWavesShader,
    thumbnail: '',
    colors: ['#002B5C', '#0055A5', '#4A90E2', '#87CEEB'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      // Hash function for pseudo-random values
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      // 2D noise function
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

      // Fractal Brownian Motion
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        // Wave motion
        float wave = sin(p.x * 0.5 + time * 0.3) * 0.3;
        wave += sin(p.x * 1.5 - p.y * 0.8 + time * 0.4) * 0.15;
        wave += fbm(p * 2.0 + vec2(time * 0.1, time * 0.05)) * 0.1;
        
        // Foam
        float foam = fbm(p * 4.0 + vec2(time * 0.2, wave * 2.0));
        foam = smoothstep(0.5, 0.7, foam);
        
        // Colors
        vec3 deepWater = vec3(0.0, 0.2, 0.4);
        vec3 shallowWater = vec3(0.0, 0.4, 0.6);
        vec3 foamColor = vec3(0.7, 0.9, 1.0);
        
        float waveHeight = wave * 0.5 + 0.5;
        vec3 color = mix(deepWater, shallowWater, waveHeight);
        color = mix(color, foamColor, foam * 0.4);
        
        float depth = smoothstep(0.0, 1.0, 1.0 - uv.y);
        color = mix(color, deepWater, depth * 0.3);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  },
  {
    id: 'neon-fluid',
    name: 'Neon Fluid',
    description: 'Flowing fire with realistic flame motion',
    component: NeonFluidShader,
    thumbnail: '',
    colors: ['#100000', '#CC1100', '#FF6600', '#FFCC00'],
    fragmentShader: `precision highp float;
      uniform vec2 resolution;
      uniform float time;
      
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
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
      
      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      float turbulence(vec2 p) {
        float value = 0.0;
        float amplitude = 1.0;
        for(int i = 0; i < 4; i++) {
          value += amplitude * abs(noise(p) * 2.0 - 1.0);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        float t = time * 0.3;
        vec2 flowPos = p + vec2(0.0, -1.0) * t;
        
        float turbulent = turbulence(flowPos * 1.5 + vec2(t * 0.2, 0.0));
        float displacement = fbm(flowPos * 2.0 + vec2(t * 0.3, -t * 0.5)) * 2.0 - 1.0;
        
        vec2 distorted = p;
        distorted.x += displacement * 0.4;
        distorted.y += turbulent * 0.3;
        
        float flameShape = 1.0 - abs(distorted.x) * (1.0 + distorted.y * 0.8);
        flameShape = smoothstep(0.0, 0.8, flameShape);
        
        float flame1 = fbm(distorted * 2.0 + vec2(t * 0.4, -t * 0.8));
        float flame2 = fbm(distorted * 3.0 + vec2(-t * 0.3, -t * 0.6));
        float flames = flame1 * 0.6 + flame2 * 0.4;
        flames = pow(flames, 1.5);
        
        float intensity = flames * flameShape;
        
        vec3 col = vec3(0.1, 0.0, 0.0);
        col = mix(col, vec3(0.8, 0.1, 0.0), smoothstep(0.0, 0.2, intensity));
        col = mix(col, vec3(1.0, 0.3, 0.0), smoothstep(0.2, 0.4, intensity));
        col = mix(col, vec3(1.0, 0.6, 0.0), smoothstep(0.4, 0.6, intensity));
        col = mix(col, vec3(1.0, 0.9, 0.2), smoothstep(0.6, 0.8, intensity));
        col += vec3(1.0, 1.0, 0.5) * pow(flames, 3.0) * flameShape * 0.5;
        col *= 1.2;
        
        gl_FragColor = vec4(col, 1.0);
      }`
  },
  {
    id: 'gradient-waves',
    name: 'Gradient Waves',
    description: 'Sleek minimalist waves with smooth gradients',
    component: GradientWavesShader,
    thumbnail: '',
    colors: ['#1A2A50', '#2E1A60', '#50207', '#284A80'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        float t = time * 0.5;
        vec3 col = vec3(0.0);
        
        // Ethereal background gradient
        vec3 bg = mix(
            vec3(0.05, 0.05, 0.2), 
            vec3(0.1, 0.0, 0.3), 
            uv.y
        );
        col = bg;
        
        // Layered waves
        for(float i = 0.0; i < 4.0; i++) {
            float seed = i * 12.345;
            float speed = 0.2 + i * 0.1;
            float freq = 2.0 + i * 1.5;
            float amp = 0.3 - i * 0.05;
            
            float wave = sin(p.x * freq + t * speed + seed) * amp;
            wave += sin(p.x * freq * 2.1 - t * speed * 1.5) * amp * 0.5;
            
            float d = abs(p.y - wave);
            
            // Soft glowing lines
            float glow = smoothstep(0.5, 0.0, d);
            
            // Dynamic gradient colors
            vec3 waveCol = mix(
                vec3(0.0, 0.8, 1.0), // Cyan
                vec3(0.8, 0.2, 1.0), // Magenta
                sin(p.x + t + i) * 0.5 + 0.5
            );
            
            // Additive blending
            col += waveCol * glow * 0.3;
        }
        
        // Vignette
        float vig = 1.0 - length(uv - 0.5) * 0.5;
        col *= vig;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    description: 'Swirling space nebula with twinkling stars',
    component: CosmicNebulaShader,
    thumbnail: '',
    colors: ['#260A3E', '#CC1A99', '#FF4DB8', '#337ACC', '#8033E5'],
    fragmentShader: `precision highp float;
      uniform vec2 resolution;
      uniform float time;
      float hash(vec3 p) { p=fract(p*0.31+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
      float noise(vec3 x) {
        vec3 p=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
        return mix(mix(mix(hash(p),hash(p+vec3(1,0,0)),f.x),mix(hash(p+vec3(0,1,0)),hash(p+vec3(1,1,0)),f.x),f.y),
                   mix(mix(hash(p+vec3(0,0,1)),hash(p+vec3(1,0,1)),f.x),mix(hash(p+vec3(0,1,1)),hash(p+vec3(1,1,1)),f.x),f.y),f.z);
      }
      float fbm(vec3 p) { float v=0.0,a=0.5; for(int i=0;i<5;i++) { v+=a*noise(p); p*=2.1; a*=0.45; } return v; }
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0; p.x *= resolution.x / resolution.y;
        float t = time * 0.15;
        vec3 pos = vec3(p*1.5, t);
        float n = fbm(pos*2.0);
        vec3 c = mix(vec3(0.15,0.05,0.3), vec3(0.8,0.1,0.6), n);
        c = mix(c, vec3(1.0,0.3,0.7), fbm(pos*3.0)*0.7);
        float s = step(0.98, hash(vec3(floor(uv*200.0), 1.0)));
        gl_FragColor = vec4(c * pow(n, 0.8) * 1.5 + vec3(s), 1.0);
      }`
  },
  {
    id: 'silk-flow',
    name: 'Silk Flow',
    description: 'Vertical flowing silk ribbons in blue and magenta',
    component: SilkFlowShader,
    thumbnail: '',
    colors: ['#0066CC', '#00CCCC', '#CC1A99', '#FF4DB8'],
    fragmentShader: `precision highp float;
      uniform vec2 resolution;
      uniform float time;
      float silkRibbon(vec2 p,float offset) {
        float x=p.x+sin(p.y*2.0+time*1.5+offset)*0.15;
        return smoothstep(0.02,0.0,abs(x));
      }
      void main() {
        vec2 uv=gl_FragCoord.xy/resolution.xy;
        vec2 p=(uv-0.5)*2.0; p.x*=resolution.x/resolution.y;
        float flow=sin(p.y*3.0-time*2.0)*0.5+0.5;
        vec3 col=vec3(0.0);
        for(float i=0.0;i<7.0;i++) {
          float off=i*1.2;
          float x=(i-3.0)*0.35;
          float r=silkRibbon(p-vec2(x,0),off);
          float h=fract(flow+i*0.15);
          vec3 c=mix(vec3(0,0.4,0.8),vec3(0,0.8,0.8),h);
          c=mix(c,vec3(0.8,0.1,0.6),smoothstep(0.4,0.8,h));
          float sheen=pow(1.0-abs(p.x-x)*3.0,2.0)*0.3;
          col+=c*r+vec3(sheen)*r;
        }
        gl_FragColor=vec4(col,1.0);
      }`
  },

  {
    id: 'plasma-v2',
    name: 'Plasma V2',
    description: 'Enhanced plasma effect with vivid neon colors and fluid motion',
    component: Plasmav2Shader,
    thumbnail: '',
    colors: ['#6B46C1', '#00CED1', '#9333EA', '#C084FC'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / min(resolution.x, resolution.y);
        float t = time * 0.4;
        
        vec2 p = uv * 3.0;
        
        // Fluid-like wrapping
        for(float i=1.0; i<5.0; i++){
            p.x += 0.3/i * sin(i*3.0*p.y + t);
            p.y += 0.3/i * cos(i*3.0*p.x + t);
        }
        
        // Rich color mixing
        float r = 0.5 + 0.5 * sin(p.x + p.y + t);
        float g = 0.5 + 0.5 * sin(p.x * 1.5 + t * 0.5);
        float b = 0.5 + 0.5 * sin(p.y * 1.5 + t * 0.8);
        
        vec3 color = vec3(r, g, b);
        
        // Tint towards pleasant neon palette
        vec3 palette = mix(
            vec3(0.2, 0.0, 0.4), // Dark purple
            vec3(0.0, 0.8, 0.9), // Cyan
            length(color) * 0.5
        );
        
        color = mix(palette, color, 0.4);
        
        // Soft glow / vignette
        float glow = 1.0 - length(uv * 0.8);
        color *= smoothstep(0.0, 1.0, glow);
        
        // Extra vibrancy
        color += vec3(0.4, 0.1, 0.5) * 0.3;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  },
  {
    id: 'liquid-motion',
    name: 'Liquid Motion',
    description: 'Interactive fluid simulation with vibrant flowing colors',
    component: LiquidMotionShader,
    thumbnail: '',
    colors: ['#5227FF', '#FF9FFC', '#B19EEF'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv - 0.5;
        p.x *= resolution.x / resolution.y;
        
        // Create subtle flowing waves
        float dist = length(p);
        float wave = sin(dist * 6.0 - time * 0.8) * 0.5 + 0.5;
        wave += sin(dist * 4.0 + time * 0.6 + p.x * 3.0) * 0.3;
        wave *= 0.5;
        
        // Very subtle blush/pink color that almost merges with black
        vec3 blush = vec3(0.15, 0.05, 0.12); // Very dark pinkish
        vec3 black = vec3(0.0, 0.0, 0.0);
        
        // Mix with wave intensity - mostly black
        vec3 color = mix(black, blush, wave * 0.3);
        
        // Add very subtle glow in center
        float glow = 1.0 - smoothstep(0.0, 0.6, dist);
        color += blush * glow * 0.15;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `
  },
  {
    id: 'wavy',
    name: 'Dark Veil',
    description: 'Mysterious dark veil with scanlines and distortion',
    component: Wavy,
    thumbnail: '',
    colors: ['#3366E6', '#9933CC', '#CC1A99', '#E6194D'],
    fragmentShader: `
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
    `
  },
  {
    id: 'frothy-galaxy',
    name: 'Frothy Galaxy',
    description: 'Smooth flowing waves with beautiful blue gradients and shimmer',
    component: FrothyGalaxyShader,
    thumbnail: '',
    colors: ['#1A4D7A', '#2E6BA8', '#4A90E2', '#87CEEB'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
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

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for(int i = 0; i < 5; i++) {
          value += amplitude * noise(p * frequency);
          frequency *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = (uv - 0.5) * 2.0;
        p.x *= resolution.x / resolution.y;
        
        // Smooth flowing waves
        float wave1 = sin(p.x * 2.0 + time * 0.5) * 0.3;
        float wave2 = sin(p.x * 1.5 - p.y * 0.8 + time * 0.4) * 0.2;
        float wave3 = sin(p.x * 3.0 + p.y * 1.5 + time * 0.6) * 0.15;
        float waves = wave1 + wave2 + wave3;
        
        // Add noise detail
        waves += fbm(p * 2.0 + vec2(time * 0.1, 0.0)) * 0.2;
        
        // Normalized wave height
        float h = waves * 0.5 + 0.5;
        
        // Beautiful gradient colors
        vec3 color1 = vec3(0.1, 0.3, 0.6);   // Deep blue
        vec3 color2 = vec3(0.2, 0.5, 0.8);   // Medium blue
        vec3 color3 = vec3(0.4, 0.7, 0.9);   // Light blue
        vec3 color4 = vec3(0.6, 0.85, 0.95); // Pale blue
        
        // Smooth color transitions
        vec3 color;
        if (h < 0.33) {
          color = mix(color1, color2, h * 3.0);
        } else if (h < 0.66) {
          color = mix(color2, color3, (h - 0.33) * 3.0);
        } else {
          color = mix(color3, color4, (h - 0.66) * 3.0);
        }
        
        // Add shimmer
        float shimmer = fbm(p * 6.0 + vec2(time * 0.3, time * 0.2));
        shimmer = pow(shimmer, 2.0) * 0.3;
        color += vec3(shimmer);
        
        // Depth fade
        color = mix(color, color1 * 0.8, (1.0 - uv.y) * 0.4);
        
        // Subtle vignette
        float dist = length(uv - 0.5);
        color *= 1.0 - dist * 0.3;
        
        gl_FragColor = vec4(color, 1.0);
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

        {/* Background Gallery Section */}
        <ShaderGallery
          shaders={shaders}
          videos={videos}
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
              href='https://github.com/harshsinghsv/shaders-library'
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
