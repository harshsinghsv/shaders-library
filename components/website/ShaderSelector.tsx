'use client';
import { useState } from 'react';

export interface Shader {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType;
  thumbnail: string;
  colors: string[];
  fragmentShader: string;
}

interface ShaderSelectorProps {
  shaders: Shader[];
  activeShader: string;
  onShaderChange: (shaderId: string) => void;
}

function ShaderSelector({ shaders, activeShader, onShaderChange }: ShaderSelectorProps) {
  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
      <div className="flex gap-4 p-4 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10">
        {shaders.map((shader) => (
          <button
            key={shader.id}
            onClick={() => onShaderChange(shader.id)}
            className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
              activeShader === shader.id
                ? 'ring-2 ring-white/50 scale-105'
                : 'hover:scale-105 hover:ring-2 hover:ring-white/30'
            }`}
          >
            <div className="w-20 h-16 md:w-24 md:h-20 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
              {/* Color preview */}
              <div className="absolute inset-0 opacity-70">
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${shader.colors.join(', ')})`
                  }}
                />
              </div>
              
              {/* Shader name */}
              <div className="relative z-10 text-white text-xs md:text-sm font-medium text-center px-2">
                {shader.name}
              </div>
              
              {/* Active indicator */}
              {activeShader === shader.id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
              )}
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                {shader.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ShaderSelector;