'use client';
import { useState } from 'react';
import Header from '@/components/website/header';
import HeroSection from '@/components/website/hero-sec';
import ShaderGallery from '@/components/website/ShaderGallery';
import { SHADERS } from '@/components/shaders';

export default function Home() {
    const [activeShader, setActiveShader] = useState(SHADERS[0]?.metadata.id || 'liquid-orange');

    return (
        <>
            <Header />
            <main className='relative'>
                <HeroSection activeShader={activeShader} />
                <ShaderGallery
                    shaders={SHADERS}
                    activeShader={activeShader}
                    onShaderChange={setActiveShader}
                />
            </main>
        </>
    );
}
