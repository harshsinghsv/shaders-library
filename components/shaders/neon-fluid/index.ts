import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'neon-fluid',
    name: 'Neon Fluid Shader',
    slug: 'neon-fluid-shader',
    description: 'Vibrant neon fluid shader with flowing colors and dynamic motion.',
    colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
