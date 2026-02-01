import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'neon-swirl',
    name: 'Neon Swirl',
    slug: 'neon-swirl',
    description: 'Hypnotic neon swirl animation with glowing abstract art and smooth 3D rendering.',
    colors: ['#00f5d4', '#00bbf9', '#9b5de5', '#f15bb5', '#fee440'],
    type: 'video' as const,
    videoSrc: '/videos/neon-swirl.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
