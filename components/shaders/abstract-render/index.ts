import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'abstract-render',
    name: 'Abstract Render',
    slug: 'abstract-render',
    description: 'Stunning 3D abstract art render with dynamic shapes and vibrant color transitions.',
    colors: ['#ff4d6d', '#c9184a', '#590d22', '#800f2f', '#a4133c'],
    type: 'video' as const,
    videoSrc: '/videos/abstract-render.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
