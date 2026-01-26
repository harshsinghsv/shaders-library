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
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 6;

    const webGLShaders = shaders.filter(s => s.metadata.type === 'shader');
    const videoShaders = shaders.filter(s => s.metadata.type === 'video');

    const totalPages = Math.ceil(webGLShaders.length / ITEMS_PER_PAGE);
    const visibleWebGLShaders = webGLShaders.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Optional: might want to scroll to gallery top, or keep position. Keeping behavior similar to user request context.
            // Actually, if we paginate, we probably want to scroll to the top of the gallery, not the top of the page, or just stay put.
            // User code had window.scrollTo({ top: 0 }) on card click.
            // For pagination, maybe scrolling to the grid start is better, but let's stick to simple state change first.
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const renderCard = (shader: ShaderModule, index: number, priority: boolean) => (
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
                {priority ? (
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
    );

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

                <div className="mb-16">
                    <h3 className="text-2xl font-bold text-white mb-8 pl-4 border-l-4 border-orange-500">
                        Interactive Shaders
                    </h3>
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                        {visibleWebGLShaders.map((shader, index) =>
                            renderCard(shader, index, true)
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 0}
                                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${currentPage === 0
                                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                        : 'bg-neutral-800 text-white hover:bg-neutral-700 hover:scale-105'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                                Previous
                            </button>

                            <span className="text-neutral-400 text-sm">
                                Page {currentPage + 1} of {totalPages}
                            </span>

                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages - 1}
                                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${currentPage === totalPages - 1
                                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-lg hover:shadow-orange-500/25'
                                    }`}
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {videoShaders.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-8 pl-4 border-l-4 border-blue-500">
                            Videos
                        </h3>
                        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {videoShaders.map((shader, index) =>
                                renderCard(shader, index, true)
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
