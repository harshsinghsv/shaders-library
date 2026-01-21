import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula Shader',
    slug: 'cosmic-nebula-shader',
    description: 'Swirling space nebula with twinkling stars and deep cosmic colors.',
    colors: ['#260A3E', '#CC1A99', '#FF4DB8', '#337ACC'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
