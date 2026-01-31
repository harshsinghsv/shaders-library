import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'sci-fi-corridor',
    name: 'Sci-Fi Corridor',
    slug: 'sci-fi-corridor',
    description: '3D metal sci-fi corridor with rotating light blue animations and futuristic atmosphere.',
    colors: ['#00d4ff', '#0099cc', '#006699', '#003366'],
    type: 'video' as const,
    videoSrc: '/videos/sci-fi-corridor.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
