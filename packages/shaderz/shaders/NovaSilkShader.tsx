'use client';
import React, { useRef, useEffect } from 'react';

interface NovaSilkShaderProps {
    src?: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * NovaSilkShader - Silky smooth nova with flowing gradients and premium feel
 */
const NovaSilkShader: React.FC<NovaSilkShaderProps> = ({
    src = '/videos/nova-silk.mp4',
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

export default NovaSilkShader;
