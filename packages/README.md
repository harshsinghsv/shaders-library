# Shaderz Packages

This directory contains all individual shader packages that can be installed separately.

## Available Packages

- `@shaderz/liquid-orange-shader` - Flowing liquid shader with warm orange tones
- `@shaderz/ocean-waves-shader` - Ocean waves shader (coming soon)
- `@shaderz/neon-fluid-shader` - Neon fluid shader (coming soon)
- `@shaderz/gradient-waves-shader` - Gradient waves shader (coming soon)
- `@shaderz/cosmic-nebula-shader` - Cosmic nebula shader (coming soon)
- `@shaderz/glossy-ribbon-shader` - Glossy ribbon shader (coming soon)
- `@shaderz/silk-flow-shader` - Silk flow shader (coming soon)
- `@shaderz/glass-twist-shader` - Glass twist shader (coming soon)
- `@shaderz/plasma-shader` - Plasma shader (coming soon)

## Publishing

Each package can be published independently:

```bash
cd packages/liquid-orange-shader
npm publish --access public
```

## Building

To build a package:

```bash
cd packages/liquid-orange-shader
npm install
npm run build
```

## Development

1. Install dependencies in the package:
```bash
cd packages/[shader-name]
pnpm install
```

2. Build the package:
```bash
pnpm run build
```

3. Test locally by linking:
```bash
npm link
# Then in your test project
npm link @shaderz/[shader-name]
```
