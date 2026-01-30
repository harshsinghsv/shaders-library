'use client';
import React from 'react';
import DarkCloudy from './DarkCloudy';

const Card = () => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
            <DarkCloudy
                speed={0.7}
                scale={1.5}
                color="#0a192f"
                noiseIntensity={0.2}
                rotation={-0.5}
            />
        </div>
    );
};

export default Card;
