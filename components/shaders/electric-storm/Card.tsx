'use client';
import React from 'react';
import ElectricStorm from './Lightning';

const Card: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black pointer-events-none">
            <ElectricStorm
                hue={230}
                speed={0.8}
                intensity={1.2}
                branches={1}
                cloudDensity={0.5}
            />
        </div>
    );
};

export default Card;
