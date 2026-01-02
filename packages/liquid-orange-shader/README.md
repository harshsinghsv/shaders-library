# @shaderz/liquid-orange-shader

A flowing liquid WebGL shader with warm orange tones. Perfect for creating dynamic and mesmerizing background effects.

## Installation

```bash
npm install @shaderz/liquid-orange-shader
```

Or with yarn:

```bash
yarn add @shaderz/liquid-orange-shader
```

Or with pnpm:

```bash
pnpm add @shaderz/liquid-orange-shader
```

## Usage

### React / Next.js

```tsx
import LiquidOrangeShader from '@shaderz/liquid-orange-shader';

function App() {
  return (
    <div className="relative w-full h-screen">
      <LiquidOrangeShader />
      {/* Your content here */}
    </div>
  );
}
```

### With Custom Container

```tsx
<div className="relative w-full h-96 rounded-lg overflow-hidden">
  <LiquidOrangeShader />
</div>
```

## Features

- **WebGL Powered**: Smooth 60fps animations using GPU acceleration
- **Responsive**: Automatically adapts to container size
- **Zero Dependencies**: Only requires React as peer dependency
- **TypeScript Support**: Full type definitions included
- **Performance Optimized**: Efficient shader code for all devices

## Browser Support

This shader works on all modern browsers that support WebGL:
- Chrome 9+
- Firefox 4+
- Safari 5.1+
- Edge 12+

## License

MIT © harsh and shubham
