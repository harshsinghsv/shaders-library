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

// Video backgrounds
const videos: VideoBackground[] = [
  {
    id: 'video-glossy-film',
    name: 'Glossy Film',
    description: 'Smooth glossy film with reflective surface',
    src: '/videos/glossy-film.mp4',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#e94560'],
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
      precision mediump float;
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
      precision mediump float;
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
    id: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Animated ocean with realistic wave motion and foam',
    component: OceanWavesShader,
    thumbnail: '',
    colors: ['#002B5C', '#0055A5', '#4A90E2', '#87CEEB'],
    fragmentShader: `
      precision mediump float;
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
      float hash(vec2 p){return fract(sin(dot(p,vec2(12.9,78.2)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/resolution.xy;
        vec2 p=uv*3.0;p.y-=time*0.8;
        float n=fbm(p)*fbm(p+vec2(time*0.5,0));
        float fire=n*pow(1.0-uv.y,2.0);
        vec3 col=vec3(0.1,0.0,0.0);
        col=mix(col,vec3(0.8,0.0,0.0),smoothstep(0.2,0.5,fire));
        col=mix(col,vec3(1.0,0.3,0.0),smoothstep(0.4,0.7,fire));
        col=mix(col,vec3(1.0,0.7,0.2),smoothstep(0.6,0.9,fire));
        col+=vec3(1.0,0.9,0.7)*pow(fire,3.0);
        gl_FragColor=vec4(col,1.0);
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
      precision mediump float;
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
              href='https://github.com/harsh-and-shubham/shaderz'
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
