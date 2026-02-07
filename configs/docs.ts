// Define a shared interface for consistency
export interface ComponentItem {
  href: string;
  name: string;
  new?: boolean;
  component?: string; // optional for future grouping logic
}

// Typed array for special shaders - ordered as per reference
export const SpecialComponents: ComponentItem[] = [
  {
    href: '/components/liquid-orange-shader',
    name: 'Liquid Orange Shader',
    new: true
  },
  {
    href: '/components/plasma-shader',
    name: 'Plasma Shader',
    new: true,
  },
  {
    href: '/components/ocean-waves-shader',
    name: 'Ocean Waves Shader',
    new: true,
  },
  {
    href: '/components/neon-fluid-shader',
    name: 'Neon Fluid Shader',
    new: true,
  },
  {
    href: '/components/gradient-waves-shader',
    name: 'Gradient Waves Shader',
    new: true,
  },
  {
    href: '/components/cosmic-nebula-shader',
    name: 'Cosmic Nebula Shader',
    new: true,
  },
  {
    href: '/components/silk-flow-shader',
    name: 'Silk Flow Shader',
    new: true,
  },
  {
    href: '/components/plasma-v2-shader',
    name: 'Plasma V2 Shader',
    new: true,
  },
  {
    href: '/components/liquid-motion-shader',
    name: 'Liquid Motion Shader',
    new: true,
  },
  {
    href: '/components/dark-veil-shader',
    name: 'Dark Veil Shader',
    new: true,
  },
  {
    href: '/components/frothy-galaxy-shader',
    name: 'Frothy Galaxy Shader',
    new: true,
  },
  {
    href: '/components/glossy-film',
    name: 'Glossy Film',
    new: true,
  },
  {
    href: '/components/nova-silk',
    name: 'Nova Silk',
    new: true,
  },
  // New WebGL Shaders
  {
    href: '/components/dark-cloudy-shader',
    name: 'Dark Cloudy Shader',
    new: true,
  },
  {
    href: '/components/electric-storm-shader',
    name: 'Electric Storm Shader',
    new: true,
  },
  {
    href: '/components/floating-lines-shader',
    name: 'Floating Lines Shader',
    new: true,
  },
  {
    href: '/components/gradient-blinds-shader',
    name: 'Gradient Blinds Shader',
    new: true,
  },
  {
    href: '/components/lightening-shader',
    name: 'Lightening Shader',
    new: true,
  },
  // Video Shaders (individual pages)
  {
    href: '/components/abstract-render-shader',
    name: 'Abstract Render',
    new: true,
  },
  {
    href: '/components/cosmic-flow-shader',
    name: 'Cosmic Flow',
    new: true,
  },
  {
    href: '/components/liquid-colors-shader',
    name: 'Liquid Colors',
    new: true,
  },
  {
    href: '/components/neon-swirl-shader',
    name: 'Neon Swirl',
    new: true,
  },
  {
    href: '/components/sci-fi-corridor-shader',
    name: 'Sci-Fi Corridor',
    new: true,
  },
  {
    href: '/components/tunnel-cube-shader',
    name: 'Tunnel Cube',
    new: true,
  },
  {
    href: '/components/vj-spiral-shader',
    name: 'VJ Spiral',
    new: true,
  },
  {
    href: '/components/wavy-abstract-shader',
    name: 'Wavy Abstract',
    new: true,
  },
  // Video Backgrounds Overview Page
  {
    href: '/components/video-backgrounds',
    name: 'Video Backgrounds (All)',
    new: true,
  },
];

// Even if empty, declare its type explicitly
export const MainComponents: ComponentItem[] = [];
