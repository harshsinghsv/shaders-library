'use client';
import React from 'react';
import FloatingLines from './FloatingLines';

const Hero = () => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
            <FloatingLines
                animationSpeed={1.5}
                lineCount={[4, 5, 4]}
                lineDistance={[3, 4, 3]}
                linesGradient={['#ec4899', '#8b5cf6', '#3b82f6']}
                interactive={true}
            />
        </div>
    );
};

export default Hero;
