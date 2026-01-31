'use client';
import React from 'react';
import ElectricStorm from './Lightning';

const Hero: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
            <ElectricStorm
                hue={260}
                speed={1.0}
                intensity={1.5}
                branches={3}
                cloudDensity={0.6}
            />
        </div>
    );
};

export default Hero;
