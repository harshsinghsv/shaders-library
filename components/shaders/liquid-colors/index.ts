import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'liquid-colors',
    name: 'Liquid Colors',
    slug: 'liquid-colors',
    description: 'Multicolor liquid pattern with trendy colorful fluid abstraction and dynamic color mixing.',
    colors: ['#ff6b9d', '#c44569', '#feca57', '#48dbfb', '#0abde3'],
    type: 'video' as const,
    videoSrc: '/videos/liquid-colors.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
