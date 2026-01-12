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
import GlossyRibbonShader from '@/components/website/GlossyRibbonShader';
import SilkFlowShader from '@/components/website/SilkFlowShader';
import GlassTwistShader from '@/components/website/GlassTwistShader';
import Plasmav2Shader from '@/components/website/Plasmav2';
import LiquidMotionShader from '@/components/website/LiquidMotionShader';
import Wavy, { fragment as WavyFragment } from '@/components/website/Wavy';

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
    id: 'glossy-ribbon',
    name: 'Glossy Ribbon',
    description: '3D twisted ribbons with glossy magenta and purple',
    component: GlossyRibbonShader,
    thumbnail: '',
    colors: ['#CC1A99', '#9933CC', '#6633FF', '#3366CC'],
    fragmentShader: `precision highp float;
      uniform vec2 resolution;
      uniform float time;
      void main(){
        vec2 uv=gl_FragCoord.xy/resolution.xy;
        vec2 p=(uv-0.5)*2.0;p.x*=resolution.x/resolution.y;
        vec3 col=vec3(0.0);
        for(float i=0.0;i<3.0;i++){
          float offset=(i-1.0)*0.4;
          float twist=sin(p.x*1.8+time*0.6+i)*0.6;
          float ribbonY=twist+offset;
          float dist=abs(p.y-ribbonY);
          float ribbon=smoothstep(0.25,0.05,dist);
          float depth=sin(p.x*2.5+time+i)*0.5+0.5;
          vec3 c1=vec3(1.0,0.1,0.7);
          vec3 c2=vec3(0.7,0.2,1.0);
          vec3 c3=vec3(0.4,0.3,0.9);
          vec3 c=mix(c1,c2,depth);
          c=mix(c,c3,smoothstep(0.3,0.7,sin(p.x*3.0)*0.5+0.5));
          float spec=pow(1.0-smoothstep(0.0,0.2,dist),3.0)*0.6;
          float edge=smoothstep(0.2,0.25,dist)*smoothstep(0.3,0.25,dist);
          col+=(c*ribbon+vec3(spec)+c*edge*0.4)*(1.0-i*0.15);
        }
        gl_FragColor=vec4(col,1.0);
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
    id: 'glass-twist',
    name: 'Glass Twist',
    description: 'Transparent cyan glass ribbons with refraction',
    component: GlassTwistShader,
    thumbnail: '',
    colors: ['#00CCCC', '#33DDDD', '#66EEFF', '#FFFFFF'],
    fragmentShader: `precision highp float;
      uniform vec2 resolution;
      uniform float time;
      void main(){
        vec2 uv=gl_FragCoord.xy/resolution.xy;
        vec2 p=(uv-0.5)*2.0;p.x*=resolution.x/resolution.y;
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

      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
          value += amplitude * smoothNoise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv * 3.0;
        
        float flow = fbm(p + vec2(time * 0.2, time * 0.1));
        flow += fbm(p * 2.0 - vec2(time * 0.15, time * 0.25)) * 0.5;
        
        vec3 col1 = vec3(0.32, 0.15, 1.0);
        vec3 col2 = vec3(1.0, 0.62, 0.99);
        vec3 col3 = vec3(0.69, 0.62, 0.94);
        
        vec3 color = mix(col1, col2, flow);
        color = mix(color, col3, flow * flow);
        
        float shimmer = pow(flow, 2.0) * 0.5;
        color += shimmer;
        
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
    colors: ['#000000', '#222222', '#444444', '#666666'],
    fragmentShader: `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      float random(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}
      vec4 sigmoid(vec4 x){return 1./(1.+exp(-x));}

      // Palette: Luminous, Bright, Electric (White/Cyan/Blue)
      vec3 palette(float t) {
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.0, 0.33, 0.67); // Bright Blue/Cyan phase
          return a + b * cos(6.28318 * (c * t + d));
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
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= resolution.x / resolution.y;
        
        // Subtle warp
        p += vec2(sin(p.y * 6.283 + time * 0.5), cos(p.x * 6.28 + time * 0.5)) * 0.02;

        // Core CPPN
        vec4 pattern = cppn_fn(p, 0.1*sin(0.3*time), 0.1*sin(0.4*time), 0.1*cos(0.3*time));
        
        // Map to BRIGHT cool color palette
        float t = pattern.x * 0.5 + pattern.y * 0.5 + time * 0.1;
        vec3 col = palette(t);
        
        // Force bright output (no darks)
        col = smoothstep(0.0, 0.9, col); // Crush blacks, keep brights
        col = pow(col, vec3(0.55));      // Gamma correct to BRIGHTEN 
        col += vec3(0.1, 0.2, 0.3);      // Add base glow
        
        // Strong Vignette
        vec2 vUV = gl_FragCoord.xy / resolution.xy;
        float vign = 1.0 - smoothstep(0.4, 2.0, length(vUV - 0.5) * 1.5);
        col *= vign;

        // Subtle Scanlines
        float scanline = sin(uv.y * resolution.y * 0.5 * 0.1) * 0.5 + 0.5;
        col *= 1.0 - scanline * 0.05; // hardcoded intensity

        // Mono Noise
        float noise = (random(uv + time) - 0.5) * 0.02; 
        col += noise * 0.3;
        
        // Ensure strictly black background by clipping very low values
        if (length(col) < 0.1) col = vec3(0.0);

        gl_FragColor = vec4(col, 1.0);
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
