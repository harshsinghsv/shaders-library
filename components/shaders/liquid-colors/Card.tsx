'use client';
import React, { useRef, useEffect } from 'react';

interface LiquidColorsProps {
    src?: string;
    className?: string;
}

const LiquidColors: React.FC<LiquidColorsProps> = ({
    src = '/videos/liquid-colors.mp4',
    className = ''
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.play().catch((error) => {
                console.log('Autoplay prevented:', error);
            });
        }
    }, [src]);

    return (
        <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default LiquidColors;
