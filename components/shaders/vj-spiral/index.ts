import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'vj-spiral',
    name: 'VJ Spiral',
    slug: 'vj-spiral',
    description: 'Dynamic VJ spiral background with hypnotic rotating patterns perfect for visual performances.',
    colors: ['#ff0a54', '#ff477e', '#ff7096', '#ff85a1', '#fbb1bd'],
    type: 'video' as const,
    videoSrc: '/videos/vj-spiral.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
