import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'nova-silk',
    name: 'Nova Silk',
    slug: 'nova-silk',
    description: 'Silky smooth nova video background with flowing gradients and premium feel.',
    colors: ['#f43f5e', '#ec4899', '#d946ef', '#8b5cf6'],
    type: 'video' as const,
    videoSrc: '/videos/nova-silk.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
