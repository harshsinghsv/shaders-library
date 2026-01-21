import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'glossy-film',
    name: 'Glossy Film',
    slug: 'glossy-film',
    description: 'Smooth glossy film video background with reflective surface and iridescent animations.',
    colors: ['#ff6b6b', '#ee5a6f', '#c44569', '#786fa6'],
    type: 'video' as const,
    videoSrc: '/videos/glossy-film.mp4',
};

export { Hero, Card };
export default { Hero, Card, metadata };
