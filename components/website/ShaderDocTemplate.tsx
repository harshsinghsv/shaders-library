import { getShaderBySlug } from '@/components/shaders';
import { CopyButton } from './CopyButton';
import fs from 'fs';
import path from 'path';

// Dependencies mapping for each shader type
const SHADER_DEPENDENCIES: Record<string, string[]> = {
    'three': ['three', '@types/three', '@react-three/fiber'],
    'ogl': ['ogl'],
};

// Map shader IDs to their dependency type
const getShaderDependencies = (shaderId: string): string[] => {
    const oglShaders = ['gradient-blinds'];
    const threeShaders = ['liquid-orange', 'ocean-waves', 'neon-fluid', 'gradient-waves', 'cosmic-nebula',
        'silk-flow', 'plasma', 'plasma-v2', 'dark-veil', 'liquid-motion', 'frothy-galaxy',
        'dark-cloudy', 'electric-storm', 'floating-lines', 'lightening'];

    if (oglShaders.includes(shaderId)) {
        return SHADER_DEPENDENCIES['ogl'];
    }
    if (threeShaders.includes(shaderId)) {
        return SHADER_DEPENDENCIES['three'];
    }
    return [];
};

export function ShaderDocTemplate({ slug }: { slug: string }) {
    const shader = getShaderBySlug(slug);
    if (!shader) return null;

    const dependencies = getShaderDependencies(shader.metadata.id);

    // Read source code at build time for WebGL shaders
    let heroCode = '';
    if (shader.metadata.type === 'shader') {
        try {
            const heroPath = path.join(process.cwd(), 'components', 'shaders', shader.metadata.id, 'Hero.tsx');
            heroCode = fs.readFileSync(heroPath, 'utf-8');
        } catch {
            heroCode = '// Source code not available';
        }
    }

    const installCmd = `npx shaderz add`;
    const componentName = shader.metadata.name.replace(/\s/g, '');
    const basicUsageCode = `import ${componentName} from '@/components/shaders/${shader.metadata.id}/Hero';

export default function App() {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <${componentName} />
    </div>
  );
}`;

    const heroUsageCode = `import ${componentName} from '@/components/shaders/${shader.metadata.id}/Hero';

export default function HeroSection() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Shader Background */}
      <div className="absolute inset-0 z-0">
        <${componentName} />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        <h1 className="text-6xl font-bold">Your Content Here</h1>
      </div>
    </div>
  );
}`;

    return (
        <>
            {/* Preview */}
            <div className="h-96 rounded-lg overflow-hidden border border-neutral-800 bg-black relative mb-8">
                <shader.Hero />
            </div>

            {/* Required Dependencies */}
            {dependencies.length > 0 && (
                <>
                    <h2>Required Dependencies</h2>
                    <div className="not-prose bg-neutral-950 p-4 rounded-lg border border-neutral-800 mb-6 flex items-center justify-between">
                        <code className="text-sm text-neutral-400">
                            npm install {dependencies.join(' ')}
                        </code>
                        <CopyButton text={`npm install ${dependencies.join(' ')}`} />
                    </div>
                </>
            )}

            {/* NPM Installation */}
            <h2>NPM Installation (Recommended)</h2>
            <div className="not-prose bg-neutral-950 p-4 rounded-lg border border-neutral-800 mb-6 flex items-center justify-between">
                <code className="text-sm text-neutral-400">{installCmd}</code>
                <CopyButton text={installCmd} />
            </div>
            <p className="text-neutral-400 mb-6">
                Select &quot;{shader.metadata.name}&quot; from the interactive list.
            </p>

            {/* Basic Usage */}
            <h2>Basic Usage</h2>
            <div className="not-prose bg-neutral-950 p-4 rounded-lg border border-neutral-800 mb-6 relative">
                <div className="absolute top-2 right-2">
                    <CopyButton text={basicUsageCode} />
                </div>
                <pre className="text-sm text-neutral-400 overflow-x-auto">
                    {basicUsageCode}
                </pre>
            </div>

            {/* Full Screen Hero Background */}
            <h2>Full Screen Hero Background</h2>
            <p className="text-neutral-400 mb-4">
                To use the shader as a background, position it absolutely within a relative container and place your content on top using z-index.
            </p>
            <div className="not-prose bg-neutral-950 p-4 rounded-lg border border-neutral-800 mb-6 relative">
                <div className="absolute top-2 right-2">
                    <CopyButton text={heroUsageCode} />
                </div>
                <pre className="text-sm text-neutral-400 overflow-x-auto">
                    {heroUsageCode}
                </pre>
            </div>

            {/* Manual Installation */}
            <h2>Manual Installation</h2>
            <p className="text-neutral-400 mb-4">
                Alternatively, copy the component code directly into your project at{' '}
                <code className="bg-neutral-800 px-2 py-1 rounded">components/shaders/{shader.metadata.id}/Hero.tsx</code>
            </p>

            {/* Full Source Code (for WebGL shaders) */}
            {shader.metadata.type === 'shader' && heroCode && (
                <>
                    <h2>Full Component Code</h2>
                    <div className="not-prose bg-neutral-950 p-4 rounded-lg border border-neutral-800 mb-6 relative">
                        <div className="absolute top-2 right-2">
                            <CopyButton text={heroCode} />
                        </div>
                        <pre className="text-sm text-neutral-400 overflow-x-auto max-h-96">
                            <code>{heroCode}</code>
                        </pre>
                    </div>
                </>
            )}
        </>
    );
}
