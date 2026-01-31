import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'electric-storm',
    name: 'Electric Storm',
    slug: 'electric-storm',
    description: 'Dramatic electric lightning with multi-branch effects, dynamic glow, and realistic storm atmosphere.',
    colors: ['#a855f7', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
