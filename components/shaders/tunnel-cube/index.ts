import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'tunnel-cube',
    name: 'Tunnel Cube',
    slug: 'tunnel-cube',
    description: 'Immersive 3D tunnel cube animation with geometric depth and infinite corridor effect.',
    colors: ['#3a0ca3', '#4361ee', '#4cc9f0', '#7209b7', '#560bad'],
    type: 'video' as const,
    videoSrc: '/videos/tunnel-cube.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
