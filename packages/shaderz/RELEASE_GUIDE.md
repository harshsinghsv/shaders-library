# Shaderz NPM Package - Release Guide

## 📦 Package Overview

**Package Name**: `shaderz`  
**Type**: CLI Tool  
**Purpose**: Add beautiful WebGL shaders to React/Next.js projects via CLI  
**Current Version**: 1.0.0

---

## ✅ Package Contents Verified

### Shaders Folder (11 Shaders + 1 CSS)

All shaders successfully added and verified:

1. ✅ **CosmicNebulaShader.tsx** (8,437 bytes)
2. ✅ **DarkVeilShader.tsx** (11,584 bytes) - ⭐ NEW with renamed variables
3. ✅ **FrothyGalaxyShader.tsx** (6,975 bytes) - ⭐ NEW
4. ✅ **GradientWavesShader.tsx** (8,699 bytes)
5. ✅ **LiquidMotionShader.tsx** (21,872 bytes) - ⭐ UPDATED with renamed variables
6. ✅ **LiquidOrangeShader.tsx** (8,016 bytes)
7. ✅ **NeonFluidShader.tsx** (8,499 bytes)
8. ✅ **OceanWavesShader.tsx** (6,917 bytes)
9. ✅ **PlasmaShader.tsx** (5,062 bytes)
10. ✅ **PlasmaV2Shader.tsx** (5,790 bytes) - ⭐ NEW
11. ✅ **SilkFlowShader.tsx** (9,175 bytes)
12. ✅ **LiqMotion.css** (211 bytes) - Required for LiquidMotionShader

### Removed Shaders
- ❌ GlassTwistShader.tsx (deleted)
- ❌ GlossyRibbonShader.tsx (deleted)

### CLI Configuration
- ✅ Updated `src/cli.ts` with all 11 shaders
- ✅ Added CSS file handling for LiquidMotionShader
- ✅ Removed obsolete shader entries

---

## 🚀 Pre-Release Checklist

### 1. Verify Package Files

```bash
cd packages/shaderz
ls shaders/
# Should show 11 .tsx files + 1 .css file
```

### 2. Build the Package

```bash
cd packages/shaderz
npm run build
# or
pnpm build
```

This will:
- Compile TypeScript to JavaScript
- Generate `dist/` folder with CLI and index files
- Create type definitions

### 3. Test Locally

```bash
# Link the package locally
cd packages/shaderz
npm link
# or
pnpm link --global

# Test in a new project
cd /path/to/test-project
npx shaderz add
```

### 4. Verify Package Contents

```bash
cd packages/shaderz
npm pack --dry-run
```

This shows what will be published:
- `dist/` (compiled CLI)
- `shaders/` (all shader files)
- `videos/` (video files if any)
- `package.json`
- `README.md`

---

## 📤 Publishing to NPM

### Option 1: Manual Publishing

```bash
# 1. Navigate to package directory
cd packages/shaderz

# 2. Login to npm (if not already logged in)
npm login

# 3. Build the package
npm run build

# 4. Publish
npm publish
```

### Option 2: Using pnpm

```bash
cd packages/shaderz
pnpm build
pnpm publish
```

### First Time Publishing

If this is the first time publishing:

```bash
# Check if package name is available
npm view shaderz

# If name is taken, update package.json:
{
  "name": "@yourusername/shaderz",
  ...
}

# Then publish with access flag
npm publish --access public
```

---

## 🔄 Version Management

### Update Version

```bash
cd packages/shaderz

# Patch version (1.0.0 -> 1.0.1) - Bug fixes
npm version patch

# Minor version (1.0.0 -> 1.1.0) - New features
npm version minor

# Major version (1.0.0 -> 2.0.0) - Breaking changes
npm version major
```

### Publish New Version

```bash
npm run build
npm publish
```

---

## 📝 Package.json Configuration

Current configuration is correct:

```json
{
  "name": "shaderz",
  "version": "1.0.0",
  "description": "CLI tool to add beautiful WebGL shaders to your React/Next.js project",
  "main": "dist/index.js",
  "bin": {
    "shaderz": "dist/cli.js"
  },
  "files": [
    "dist",
    "shaders",
    "videos"
  ],
  "scripts": {
    "build": "tsup src/cli.ts src/index.ts --format cjs --dts --shims",
    "prepublishOnly": "npm run build"
  }
}
```

