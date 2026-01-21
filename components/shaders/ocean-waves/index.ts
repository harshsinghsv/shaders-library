import Hero from '@/components/shaders/ocean-waves/Hero';
import Card from '@/components/shaders/ocean-waves/Card';

export const metadata = {
    id: 'ocean-waves',
    name: 'Ocean Waves Shader',
    slug: 'ocean-waves-shader',
    description: 'An animated ocean with realistic wave motion and foam effects.',
    colors: ['#002B5C', '#0055A5', '#4A90E2', '#87CEEB'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
