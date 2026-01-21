import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'dark-veil',
    name: 'Dark Veil Shader',
    slug: 'dark-veil-shader',
    description: 'Mysterious dark veil shader with smooth blue-purple-magenta gradients.',
    colors: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
