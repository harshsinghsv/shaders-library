'use client';
import { useState } from 'react';
import { SHADERS } from '@/components/shaders';
import Link from 'next/link';
import LazyShader from '@/components/website/LazyShader';

const INITIAL_VISIBLE = 6;

export default function ComponentsPage() {
    const [showAll, setShowAll] = useState(false);
    const visibleShaders = showAll ? SHADERS : SHADERS.slice(0, INITIAL_VISIBLE);
    const hiddenCount = SHADERS.length - INITIAL_VISIBLE;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-6 py-24">
                <h1 className="text-4xl font-bold mb-8">Shader Components</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleShaders.map((shader, index) => (
                        <Link
                            key={shader.metadata.id}
                            href={`/components/${shader.metadata.slug}`}
                            className="group relative rounded-xl overflow-hidden border border-neutral-800 hover:border-neutral-700 transition-all"
                        >
                            <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                                {/* First 3 load immediately, rest lazy load */}
                                {index < 3 ? (
                                    <shader.Card />
                                ) : (
                                    <LazyShader>
                                        <shader.Card />
                                    </LazyShader>
                                )}
                            </div>
                            <div className="p-4 bg-neutral-900/50 backdrop-blur-sm">
                                <h3 className="font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">
                                    {shader.metadata.name}
                                </h3>
                                <p className="text-sm text-neutral-400 line-clamp-2">
                                    {shader.metadata.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Show More Button */}
                {!showAll && hiddenCount > 0 && (
                    <div className="flex justify-center mt-12">
                        <button
                            onClick={() => setShowAll(true)}
                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-orange-500/25 flex items-center gap-2"
                        >
                            Show {hiddenCount} More Shaders
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
