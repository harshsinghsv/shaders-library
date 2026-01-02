// export const SpecialComponents = [
//   { 
//     href: '/components/liquid-orange-shader', 
//     name: 'Liquid Orange Shader',
//     new: true 
//   },
//   {
//     href: '/components/plasma-shader',
//     name: 'Plasma Shader',
//     new: true,
//   },
//   {
//     href: '/components/aurora-borealis-shader',
//     name: 'Aurora Borealis Shader',
//     new: true,
//   },
// ];

// export const MainComponents = [
//   // Shaders are now in SpecialComponents
//   // This can be used for future component categories
// ];

// Define a shared interface for consistency
export interface ComponentItem {
  href: string;
  name: string;
  new?: boolean;
  component?: string; // optional for future grouping logic
}

// Typed array for special shaders
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
    href: '/components/glossy-ribbon-shader',
    name: 'Glossy Ribbon Shader',
    new: true,
  },
  {
    href: '/components/silk-flow-shader',
    name: 'Silk Flow Shader',
    new: true,
  },
  {
    href: '/components/glass-twist-shader',
    name: 'Glass Twist Shader',
    new: true,
  },
];

// Even if empty, declare its type explicitly 👇
export const MainComponents: ComponentItem[] = [];
