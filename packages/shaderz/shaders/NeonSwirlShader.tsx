'use client';
import React, { useRef, useEffect } from 'react';

interface NeonSwirlShaderProps {
    src?: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * NeonSwirlShader - Vibrant neon colors swirling with hypnotic patterns
 */
const NeonSwirlShader: React.FC<NeonSwirlShaderProps> = ({
    src = '/videos/neon-swirl.mp4',
    className = '',
    style = {},
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
        <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`} style={style}>
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

export default NeonSwirlShader;
