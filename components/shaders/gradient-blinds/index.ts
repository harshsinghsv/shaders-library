import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'gradient-blinds',
    name: 'Gradient Blinds',
    slug: 'gradient-blinds',
    description: 'Interactive gradient with venetian blind effect and spotlight following cursor.',
    colors: ['#FF9FFC', '#5227FF'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
