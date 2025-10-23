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
//     href: '/components/ocean-waves-shader',
//     name: 'Ocean Waves Shader',
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
];

// Even if empty, declare its type explicitly 👇
export const MainComponents: ComponentItem[] = [];
