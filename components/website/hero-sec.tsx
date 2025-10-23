'use client';
import { Button } from '@/components/website/ui/button';
import LiquidOrangeShader from './LiquidOrangeShader';
import PlasmaShader from './PlasmaShader';
import WaveShader from './WaveShader';

const shaderComponents = {
  'liquid-orange': LiquidOrangeShader,
  'plasma': PlasmaShader,
  'ocean-waves': WaveShader,
};

interface HeroSecProps {
  activeShader: string;
}

function HeroSec({ activeShader }: HeroSecProps) {
  const ShaderComponent = shaderComponents[activeShader as keyof typeof shaderComponents] || LiquidOrangeShader;

  return (
    <section className="relative min-h-screen h-screen flex flex-col items-center justify-between px-6 pt-24 pb-20 overflow-hidden font-sans">
      {/* Dynamic Shader Background */}
      <div className="absolute inset-0 z-[-30]">
        <ShaderComponent />
      </div>

      {/* Decorative shapes and stars */}
      <img 
        src="/landing-page-assets/star-small-new.svg" 
        alt="" 
        className="absolute top-[30%] right-[30%] w-12 h-12 md:w-16 md:h-16 z-[30] animate-float opacity-100" 
        style={{ animationDelay: '0s', animationDuration: '8s' }}
      />
      
      <img 
        src="/landing-page-assets/star-large-new.svg" 
        alt="" 
        className="hidden" 
        style={{ animationDelay: '2s', animationDuration: '10s' }}
      />

      <img 
        src="/landing-page-assets/MaskStar.svg" 
        alt="" 
        className="absolute top-[20%] left-[25%] w-12 h-12 md:w-16 md:h-16 z-[30] animate-float opacity-100" 
        style={{ animationDelay: '2s', animationDuration: '10s' }}
      />

      {/* Content container */}
      <div className="flex flex-col items-center justify-center flex-1 relative z-[30]">
        {/* Announcement badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-[#20140E] backdrop-blur-sm">
          <img src="/landing-page-assets/sparkle-filled.svg" alt="Savio" className="w-5 h-5" />
          <span className="text-sm text-white">We are launching soon. Stay Tuned</span>
        </div>

        {/* Main heading */}
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl text-foreground leading-tight mb-5">
            Illuminate Your Website with
            <br />
            Dynamic <span className="italic font-instrumental text-foreground">Shaders</span>
          </h1>
          
          <p className="text-base md:text-lg text-white max-w-2xl mx-auto mb-8">
            Plug-and-play shader components that animate your Hero Section without you having to write extra code.
            <br />
            <span className="text-sm opacity-75">Click the shader previews below to change the background!</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="shadow-[inset_0_-4px_6px_rgba(255,255,255,0.5)] rounded-full px-8 bg-primary hover:bg-primary/90 text-white" asChild>
              <a href="/components">Browse Shaders</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Star above dashboard */}
      <img 
        src="/landing-page-assets/star-large-new.svg" 
        alt=""
        className="relative -right-[35%] top-[10%] z-[25] mb-6 w-16 h-16 md:w-28 md:h-28 animate-float opacity-100"
        style={{ animationDelay: '1s', animationDuration: '9s' }}
      />



      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default HeroSec;
