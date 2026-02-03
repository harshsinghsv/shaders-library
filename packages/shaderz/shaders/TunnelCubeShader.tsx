'use client';
import React, { useRef, useEffect } from 'react';

interface TunnelCubeShaderProps {
    src?: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * TunnelCubeShader - Hypnotic tunnel made of cubes with infinite depth
 */
const TunnelCubeShader: React.FC<TunnelCubeShaderProps> = ({
    src = '/videos/tunnel-cube.mp4',
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

export default TunnelCubeShader;
