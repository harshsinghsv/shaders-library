'use client';
import React from 'react';
import GradientBlinds from './GradientBlinds';

const Hero = () => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
            <GradientBlinds
                gradientColors={['#FF9FFC', '#5227FF']}
                angle={0}
                noise={0.05}
                blindCount={16}
                spotlightRadius={0.5}
                spotlightSoftness={1}
                spotlightOpacity={1}
                mirrorGradient={false}
                distortAmount={0}
                shineDirection="left"
                mixBlendMode="lighten"
            />
        </div>
    );
};

export default Hero;
