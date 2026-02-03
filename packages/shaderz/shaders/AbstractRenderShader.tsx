'use client';
import React, { useRef, useEffect } from 'react';

interface AbstractRenderShaderProps {
    src?: string;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * AbstractRenderShader - Stunning 3D abstract art render with dynamic shapes and vibrant color transitions
 * 
 * @example
 * ```tsx
 * import { AbstractRenderShader } from 'shaderz';
 * 
 * export default function Hero() {
 *   return (
 *     <div className="relative h-screen">
 *       <AbstractRenderShader 
 *         src="/videos/abstract-render.mp4"
 *         className="opacity-80"
 *       />
 *       <div className="relative z-10">
 *         <h1>Your Content Here</h1>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
const AbstractRenderShader: React.FC<AbstractRenderShaderProps> = ({
    src = '/videos/abstract-render.mp4',
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

export default AbstractRenderShader;
