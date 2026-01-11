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
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {shaders.map((shader) => (
              <button
                key={shader.id}
                onClick={() => {
                  onShaderChange(shader.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group relative text-left w-full rounded-2xl bg-[#1a1a1a] p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-[#222]
                  ${activeShader === shader.id
                    ? 'ring-2 ring-purple-500/50 shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]'
                    : 'hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
                  }`}
              >
                {/* Header with icon and name */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Shader icon - gradient circle */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${shader.colors[0]}, ${shader.colors[1]})`
                    }}
                  >
                    <svg className="w-5 h-5 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h3 className='text-white font-semibold text-sm truncate group-hover:text-purple-300 transition-colors'>
                      {shader.name}
                    </h3>
                    <span className="text-gray-500 text-xs">
                      Shader · {activeShader === shader.id ? 'Active' : 'Default'}
                    </span>
                  </div>
                </div>

                {/* Shader Preview Area */}
                <div
                  className='relative h-64 rounded-xl overflow-hidden'
                  style={{
                    background: `linear-gradient(135deg, ${shader.colors[0]}20, ${shader.colors[1]}20)`
                  }}
                >
                  {/* Live Shader Preview */}
                  <div className="absolute inset-0">
                    <ShaderPreview
                      fragmentShader={shader.fragmentShader}
                    />
                  </div>

                  {/* Active indicator badge */}
                  {activeShader === shader.id && (
                    <div className="absolute top-3 right-3 z-20">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                    </div>
                  )}
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
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {videos.map((video) => (
                <div
                  key={video.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onShaderChange(video.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onShaderChange(video.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`group relative text-left w-full rounded-2xl bg-[#1a1a1a] p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-[#222] cursor-pointer
                    ${activeShader === video.id
                      ? 'ring-2 ring-blue-500/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]'
                      : 'hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
                    }`}
                >
                  {/* Header with icon and name */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Video icon - gradient circle */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-blue-500 to-blue-700"
                    >
                      <svg className="w-5 h-5 text-white/90 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h3 className='text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors'>
                        {video.name}
                      </h3>
                      <span className="text-gray-500 text-xs">
                        Video · {activeShader === video.id ? 'Active' : 'Default'}
                      </span>
                    </div>
                  </div>

                  {/* Video Preview Area */}
                  <div className='relative h-64 rounded-xl overflow-hidden bg-black/50'>
                    {/* Video Preview */}
                    <div className="absolute inset-0">
                      <VideoPreview
                        src={video.src}
                      />
                    </div>

                    {/* Active indicator badge */}
                    {activeShader === video.id && (
                      <div className="absolute top-3 right-3 z-20">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ShaderGallery;