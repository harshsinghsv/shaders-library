'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import * as AspectRatio from '@radix-ui/react-aspect-ratio';
import LiquidOrangeShader from '@/components/website/LiquidOrangeShader';
import PlasmaShader from '@/components/website/PlasmaShader';
import AuroraShader from '@/components/website/AuroraShader';

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
    id: 'aurora-borealis',
    name: 'Aurora Borealis Shader',
    url: '/components/aurora-borealis-shader',
    description: 'Volumetric aurora with realistic atmospheric effects',
    component: AuroraShader,
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
          apps. Interactive. Customizable. Open Source.
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
