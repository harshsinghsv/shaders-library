import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'gradient-waves',
    name: 'Gradient Waves Shader',
    slug: 'gradient-waves-shader',
    description: 'Flowing gradient waves with smooth transitions and ribbon-like patterns.',
    colors: ['#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
