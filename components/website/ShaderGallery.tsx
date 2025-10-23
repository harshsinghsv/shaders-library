'use client';
import { Shader } from './ShaderSelector';
import ShaderPreview from './ShaderPreview';

interface ShaderGalleryProps {
  shaders: Shader[];
  activeShader: string;
  onShaderChange: (shaderId: string) => void;
}

function ShaderGallery({ shaders, activeShader, onShaderChange }: ShaderGalleryProps) {
  return (
    <section className='py-24 bg-black'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold text-white mb-6'>
            Shader Gallery
          </h2>
          <p className='text-lg text-gray-300 max-w-2xl mx-auto'>
            Click any shader below to see it in action on the hero section above.
          </p>
        </div>
        
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {shaders.map((shader) => (
            <button
              key={shader.id}
              onClick={() => onShaderChange(shader.id)}
              className={`group cursor-pointer transition-all duration-300 ${
                activeShader === shader.id
                  ? 'ring-2 ring-white/50 scale-105'
                  : 'hover:scale-105 hover:ring-2 hover:ring-white/30'
              }`}
            >
              <div className='relative h-64 rounded-2xl overflow-hidden border border-white/10 bg-black'>
                {/* Live Shader Preview */}
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
    </section>
  );
}

export default ShaderGallery;