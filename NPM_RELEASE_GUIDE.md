# NPM Package Release Guide - Shaders UI

## 📦 Package Contents Verification

### Registry Structure
```
registry/
└── components/
    ├── shaders/          (11 shaders + 1 CSS)
    ├── button/           (7 components)
    ├── card/             (2 components)
    ├── footers/          (2 components)
    ├── motion-number/    (5 components)
    ├── blurvignette/     (3 components)
    ├── clip-path/        (1 component)
    ├── scroll-animation/ (1 component)
    └── demo/             (1 component)
```

### Shader Components (11 Total)
✅ All shaders verified and included:

1. **cosmic-nebula-shader.tsx** (8,437 bytes)
2. **dark-veil-shader.tsx** (11,584 bytes) - ⭐ Updated with renamed variables
3. **frothy-galaxy-shader.tsx** (6,975 bytes) - ⭐ New
4. **gradient-waves-shader.tsx** (8,699 bytes)
5. **liquid-motion-shader.tsx** (21,872 bytes) - ⭐ Updated with renamed variables
6. **liquid-orange-shader.tsx** (8,016 bytes)
7. **neon-fluid-shader.tsx** (8,499 bytes)
8. **ocean-waves-shader.tsx** (6,917 bytes)
9. **plasma-shader.tsx** (5,062 bytes)
10. **plasma-v2-shader.tsx** (5,790 bytes) - ⭐ New
11. **silk-flow-shader.tsx** (9,175 bytes)

**Dependencies:**
- **LiqMotion.css** (211 bytes) - Required for liquid-motion-shader

---

## 🚀 Pre-Release Checklist

### 1. Update package.json

**Current Status:**
- ✅ Name: `shaders-ui`
- ⚠️ Version: `0.1.0` (private)
- ⚠️ Private: `true` (needs to be `false` for npm)

**Required Changes:**

```json
{
  "name": "@yourusername/shaders-ui",
  "version": "1.0.0",
  "private": false,
  "description": "A collection of beautiful WebGL shaders and UI components for React/Next.js",
  "main": "./registry/index.js",
  "types": "./registry/index.d.ts",
  "files": [
    "registry",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "react",
    "nextjs",
    "shaders",
    "webgl",
    "three.js",
    "ui-components",
    "animations",
    "effects"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/shaders-ui"
  },
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "three": "^0.172.0",
    "next": "^14.0.0 || ^15.0.0"
  }
}
```

### 2. Create/Update README.md

Add comprehensive documentation:
- Installation instructions
- Usage examples for each shader
- Dependencies list
- License information

### 3. Add LICENSE File

Create a `LICENSE` file (MIT recommended):
```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

### 4. Create .npmignore

Create `.npmignore` to exclude unnecessary files:
```
# Development files
node_modules/
.next/
.git/
.gitignore

# Source files (keep only registry)
app/
components/
content/
configs/
public/
lib/

# Config files
.eslintrc.json
next.config.js
tailwind.config.ts
tsconfig.json
postcss.config.js

# Documentation
*.md
!README.md
```

### 5. Build & Test

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test locally
npm link
cd ../test-project
npm link shaders-ui
```

---

## 📤 Publishing Steps

### Option 1: Manual Publishing

```bash
# 1. Login to npm
npm login

# 2. Verify package contents
npm pack --dry-run

# 3. Publish to npm
npm publish --access public

# For scoped packages (@username/shaders-ui)
npm publish --access public
```

### Option 2: Automated Publishing with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Publish to NPM
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 🔄 Version Management

### Semantic Versioning

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes

```bash
# Bump version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Publish new version
npm publish
```

---

## 📝 Post-Release

### 1. Create Git Tag
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Create GitHub Release
- Go to GitHub repository
- Click "Releases" → "Create a new release"
- Select the tag
- Add release notes

### 3. Update Documentation
- Add installation instructions
- Create examples
- Update changelog

---

## 🧪 Testing Installation

After publishing, test in a new project:

```bash
# Create test project
npx create-next-app@latest test-shaders
cd test-shaders

# Install your package
npm install @yourusername/shaders-ui

# Test import
# In a component:
import { LiquidOrangeShader } from '@yourusername/shaders-ui/registry/components/shaders/liquid-orange-shader'
```

---

## ⚠️ Important Notes

1. **Package Name**: Choose a unique name on npm
   - Check availability: `npm view @yourusername/shaders-ui`
   - Use scoped packages (@username/) to avoid conflicts

2. **Dependencies**: All peer dependencies must be installed by users
   - React 18/19
   - Three.js 0.172+
   - Next.js 14/15

3. **File Size**: Current package size ~120KB (shaders only)
   - Consider splitting into separate packages if needed

4. **TypeScript**: Ensure all .tsx files compile correctly
   - Run `tsc` before publishing

5. **CSS Files**: LiqMotion.css must be imported separately
   ```tsx
   import 'shaders-ui/registry/components/shaders/LiqMotion.css'
   ```

---

## 🎯 Quick Publish Checklist

- [ ] Update `package.json` (name, version, private: false)
- [ ] Create/update `README.md`
- [ ] Add `LICENSE` file
- [ ] Create `.npmignore`
- [ ] Test build: `npm run build`
- [ ] Login to npm: `npm login`
- [ ] Dry run: `npm pack --dry-run`
- [ ] Publish: `npm publish --access public`
- [ ] Create git tag: `git tag v1.0.0`
- [ ] Push tag: `git push origin v1.0.0`
- [ ] Create GitHub release
- [ ] Test installation in new project

---

## 📊 Package Stats

- **Total Components**: 32 (11 shaders + 21 other components)
- **Total Size**: ~120KB (shaders only)
- **Dependencies**: React, Three.js, Next.js (peer)
- **License**: MIT (recommended)
- **Compatibility**: React 18/19, Next.js 14/15

---

## 🆘 Troubleshooting

### "Package name already exists"
- Use scoped package: `@yourusername/shaders-ui`
- Choose different name

### "Permission denied"
- Run `npm login` first
- Check npm account permissions

### "Missing dependencies"
- Ensure all peer dependencies are listed
- Users must install them separately

### "Build errors"
- Run `npm run build` locally first
- Fix TypeScript errors
- Check all imports

---

## 📚 Additional Resources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Package.json Documentation](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
