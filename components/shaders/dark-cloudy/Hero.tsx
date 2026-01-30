'use client';
import React from 'react';
import DarkCloudy from './DarkCloudy';

const Hero = () => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
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

export default Hero;
