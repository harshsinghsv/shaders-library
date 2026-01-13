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
import SilkFlowShader from '@/components/website/SilkFlowShader';
import Plasmav2Shader from '@/components/website/Plasmav2';
import LiquidMotionShader from '@/components/website/LiquidMotionShader';
import Wavy from '@/components/website/Wavy';
import FrothyGalaxyShader from '@/components/website/FrothyGalaxyShader';

const shaderComponents = [
  {
    id: 'liquid-orange',
    name: 'Liquid Orange Shader',
    url: '/components/liquid-orange-shader',
    description: 'Flowing liquid with warm orange tones',
    component: LiquidOrangeShader,
    isNew: true,
  },
  {
    id: 'plasma',
    name: 'Plasma Shader',
    url: '/components/plasma-shader',
    description: 'Electric plasma with purple-pink colors',
    component: PlasmaShader,
    isNew: true,
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves Shader',
    url: '/components/ocean-waves-shader',
    description: 'Animated ocean with realistic wave motion and foam',
    component: OceanWavesShader,
    isNew: true,
  },
  {
    id: 'neon-fluid',
    name: 'Neon Fluid Shader',
    url: '/components/neon-fluid-shader',
    description: 'Flowing fire with realistic flame motion',
    component: NeonFluidShader,
    isNew: true,
  },
  {
    id: 'gradient-waves',
    name: 'Gradient Waves Shader',
    url: '/components/gradient-waves-shader',
    description: 'Sleek minimalist waves with smooth gradients',
    component: GradientWavesShader,
    isNew: true,
  },
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula Shader',
    url: '/components/cosmic-nebula-shader',
    description: 'Swirling space nebula with twinkling stars',
    component: CosmicNebulaShader,
    isNew: true,
  },
  {
    id: 'silk-flow',
    name: 'Silk Flow Shader',
    url: '/components/silk-flow-shader',
    description: 'Vertical flowing silk ribbons in blue and magenta',
    component: SilkFlowShader,
    isNew: true,
  },
  {
    id: 'plasma-v2',
    name: 'Plasma V2 Shader',
    url: '/components/plasma-v2-shader',
    description: 'Enhanced plasma effect with vivid neon colors and fluid motion',
    component: Plasmav2Shader,
    isNew: true,
  },
  {
    id: 'liquid-motion',
    name: 'Liquid Motion Shader',
    url: '/components/liquid-motion-shader',
    description: 'Interactive fluid simulation with vibrant flowing colors',
    component: LiquidMotionShader,
    isNew: true,
  },
  {
    id: 'dark-veil',
    name: 'Dark Veil Shader',
    url: '/components/dark-veil-shader',
    description: 'Mysterious dark veil with smooth blue-purple-magenta gradients',
    component: Wavy,
    isNew: true,
  },
  {
    id: 'frothy-galaxy',
    name: 'Frothy Galaxy Shader',
    url: '/components/frothy-galaxy-shader',
    description: 'Smooth flowing waves with beautiful blue gradients and shimmer',
    component: FrothyGalaxyShader,
    isNew: true,
  },
  {
    id: 'video-glossy-film',
    name: 'Glossy Film',
    url: '/components/glossy-film',
    description: 'Smooth glossy film with reflective surface',
    videoSrc: '/videos/glossy-film.mp4',
    isVideo: true,
    isNew: true,
  },
  {
    id: 'video-nova-silk',
    name: 'Nova Silk',
    url: '/components/nova-silk',
    description: 'Elegant flowing silk with nova-inspired colors',
    videoSrc: '/videos/nova-silk.mp4',
    isVideo: true,
    isNew: true,
  },
];

export default function Home() {
  return (
    <div className='min-h-screen bg-black pt-20 pb-10 px-4'>
      {/* Header Section */}
      <div className='mb-10'>
        <h1 className='text-4xl md:text-5xl font-bold text-white mb-4'>
          Shaders
        </h1>
        <p className='text-lg text-neutral-400 max-w-2xl'>
          Beautiful WebGL shaders that you can copy and paste into your apps.
          Interactive, customizable, and open source.
        </p>
      </div>

      {/* Components Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'>
        {shaderComponents.map((shader, index) => {
          return (
            <motion.div
              key={shader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Link
                href={shader?.url}
                className='group block'
              >
                {/* Card Container */}
                <div className='relative rounded-xl overflow-hidden bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 transition-all duration-300'>
                  {/* Shader/Video Preview */}
                  <AspectRatio.Root ratio={16 / 10}>
                    <div className="relative w-full h-full bg-black">
                      {shader.isVideo ? (
                        <video
                          src={shader.videoSrc}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : shader.component ? (
                        <shader.component />
                      ) : null}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </div>
                  </AspectRatio.Root>

                  {/* Card Content */}
                  <div className='p-4 bg-neutral-900/80'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h2 className='text-lg font-semibold text-white group-hover:text-orange-400 transition-colors'>
                        {shader.name}
                      </h2>
                      {shader.isNew && (
                        <span className='px-2 py-0.5 text-xs font-medium bg-orange-500/20 text-orange-400 rounded-full'>
                          New
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-neutral-500 line-clamp-2'>
                      {shader.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
