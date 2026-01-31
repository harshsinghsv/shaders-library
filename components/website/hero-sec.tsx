'use client';

import Link from "next/link";
import { Button } from '@/components/website/ui/button';
import { getShaderById } from '@/components/shaders';

interface HeroSecProps {
  activeShader: string;
}

function HeroSec({ activeShader }: HeroSecProps) {
  const shader = getShaderById(activeShader);
  const HeroComponent = shader?.Hero;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-between px-6 pt-32 pb-20 overflow-hidden font-sans">
      {/* Dynamic Background - Shader or Video */}
      <div className="absolute inset-0 z-0 bg-black pointer-events-auto">
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, black 75%, rgba(0,0,0,0.95) 80%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0.3) 95%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 75%, rgba(0,0,0,0.95) 80%, rgba(0,0,0,0.85) 85%, rgba(0,0,0,0.6) 90%, rgba(0,0,0,0.3) 95%, transparent 100%)'
          }}
        >
          {HeroComponent && <HeroComponent />}
        </div>
      </div>

      {/* Content container */}
      <div className="flex flex-col items-center justify-center flex-1 relative z-[30] pointer-events-none">
        {/* Main heading */}
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-5xl text-white md:text-7xl font-normal tracking-tighter leading-[1.1] mb-6"
            style={{ fontFamily: "'Inter', var(--font-inter), sans-serif" }}
          >
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
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
