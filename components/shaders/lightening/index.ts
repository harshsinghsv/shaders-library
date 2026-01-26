import Hero from '@/components/shaders/lightening/Hero';
import Card from '@/components/shaders/lightening/Card';

export const metadata = {
    id: 'light-pillar',
    name: 'Light Pillar',
    slug: 'light-pillar',
    description: 'An interactive 3D light pillar visualization with flowing gradients, energy pulses, and particle effects.',
    colors: ['#00FFFF', '#FF00FF', '#FFFF00'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
