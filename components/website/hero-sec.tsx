'use client';

import Link from "next/link";
import { Button } from '@/components/website/ui/button';
import LiquidOrangeShader from './LiquidOrangeShader';
import PlasmaShader from './PlasmaShader';
import OceanWavesShader from './OceanWavesShader';
import NeonFluidShader from './NeonFluidShader';
import GradientWavesShader from './GradientWavesShader';
import CosmicNebulaShader from './CosmicNebulaShader';
import GlossyRibbonShader from './GlossyRibbonShader';
import SilkFlowShader from './SilkFlowShader';
import GlassTwistShader from './GlassTwistShader';
import VideoBackground from './VideoBackground';

const shaderComponents = {
  'liquid-orange': LiquidOrangeShader,
  'plasma': PlasmaShader,
  'ocean-waves': OceanWavesShader,
  'neon-fluid': NeonFluidShader,
  'gradient-waves': GradientWavesShader,
  'cosmic-nebula': CosmicNebulaShader,
  'glossy-ribbon': GlossyRibbonShader,
  'silk-flow': SilkFlowShader,
  'glass-twist': GlassTwistShader,
};

// Videos are identified by having a 'video-' prefix
const videoSources: Record<string, string> = {
  'video-glossy-film': '/videos/glossy-film.mp4',
};

interface HeroSecProps {
  activeShader: string;
}

function HeroSec({ activeShader }: HeroSecProps) {
  const isVideo = activeShader.startsWith('video-');
  const ShaderComponent = shaderComponents[activeShader as keyof typeof shaderComponents] || LiquidOrangeShader;
  const videoSrc = videoSources[activeShader];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between px-6 pt-32 pb-20 overflow-hidden font-sans">
      {/* Dynamic Background - Shader or Video */}
      <div className="absolute inset-0 z-[-30] bg-black">
        <div
          className="absolute inset-0"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, black 75%, rgba(0,0,0,0.95) 80%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0.3) 95%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, rgba(0,0,0,0.95) 80%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0.3) 95%, transparent 100%)'
          }}
        >
          {isVideo && videoSrc ? (
            <VideoBackground key={videoSrc} src={videoSrc} />
          ) : (
            <ShaderComponent />
          )}
        </div>
      </div>


      {/* Content container */}
      <div className="flex flex-col items-center justify-center flex-1 relative z-[30]">
        {/* Main heading */}
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl text-white md:text-7xl font-bold tracking-tighter text-white leading-[1.1] mb-6">
            Illuminate Your Website with
            <br />
            Dynamic <span className="italic font-instrumental text-white/90">Shaders</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 font-light tracking-wide max-w-2xl mx-auto mb-8">
            Plug-and-play shader components that animate your Hero Section without you having to write extra code.
            <br />
            <span className="text-white font-normal">Click the shader previews below to change the background!</span>
          </p>
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="h-14 px-10 text-xl rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:bg-white/20 text-white transition-all duration-300 hover:scale-105" asChild>
              <Link href="/components">Browse Shaders</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSec;
