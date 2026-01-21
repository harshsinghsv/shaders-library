'use client';

import { getShaderBySlug } from '@/components/shaders';

interface VideoDocTemplateProps {
    slug: string;
}

export function VideoDocTemplate({ slug }: VideoDocTemplateProps) {
    const shader = getShaderBySlug(slug);

    if (!shader) {
        return <div>Video not found: {slug}</div>;
    }

    const videoFile = shader.metadata.videoSrc || `/videos/${shader.metadata.id}.mp4`;

    return (
        <div className="video-doc">
            {/* Preview */}
            <h2>Preview</h2>
            <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 mb-8">
                <shader.Hero />
            </div>

            {/* Installation */}
            <h2>Installation</h2>
            <p><strong>Option 1: Using CLI (Recommended)</strong></p>
            <p>Install this video background directly using the CLI:</p>
            <pre className="bg-neutral-900 p-4 rounded-lg overflow-x-auto">
                <code>npx shaderz add</code>
            </pre>
            <p>Select &quot;{shader.metadata.name}&quot; from the list. The video will be added to <code>/public/videos/</code>.</p>

            <p><strong>Option 2: Manual Installation</strong></p>
            <ol>
                <li>Download the video file</li>
                <li>Place it in your <code>/public/videos/</code> directory</li>
                <li>Use it in your components as shown below</li>
            </ol>

            {/* Usage */}
            <h2>Usage</h2>
            <p><strong>Basic Usage:</strong></p>
            <pre className="bg-neutral-900 p-4 rounded-lg overflow-x-auto">
                <code>{`<video
  src="${videoFile}"
  autoPlay
  loop
  muted
  playsInline
  className="w-full h-full object-cover"
/>`}</code>
            </pre>

            <p><strong>Hero Section Background Example:</strong></p>
            <pre className="bg-neutral-900 p-4 rounded-lg overflow-x-auto">
                <code>{`export default function Home() {
  return (
    <section className="relative min-h-screen">
      {/* Video background */}
      <div className="absolute inset-0 -z-10">
        <video
          src="${videoFile}"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Your hero content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <h1 className="text-6xl font-bold text-white">
          Welcome to Your Site
        </h1>
      </div>
    </section>
  );
}`}</code>
            </pre>

            {/* Features */}
            <h2>Features</h2>
            <ul>
                <li><strong>Smooth Playback</strong>: Optimized video for seamless looping</li>
                <li><strong>Premium Feel</strong>: High-quality visual effects</li>
                <li><strong>Performance Optimized</strong>: Compressed for fast loading</li>
                <li><strong>Easy Integration</strong>: Simple video HTML element</li>
            </ul>
        </div>
    );
}

export default VideoDocTemplate;
