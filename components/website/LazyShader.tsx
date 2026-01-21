'use client';
import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazyShaderProps {
    children: ReactNode;
    fallback?: ReactNode;
    rootMargin?: string;
    threshold?: number;
}

/**
 * LazyShader - Only renders shader when visible in viewport
 * Uses Intersection Observer for performance optimization
 */
export default function LazyShader({
    children,
    fallback,
    rootMargin = '100px',
    threshold = 0.1
}: LazyShaderProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    setHasLoaded(true);
                    // Once loaded, keep it rendered (don't unmount on scroll out)
                }
            },
            { rootMargin, threshold }
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, [rootMargin, threshold]);

    return (
        <div ref={containerRef} className="w-full h-full relative">
            {hasLoaded ? children : (fallback || <ShaderPlaceholder />)}
        </div>
    );
}

// Gradient placeholder shown while shader loads
function ShaderPlaceholder() {
    return (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 animate-pulse" />
    );
}
