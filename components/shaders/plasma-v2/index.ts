import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'plasma-v2',
    name: 'Plasma V2 Shader',
    slug: 'plasma-v2-shader',
    description: 'Enhanced plasma shader with improved fluid dynamics and rich deep colors.',
    colors: ['#7c3aed', '#c026d3', '#ec4899', '#f43f5e'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
