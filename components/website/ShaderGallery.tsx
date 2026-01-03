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
                className={`group cursor-pointer transition-all duration-300 ${activeShader === shader.id
                  ? 'ring-2 ring-white/50 scale-105'
                  : 'hover:scale-105 hover:ring-2 hover:ring-white/30'
                  }`}
              >
                <div
                  className='relative h-64 rounded-2xl overflow-hidden border border-white/10'
                  style={{
                    background: `linear-gradient(135deg, ${shader.colors[0]}, ${shader.colors[1]})`
                  }}
                >
                  {/* Live Shader Preview - Lazy Loaded to prevent crash */}
                  <div className="absolute inset-0">
                    <ShaderPreview
                      fragmentShader={shader.fragmentShader}
                      className="opacity-80 group-hover:opacity-95 transition-opacity duration-300"
                    />
                  </div>

                  {/* Overlay for better text readability */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

                  {/* Active indicator */}
                  {activeShader === shader.id && (
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white text-sm font-medium bg-black/70 px-2 py-1 rounded-full backdrop-blur-sm">
                        Active
                      </span>
                    </div>
                  )}

                  <div className='absolute bottom-4 left-4 right-4'>
                    <h3 className='text-white font-bold text-xl mb-2 drop-shadow-lg'>{shader.name}</h3>
                    <p className='text-gray-200 text-sm mb-3 drop-shadow-md'>{shader.description}</p>
                    <div className="flex items-center justify-between">
                      <span className='text-gray-300 text-xs drop-shadow-md'>Click to preview</span>
                      <div className="flex gap-1">
                        {shader.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-white/30 shadow-lg"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
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
                  className={`group cursor-pointer transition-all duration-300 ${activeShader === video.id
                    ? 'ring-2 ring-white/50 scale-105'
                    : 'hover:scale-105 hover:ring-2 hover:ring-white/30'
                    }`}
                >
                  <div className='relative h-64 rounded-2xl overflow-hidden border border-white/10 bg-black'>
                    {/* Video Preview */}
                    <div className="absolute inset-0">
                      <VideoPreview
                        src={video.src}
                        className="opacity-80 group-hover:opacity-95 transition-opacity duration-300"
                      />
                    </div>

                    {/* Overlay for better text readability */}
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />

                    {/* Video badge */}
                    <div className="absolute top-4 left-4">
                      <span className="text-white text-xs font-medium bg-blue-600/80 px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Video
                      </span>
                    </div>

                    {/* Active indicator */}
                    {activeShader === video.id && (
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-white text-sm font-medium bg-black/70 px-2 py-1 rounded-full backdrop-blur-sm">
                          Active
                        </span>
                      </div>
                    )}

                    <div className='absolute bottom-4 left-4 right-4'>
                      <h3 className='text-white font-bold text-xl mb-2 drop-shadow-lg'>{video.name}</h3>
                      <p className='text-gray-200 text-sm mb-3 drop-shadow-md'>{video.description}</p>
                      <div className="flex items-center justify-between">
                        <span className='text-gray-300 text-xs drop-shadow-md'>Click to preview</span>
                        <div className="flex gap-1">
                          {video.colors.slice(0, 3).map((color, index) => (
                            <div
                              key={index}
                              className="w-4 h-4 rounded-full border border-white/30 shadow-lg"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
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