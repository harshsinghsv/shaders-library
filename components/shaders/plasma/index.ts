import Hero from './Hero';
import Card from './Card';

export const metadata = {
    id: 'plasma',
    name: 'Plasma Shader',
    slug: 'plasma-shader',
    description: 'A vibrant plasma effect shader with flowing colors and organic motion.',
    colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
    type: 'shader' as const,
};

export { Hero, Card };
export default { Hero, Card, metadata };
