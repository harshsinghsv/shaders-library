import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'silk-flow',
    name: 'Silk Flow Shader',
    slug: 'silk-flow-shader',
    description: 'Smooth silk-like flowing shader with vertical ribbons and blue-magenta gradients.',
    colors: ['#fbbf24', '#f97316', '#ef4444', '#dc2626'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
