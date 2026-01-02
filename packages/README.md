# Shaderz Package

Interactive CLI to add beautiful WebGL shaders to your React/Next.js project.

## Installation

```bash
npm install shaderz
```

Or use with npx (no installation required):

```bash
npx shaderz add
```

## Usage

Run the interactive CLI to select and install shaders:

```bash
npx shaderz add
```

This will:
1. Show a checkbox list of all available shaders
2. Let you select multiple shaders with Space
3. Install selected shaders to `components/shaders/`
4. Copy video files to `public/videos/` (for video shaders)
5. Show usage examples

## Available Shaders

**WebGL Shaders:**
- ✅ Liquid Orange - Flowing liquid shader with warm orange tones
- ✅ Ocean Waves - Dynamic ocean waves shader
- ✅ Neon Fluid - Vibrant neon fluid shader
- ✅ Gradient Waves - Smooth gradient waves shader
- ✅ Cosmic Nebula - Space-themed nebula shader
- ✅ Glossy Ribbon - Glossy ribbon flow shader
- ✅ Silk Flow - Smooth silk flow shader
- ✅ Glass Twist - Glass twist effect shader
- ✅ Plasma - Classic plasma shader

**Video Background:**
- ✅ Glossy Film - MP4 video background

## Publishing

```bash
cd packages/shaderz
pnpm install
pnpm run build
npm publish
```

## Development

1. Install dependencies:
```bash
cd packages/shaderz
pnpm install
```

2. Build:
```bash
pnpm run build
```

3. Test locally:
```bash
npm link
# Then in your test project
npx shaderz add
```
