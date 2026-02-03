'use client';
import React, { useRef, useEffect } from 'react';

interface LiquidColorsShaderProps {
    src?: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * LiquidColorsShader - Vibrant liquid colors flowing with smooth transitions
 */
const LiquidColorsShader: React.FC<LiquidColorsShaderProps> = ({
    src = '/videos/liquid-colors.mp4',
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

export default LiquidColorsShader;
