import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'cosmic-flow',
    name: 'Cosmic Flow',
    slug: 'cosmic-flow',
    description: 'Mesmerizing cosmic flow animation with abstract background patterns and fluid motion.',
    colors: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de'],
    type: 'video' as const,
    videoSrc: '/videos/cosmic-flow.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
