import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'dark-cloudy',
    name: 'Dark Cloudy',
    slug: 'dark-cloudy',
    description: 'Atmospheric dark cloudy shader with deep flowing currents and storm-like energy.',
    colors: ['#0A192F', '#1E3A5F', '#2D5A7B'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
