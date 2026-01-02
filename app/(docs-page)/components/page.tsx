'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import LiquidOrangeShader from '@/components/website/LiquidOrangeShader';
import PlasmaShader from '@/components/website/PlasmaShader';
import OceanWavesShader from '@/components/website/OceanWavesShader';
import NeonFluidShader from '@/components/website/NeonFluidShader';
import GradientWavesShader from '@/components/website/GradientWavesShader';
import CosmicNebulaShader from '@/components/website/CosmicNebulaShader';
import GlossyRibbonShader from '@/components/website/GlossyRibbonShader';
import SilkFlowShader from '@/components/website/SilkFlowShader';
import GlassTwistShader from '@/components/website/GlassTwistShader';
import GlossyFilm from '@/components/website/GlossyFilm';

const shaderComponents = [
  {
    id: 'liquid-orange',
    name: 'Liquid Orange Shader',
    url: '/components/liquid-orange-shader',
    description: 'Flowing liquid with warm orange tones',
    component: LiquidOrangeShader,
  },
  {
    id: 'plasma',
    name: 'Plasma Shader',
    url: '/components/plasma-shader',
    description: 'Electric plasma with purple-pink colors',
    component: PlasmaShader,
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves Shader',
    url: '/components/ocean-waves-shader',
    description: 'Animated ocean with realistic wave motion and foam',
    component: OceanWavesShader,
  },
  {
    id: 'neon-fluid',
    name: 'Neon Fluid Shader',
    url: '/components/neon-fluid-shader',
    description: 'Flowing fire with realistic flame motion',
    component: NeonFluidShader,
  },
  {
    id: 'gradient-waves',
    name: 'Gradient Waves Shader',
    url: '/components/gradient-waves-shader',
    description: 'Sleek minimalist waves with smooth gradients',
    component: GradientWavesShader,
  },
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula Shader',
    url: '/components/cosmic-nebula-shader',
    description: 'Swirling space nebula with twinkling stars',
    component: CosmicNebulaShader,
  },
  {
    id: 'glossy-ribbon',
    name: 'Glossy Ribbon Shader',
    url: '/components/glossy-ribbon-shader',
    description: '3D twisted ribbons with glossy magenta and purple',
    component: GlossyRibbonShader,
  },
  {
    id: 'silk-flow',
    name: 'Silk Flow Shader',
    url: '/components/silk-flow-shader',
    description: 'Vertical flowing silk ribbons in blue and magenta',
    component: SilkFlowShader,
  },
  {
    id: 'glass-twist',
    name: 'Glass Twist Shader',
    url: '/components/glass-twist-shader',
    description: 'Transparent cyan glass ribbons with refraction',
    component: GlassTwistShader,
  },
  {
    id: 'glossy-film',
    name: 'Glossy Film',
    url: '/components/glossy-film',
    description: 'Video-based glossy film effect with iridescent animations',
    component: GlossyFilm,
    isVideo: true,
  },
];

export default function Home() {
  return (
    <>
      <div className='pt-20 pb-5'>
        <h1
          className={'sm:text-3xl text-2xl font-semibold tracking-tight pb-1'}
        >
          Shaders
        </h1>

        <p className='md:text-lg text-sm text-muted-foreground lg:w-[80%]'>
          Beautiful WebGL shaders that you can copy and paste into your
          apps. Interactive. Customizable. Open Sourced.
        </p>
        <>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 grid-cols-1 gap-6 py-4'>
            {shaderComponents.map((shader, index) => {
              const ShaderComponent = shader.component;
              return (
                <Link
                  key={shader.id}
                  href={shader?.url}
                  className='group border p-2 transition-all rounded-lg hover:shadow-lg hover:scale-105'
                >
                  <AspectRatio.Root ratio={16 / 9}>
                    <div className="relative w-full h-full rounded-md overflow-hidden bg-black">
                      <ShaderComponent />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  </AspectRatio.Root>
                  <div className='sm:py-2 py-1 sm:px-4 px-2'>
                    <h1 className='2xl:text-xl xl:text-xl md:text-lg text-sm font-medium leading-[140%]'>
                      {shader.name}
                    </h1>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {shader.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      </div>
    </>
  );
}