---

## 🧪 Testing After Publishing

### Test Installation

```bash
# Create a new Next.js project
npx create-next-app@latest test-shaderz
cd test-shaderz

# Install three.js (required dependency)
npm install three @types/three

# Use the CLI
npx shaderz add
```

### Verify Shaders Work

1. Select a shader from the CLI menu
2. Check that files are copied to `components/shaders/`
3. Import and use in a component:

```tsx
import LiquidOrangeShader from '@/components/shaders/LiquidOrangeShader';

export default function Page() {
  return (
    <div className="h-screen w-screen">
      <LiquidOrangeShader />
    </div>
  );
}
```

---

## 📊 Package Stats

- **Total Shaders**: 11
- **Total Size**: ~120KB (shaders only)
- **Dependencies**: 
  - commander (CLI framework)
  - prompts (interactive prompts)
  - chalk (colored output)
  - ora (spinners)
  - fs-extra (file operations)
- **Peer Dependencies**: 
  - React 18/19
  - Three.js 0.172+
  - Next.js (optional)

---

## 🎯 Quick Publish Steps

1. ✅ All shaders copied to `packages/shaderz/shaders/`
2. ✅ CLI updated with new shader list
3. ✅ CSS handling added for LiquidMotionShader
4. ⬜ Build: `npm run build`
5. ⬜ Test locally: `npm link` + test in project
6. ⬜ Login: `npm login`
7. ⬜ Publish: `npm publish`
8. ⬜ Create git tag: `git tag v1.0.0`
9. ⬜ Push tag: `git push origin v1.0.0`

---

## 🆘 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf dist
npm run build
```

### "Package name already exists"

Update `package.json`:
```json
{
  "name": "@yourusername/shaderz"
}
```

### CLI Not Working After Install

Check that `bin` field is correct in package.json and dist/cli.js has shebang:
```javascript
#!/usr/bin/env node
```

### Missing Files After Publish

Check `.npmignore` - make sure it's not excluding needed files:
```
node_modules/
src/
*.ts
!dist/
```

---

## 📚 Usage Documentation

After publishing, users can install with:

```bash
npx shaderz add
```

The CLI will:
1. Show interactive menu with all 11 shaders
2. Let users select multiple shaders
3. Auto-detect project structure (src/components, app/components, or components/)
4. Copy shader files to the correct location
5. Copy CSS file if LiquidMotionShader is selected
6. Show import examples
7. Check for Three.js dependency

---

## 🎉 Post-Release

### 1. Update README

Add installation and usage examples to `packages/shaderz/README.md`

### 2. Create GitHub Release

- Tag: `v1.0.0`
- Title: "Shaderz v1.0.0 - Initial Release"
- Description: List all 11 shaders and features

### 3. Announce

- Update main repo README
- Share on social media
- Update documentation site

---

## 🔐 NPM Account Setup

If you haven't published before:

1. Create NPM account: https://www.npmjs.com/signup
2. Verify email
3. Login via CLI: `npm login`
4. Enable 2FA (recommended): https://www.npmjs.com/settings/~/tfa

---

## ✨ What's New in This Release

### New Shaders (4)
- **Dark Veil**: Mysterious blue/purple gradient shader
- **Liquid Motion**: Advanced fluid simulation with Three.js
- **Frothy Galaxy**: Galactic frothy effect
- **Plasma V2**: Enhanced plasma with more colors

### Updated Shaders (2)
- **Dark Veil**: All functions renamed for originality
- **Liquid Motion**: 100+ variables renamed

### Removed Shaders (2)
- Glass Twist (obsolete)
- Glossy Ribbon (obsolete)

### Improvements
- ✅ CSS file handling for shaders that need it
- ✅ Better error messages
- ✅ Improved shader descriptions
- ✅ All code refactored for originality

---

**Ready to publish!** 🚀

Run: `cd packages/shaderz && npm run build && npm publish`
