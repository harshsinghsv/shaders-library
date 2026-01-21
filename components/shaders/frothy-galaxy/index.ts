import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'frothy-galaxy',
    name: 'Frothy Galaxy Shader',
    slug: 'frothy-galaxy-shader',
    description: 'Cosmic frothy galaxy with swirling patterns and ethereal colors.',
    colors: ['#4c1d95', '#7c3aed', '#a78bfa', '#ec4899'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
