'use client';
import { useState } from 'react';
import { ShaderModule } from '@/components/shaders';
import LazyShader from '@/components/website/LazyShader';

interface ShaderGalleryProps {
    shaders: ShaderModule[];
    activeShader: string;
    onShaderChange: (id: string) => void;
}

const INITIAL_VISIBLE = 6;

export default function ShaderGallery({ shaders, activeShader, onShaderChange }: ShaderGalleryProps) {
    const [showAll, setShowAll] = useState(false);
    const visibleShaders = showAll ? shaders : shaders.slice(0, INITIAL_VISIBLE);
    const hiddenCount = shaders.length - INITIAL_VISIBLE;

    return (
        <section className='py-24 bg-black'>
            <div className='container mx-auto px-6'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl md:text-4xl font-bold text-white mb-4'>
                        Shader Gallery
                    </h2>
                    <p className='text-neutral-400'>
                        Click any shader to preview it in the hero section above
                    </p>
                </div>

                <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {visibleShaders.map((shader, index) => (
                        <button
                            key={shader.metadata.id}
                            onClick={() => {
                                onShaderChange(shader.metadata.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`text-left group relative rounded-xl overflow-hidden border transition-all duration-300 ${activeShader === shader.metadata.id
                                ? 'border-orange-500 ring-2 ring-orange-500/20'
                                : 'border-neutral-800 hover:border-neutral-700'
                                }`}
                        >
                            <div className='aspect-video bg-neutral-900 relative overflow-hidden'>
                                {/* First 3 load immediately, rest lazy load */}
                                {index < 3 ? (
                                    <shader.Card />
                                ) : (
                                    <LazyShader>
                                        <shader.Card />
                                    </LazyShader>
                                )}
                            </div>
                            <div className='p-4 bg-neutral-900/50 backdrop-blur-sm'>
                                <h3 className='font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors'>
                                    {shader.metadata.name}
                                </h3>
                                <p className='text-sm text-neutral-400 line-clamp-2'>
                                    {shader.metadata.description}
                                </p>
                            </div>
                            {activeShader === shader.metadata.id && (
                                <div className="absolute top-3 right-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                    </span>
                                </div>
                            )}
                        </button>
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
        </section>
    );
}
