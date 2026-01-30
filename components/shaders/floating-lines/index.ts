import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'floating-lines',
    name: 'Floating Lines',
    slug: 'floating-lines',
    description: 'Bending rays of light that follow the cursor and create a futuristic atmosphere.',
    colors: ['#ec4899', '#8b5cf6', '#3b82f6'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
