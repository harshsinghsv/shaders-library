import Hero from '@/components/shaders/liquid-orange/Hero';
import Card from '@/components/shaders/liquid-orange/Card';

export const metadata = {
    id: 'liquid-orange',
    name: 'Liquid Orange Shader',
    slug: 'liquid-orange-shader',
    description: 'A flowing liquid WebGL shader with warm orange tones. Perfect for creating dynamic and mesmerizing background effects.',
    colors: ['#CC4500', '#FF6347', '#FF8C00', '#FFD700'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
