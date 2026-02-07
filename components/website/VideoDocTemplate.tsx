import { getShaderBySlug } from '@/components/shaders';
import { CopyButton } from './CopyButton';

interface VideoDocTemplateProps {
  slug: string;
}

export function VideoDocTemplate({ slug }: VideoDocTemplateProps) {
  const shader = getShaderBySlug(slug);

  if (!shader) {
    return <div>Video not found: {slug}</div>;
  }

  const videoFile = shader.metadata.videoSrc || `/videos/${shader.metadata.id}.mp4`;

  const basicUsage = `<video
  src="${videoFile}"
  autoPlay
  loop
  muted
  playsInline
  className="w-full h-full object-cover"
/>`;

  const heroExample = `export default function Home() {
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
}`;

  return (
    <div className="video-doc">
      {/* Preview with Download Button */}
      <h2>Preview</h2>
      <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 mb-8">
        <shader.Hero />
        <a
          href={videoFile}
          download={`${shader.metadata.id}.mp4`}
          className="absolute bottom-3 right-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download MP4
        </a>
      </div>

      {/* Installation */}
      <h2>Installation</h2>
      <p><strong>Option 1: Using CLI (Recommended)</strong></p>
      <p>Install this video background directly using the CLI:</p>
      <div className="not-prose bg-neutral-900 p-4 rounded-lg overflow-x-auto mb-4 flex items-center justify-between">
        <code>npx shaderz add</code>
        <CopyButton text="npx shaderz add" />
      </div>
      <p>Select &quot;{shader.metadata.name}&quot; from the list. The video will be added to <code>/public/videos/</code>.</p>

      <p><strong>Option 2: Manual Installation</strong></p>
      <ol>
        <li>Download the video file using the button above</li>
        <li>Place it in your <code>/public/videos/</code> directory</li>
        <li>Use it in your components as shown below</li>
      </ol>

      {/* Usage */}
      <h2>Usage</h2>
      <p><strong>Basic Usage:</strong></p>
      <div className="not-prose bg-neutral-900 p-4 rounded-lg overflow-x-auto mb-4 relative">
        <div className="absolute top-2 right-2">
          <CopyButton text={basicUsage} />
        </div>
        <pre><code>{basicUsage}</code></pre>
      </div>

      <p><strong>Hero Section Background Example:</strong></p>
      <div className="not-prose bg-neutral-900 p-4 rounded-lg overflow-x-auto mb-4 relative">
        <div className="absolute top-2 right-2">
          <CopyButton text={heroExample} />
        </div>
        <pre><code>{heroExample}</code></pre>
      </div>

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
