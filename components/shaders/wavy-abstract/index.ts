import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'wavy-abstract',
    name: 'Wavy Abstract',
    slug: 'wavy-abstract',
    description: 'Stylish 3D abstract animation with colorful wavy smooth concept and flowing motion.',
    colors: ['#a29bfe', '#6c5ce7', '#fd79a8', '#fdcb6e', '#00b894'],
    type: 'video' as const,
    videoSrc: '/videos/wavy-abstract.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
