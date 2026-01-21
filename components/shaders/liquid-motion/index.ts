import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'liquid-motion',
    name: 'Liquid Motion Shader',
    slug: 'liquid-motion-shader',
    description: 'Fluid simulation with dynamic motion and interaction, featuring realistic liquid physics.',
    colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
