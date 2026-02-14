# Shaderz ✨

Add beautiful WebGL & video background shaders to your React/Next.js project with a simple CLI.

**26 shaders** — 16 WebGL + 10 video backgrounds. Zero config.

## Installation

```bash
npm install shaderz
```

Or use directly with npx (no installation required):

```bash
npx shaderz add
```

## Usage

### Add shaders to your project

```bash
npx shaderz add
```

This will:
1. Show a list of all 26 available shaders
2. Let you select multiple shaders with **Space**
3. Install shader components to `components/shaders/`
4. Copy video files to `public/videos/` (for video shaders)
5. Remind you to install required dependencies

### Use as a full-screen background

```tsx
import LiquidOrangeShader from '@/components/shaders/LiquidOrangeShader';

export default function HeroSection() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Shader background */}
      <div className="absolute inset-0 z-0">
        <LiquidOrangeShader />
      </div>

      {/* Your content on top */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-6xl font-bold text-white">Hello World</h1>
      </div>
    </div>
  );
}
```

### Use as a contained element

```tsx
import PlasmaShader from '@/components/shaders/PlasmaShader';

function App() {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <PlasmaShader />
    </div>
  );
}
```

## Available Shaders

### WebGL Shaders (16)

| Shader | Description |
|--------|-------------|
| `liquid-orange` | Flowing liquid with warm orange tones |
| `ocean-waves` | Dynamic ocean waves |
| `neon-fluid` | Vibrant neon fluid |
| `gradient-waves` | Smooth gradient waves |
| `cosmic-nebula` | Space-themed nebula |
| `silk-flow` | Smooth silk flow |
| `plasma` | Classic plasma effect |
| `plasma-v2` | Enhanced plasma with more colors |
| `dark-veil` | Mysterious blue/purple gradient |
| `liquid-motion` | Advanced fluid simulation |
| `frothy-galaxy` | Galactic frothy effect |
| `dark-cloudy` | Atmospheric dark cloudy |
| `electric-storm` | Dramatic electric lightning |
| `floating-lines` | Floating geometric lines |
| `gradient-blinds` | Venetian blinds effect |
| `lightening` | Lightning bolt effects |

### Video Shaders (10)

| Shader | Description |
|--------|-------------|
| `glossy-film` | Smooth glossy film with reflections |
| `nova-silk` | Silky smooth nova with flowing gradients |
| `abstract-render` | Stunning 3D abstract art render |
| `cosmic-flow` | Mesmerizing cosmic flow animation |
| `liquid-colors` | Vibrant liquid colors with smooth transitions |
| `neon-swirl` | Vibrant neon swirling patterns |
| `sci-fi-corridor` | Futuristic sci-fi corridor |
| `tunnel-cube` | Hypnotic tunnel made of cubes |
| `vj-spiral` | VJ-style spiral with psychedelic colors |
| `wavy-abstract` | Wavy abstract patterns |

> Video shaders automatically copy the `.mp4` file to your `public/videos/` folder.

## Requirements

- React 18+ or 19+
- **WebGL shaders**: `npm install three @types/three @react-three/fiber`
- **Gradient Blinds**: `npm install ogl`
- **Video shaders**: No extra dependencies (uses native `<video>` element)

## Links

- 🌐 [Live Demo & Docs](https://shaderz.vercel.app)
- 📦 [npm](https://www.npmjs.com/package/shaderz)
- 🐙 [GitHub](https://github.com/harshsinghsv/shaders-library)

## License

MIT © harsh and shubham
