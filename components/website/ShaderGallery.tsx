'use client';
import { Shader } from './ShaderSelector';
import ShaderPreview from './ShaderPreview';
import VideoPreview from './VideoPreview';

export interface VideoBackground {
  id: string;
  name: string;
  description: string;
  src: string;
  colors: string[];
}

interface ShaderGalleryProps {
  shaders: Shader[];
  videos?: VideoBackground[];
  activeShader: string;
  onShaderChange: (shaderId: string) => void;
}

function ShaderGallery({ shaders, videos = [], activeShader, onShaderChange }: ShaderGalleryProps) {
  return (
    <section className='py-24 bg-black'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold text-white mb-6'>
            Background Gallery
          </h2>
          <p className='text-lg text-gray-300 max-w-2xl mx-auto'>
            Click any shader or video below to see it in action on the hero section above.
          </p>
        </div>

        {/* Shaders Section */}
        <div className='mb-12'>
          <h3 className='text-xl font-semibold text-white mb-6 flex items-center gap-2'>
            <span className='w-2 h-2 bg-purple-500 rounded-full'></span>
            Shaders
          </h3>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {shaders.map((shader) => (
              <button
                key={shader.id}
                onClick={() => onShaderChange(shader.id)}
                className={`group relative text-left w-full h-full rounded-3xl transition-all duration-500 hover:-translate-y-2
                  ${activeShader === shader.id
                    ? 'ring-2 ring-white/40 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
                    : 'hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]'
                  }`}
              >
                <div className="absolute inset-0 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm z-10 pointer-events-none" />

                <div
                  className='relative h-72 rounded-3xl overflow-hidden'
                  style={{
                    background: `linear-gradient(135deg, ${shader.colors[0]}, ${shader.colors[1]})`
                  }}
                >
                  {/* Live Shader Preview */}
                  <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    <ShaderPreview
                      fragmentShader={shader.fragmentShader}
                    />
                  </div>

                  {/* Gradient Overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90' />

                  {/* Active indicator */}
                  {activeShader === shader.id && (
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-white text-xs font-semibold bg-white/10 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                        Active
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
                    <div className="flex items-center gap-2 mb-3">
                      {shader.colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-2 h-2 rounded-full ring-1 ring-white/30"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <h3 className='text-white font-bold text-2xl mb-2 tracking-tight group-hover:text-purple-300 transition-colors'>
                      {shader.name}
                    </h3>
                    <p className='text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors'>
                      {shader.description}
                    </p>
                    <div className="flex items-center text-xs font-medium text-white/50 group-hover:text-white transition-colors">
                      <span className="border-b border-transparent group-hover:border-white/50 pb-0.5">Click to preview</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Videos Section */}
        {videos.length > 0 && (
          <div>
            <h3 className='text-xl font-semibold text-white mb-6 flex items-center gap-2'>
              <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
              Video Backgrounds
            </h3>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => onShaderChange(video.id)}
                  className={`group relative text-left w-full h-full rounded-3xl transition-all duration-500 hover:-translate-y-2
                    ${activeShader === video.id
                      ? 'ring-2 ring-white/40 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]'
                      : 'hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)]'
                    }`}
                >
                  <div className="absolute inset-0 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm z-10 pointer-events-none" />

                  <div className='relative h-72 rounded-3xl overflow-hidden bg-black'>
                    {/* Video Preview */}
                    <div className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                      <VideoPreview
                        src={video.src}
                      />
                    </div>

                    {/* Gradient Overlay */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90' />

                    {/* Video badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="text-white text-[10px] uppercase tracking-wider font-bold bg-blue-600/90 border border-blue-400/30 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg shadow-blue-900/20">
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        Video
                      </span>
                    </div>

                    {/* Active indicator */}
                    {activeShader === video.id && (
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-white text-xs font-semibold bg-white/10 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                          Active
                        </span>
                      </div>
                    )}

                    {/* Content */}
                    <div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
                      <div className="flex items-center gap-2 mb-3">
                        {video.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-2 h-2 rounded-full ring-1 ring-white/30"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h3 className='text-white font-bold text-2xl mb-2 tracking-tight group-hover:text-blue-300 transition-colors'>
                        {video.name}
                      </h3>
                      <p className='text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors'>
                        {video.description}
                      </p>
                      <div className="flex items-center text-xs font-medium text-white/50 group-hover:text-white transition-colors">
                        <span className="border-b border-transparent group-hover:border-white/50 pb-0.5">Click to preview</span>
                        <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ShaderGallery;