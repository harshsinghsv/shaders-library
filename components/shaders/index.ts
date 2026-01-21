// Central Shader Registry
// This file auto-exports all shaders from their respective folders

import liquidOrange from '@/components/shaders/liquid-orange';
import plasma from '@/components/shaders/plasma';
import oceanWaves from '@/components/shaders/ocean-waves';
import neonFluid from '@/components/shaders/neon-fluid';
import gradientWaves from '@/components/shaders/gradient-waves';
import cosmicNebula from '@/components/shaders/cosmic-nebula';
import silkFlow from '@/components/shaders/silk-flow';
import plasmaV2 from '@/components/shaders/plasma-v2';
import liquidMotion from '@/components/shaders/liquid-motion';
import darkVeil from '@/components/shaders/dark-veil';
import frothyGalaxy from '@/components/shaders/frothy-galaxy';
import glossyFilm from '@/components/shaders/glossy-film';
import novaSilk from '@/components/shaders/nova-silk';

// Type definitions
export interface ShaderMetadata {
    id: string;
    name: string;
    slug: string;
    description: string;
    colors: string[];
    type: 'shader' | 'video';
    videoSrc?: string;
}

export interface ShaderModule {
    Hero: React.ComponentType;
    Card: React.ComponentType;
    metadata: ShaderMetadata;
}

// All shaders in the registry - ordered as per reference
export const SHADERS: ShaderModule[] = [
    liquidOrange,
    plasma,
    oceanWaves,
    neonFluid,
    gradientWaves,
    cosmicNebula,
    silkFlow,
    plasmaV2,
    liquidMotion,
    darkVeil,
    frothyGalaxy,
    glossyFilm,
    novaSilk,
];

// Helper functions
export function getShaderById(id: string): ShaderModule | undefined {
    return SHADERS.find(s => s.metadata.id === id);
}

export function getShaderBySlug(slug: string): ShaderModule | undefined {
    return SHADERS.find(s => s.metadata.slug === slug);
}

export function getVideoShaders(): ShaderModule[] {
    return SHADERS.filter(s => s.metadata.type === 'video');
}

export function getWebGLShaders(): ShaderModule[] {
    return SHADERS.filter(s => s.metadata.type === 'shader');
}

// Export individual shaders for direct imports
export {
    liquidOrange,
    plasma,
    oceanWaves,
    neonFluid,
    gradientWaves,
    cosmicNebula,
    silkFlow,
    plasmaV2,
    liquidMotion,
    darkVeil,
    frothyGalaxy,
    glossyFilm,
    novaSilk,
};
