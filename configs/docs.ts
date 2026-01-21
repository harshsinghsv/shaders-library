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
];

// Even if empty, declare its type explicitly
export const MainComponents: ComponentItem[] = [];
