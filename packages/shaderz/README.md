# Shaderz CLI

Add beautiful WebGL shaders to your React/Next.js project with a simple CLI.

## Installation

```bash
npm install shaderz
```

Or use with npx (no installation required):

```bash
npx shaderz add
```

## Usage

### Interactive Installation

Install shaders interactively by selecting from a list:

```bash
npx shaderz add
```

This will:
1. Show a checkbox list of all available shaders
2. Let you select multiple shaders with Space
3. Install selected shaders to `components/shaders/`
4. Copy video files to `public/videos/` (for video shaders)
5. Check and remind you to install required dependencies
6. Show usage examples

## Available Shaders

**WebGL Shaders:**
- `liquid-orange` - Flowing liquid shader with warm orange tones
- `ocean-waves` - Dynamic ocean waves shader
- `neon-fluid` - Vibrant neon fluid shader
- `gradient-waves` - Smooth gradient waves shader
- `cosmic-nebula` - Space-themed nebula shader
- `glossy-ribbon` - Glossy ribbon flow shader
- `silk-flow` - Smooth silk flow shader
- `glass-twist` - Glass twist effect shader
- `plasma` - Classic plasma shader

**Video Background:**
- `glossy-film` - MP4 video background (copies video to public/videos/)

## Usage in Your Project

After installation:

```tsx
import LiquidOrangeShader from '@/components/shaders/LiquidOrangeShader';

function App() {
  return (
    <div className="relative w-full h-screen">
      <LiquidOrangeShader />
      {/* Your content */}
    </div>
  );
}
```

### Video Background

```tsx
import VideoBackground from '@/components/shaders/VideoBackground';

function App() {
  return (
    <div className="relative w-full h-screen">
      <VideoBackground src="/videos/glossy-film.mp4" />
      {/* Your content */}
    </div>
  );
}
```

## Requirements

- React 18+ or 19+
- No additional dependencies required (WebGL is built into modern browsers)
- Video shader requires the video file to be in public/videos/ (automatically handled by CLI)

## License

MIT © harsh and shubham
