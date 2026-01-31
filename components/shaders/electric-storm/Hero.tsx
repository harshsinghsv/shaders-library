'use client';
import React from 'react';
import ElectricStorm from './Lightning';

const Hero: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <ElectricStorm
                hue={270}
                speed={1.0}
                intensity={1.8}
                branches={4}
                glow={1.5}
            />
        </div>
    );
};

export default Hero;
