# Shaderz NPM Package - Release Guide

## 📦 Package Overview

**Package Name**: `shaderz`  
**Type**: CLI Tool  
**Purpose**: Add beautiful WebGL & video shaders to React/Next.js projects via CLI  
**Current Version**: 1.2.0

---

## ✅ Package Contents (v1.2.0)

### WebGL Shaders (16)

1. ✅ **LiquidOrangeShader.tsx** — Flowing liquid shader with warm orange tones
2. ✅ **OceanWavesShader.tsx** — Dynamic ocean waves shader
3. ✅ **NeonFluidShader.tsx** — Vibrant neon fluid shader
4. ✅ **GradientWavesShader.tsx** — Smooth gradient waves shader
5. ✅ **CosmicNebulaShader.tsx** — Space-themed nebula shader
6. ✅ **SilkFlowShader.tsx** — Smooth silk flow shader
7. ✅ **PlasmaShader.tsx** — Classic plasma shader
8. ✅ **PlasmaV2Shader.tsx** — Enhanced plasma with more colors
9. ✅ **DarkVeilShader.tsx** — Mysterious blue/purple gradient
10. ✅ **LiquidMotionShader.tsx** — Advanced fluid simulation (+ LiqMotion.css)
11. ✅ **FrothyGalaxyShader.tsx** — Galactic frothy effect
12. ✅ **DarkCloudy.tsx** — Atmospheric dark cloudy shader
13. ✅ **ElectricStorm.tsx** — Dramatic electric lightning
14. ✅ **FloatingLines.tsx** — Floating geometric lines
15. ✅ **GradientBlinds.tsx** — Venetian blinds effect (uses OGL)
16. ✅ **Lightening.tsx** — Lightning bolt effects

### Video Shaders (10)

Each includes a `.tsx` component + `.mp4` video file:

1. ✅ **GlossyFilmShader** — glossy-film.mp4
2. ✅ **NovaSilkShader** — nova-silk.mp4
3. ✅ **AbstractRenderShader** — abstract-render.mp4
4. ✅ **CosmicFlowShader** — cosmic-flow.mp4
5. ✅ **LiquidColorsShader** — liquid-colors.mp4
6. ✅ **NeonSwirlShader** — neon-swirl.mp4
7. ✅ **SciFiCorridorShader** — sci-fi-corridor.mp4
8. ✅ **TunnelCubeShader** — tunnel-cube.mp4
9. ✅ **VjSpiralShader** — vj-spiral.mp4
10. ✅ **WavyAbstractShader** — wavy-abstract.mp4

### Utility Components

- ✅ **VideoBackground.tsx** — Generic reusable video background component

### Total: 26 shaders + 1 utility + 10 video files

---

## 🚀 Publishing Steps

### 1. Build

```bash
cd packages/shaderz
npm install
npm run build
```

### 2. Verify Package Contents

```bash
npm pack --dry-run
# Should show 44 files: dist/, shaders/, videos/, package.json, README.md
```

### 3. Publish

```bash
npm login    # if needed
npm publish
```

---

## 📊 Package Stats

- **Total Shaders**: 26 (16 WebGL + 10 Video)
- **Total Files Published**: 44
- **Package Size**: ~28MB (mostly video files)
- **Dependencies**: commander, prompts, chalk, ora, fs-extra
- **Peer Dependencies**: React 18/19, Three.js 0.172+ (for WebGL shaders)

---

## 🔄 What Changed in v1.2.0

- ✅ All 10 video shaders properly included in CLI
- ✅ Video files bundled in `videos/` directory
- ✅ CLI copies video files to `public/videos/` automatically
- ✅ Updated documentation with correct hero background pattern
- ✅ CLI version string updated to 1.2.0
