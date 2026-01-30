'use client';
import React from 'react';
import FloatingLines from './FloatingLines';

const Card = () => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden pointer-events-none">
            <FloatingLines
                animationSpeed={1.5}
                lineCount={[8, 12, 6]}
                lineDistance={[3, 4, 3]}
                linesGradient={['#ec4899', '#8b5cf6', '#3b82f6']}
                interactive={false}
            />
        </div>
    );
};

export default Card;
