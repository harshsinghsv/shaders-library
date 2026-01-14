'use client';

import React from 'react';

export default function GlossyFilm() {
    return (
        <div className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            >
                <source src="/videos/glossy-film.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
