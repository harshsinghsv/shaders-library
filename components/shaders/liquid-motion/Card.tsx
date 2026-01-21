'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LiqMotion.css';

export default function LiquidMotionShader({
    mouseForce = 20,
    cursorSize = 100,
    isViscous = false,
    viscous = 30,
    iterationsViscous = 32,
    iterationsPoisson = 32,
    dt = 0.014,
    BFECC = true,
    resolution = 0.5,
    isBounce = false,
    colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
    style = {},
    className = '',
    autoDemo = true,
    autoSpeed = 0.5,
    autoIntensity = 2.2,
    takeoverDuration = 0.25,
    autoResumeDelay = 1000,
    autoRampDuration = 0.6,
    shiny = true,
    distort = 0.3
}: {
    mouseForce?: number;
    cursorSize?: number;
    isViscous?: boolean;
    viscous?: number;
    iterationsViscous?: number;
    iterationsPoisson?: number;
    dt?: number;
    BFECC?: boolean;
    resolution?: number;
    isBounce?: boolean;
    colors?: string[];
    style?: React.CSSProperties;
    className?: string;
    autoDemo?: boolean;
    autoSpeed?: number;
    autoIntensity?: number;
    takeoverDuration?: number;
    autoResumeDelay?: number;
    autoRampDuration?: number;
    shiny?: boolean;
    distort?: number;
}) {
    const mountRef = useRef<HTMLDivElement>(null);
    const webglRef = useRef<any>(null);
    const rafRef = useRef<number | null>(null);
    const isVisibleRef = useRef(true);

    useEffect(() => {
        if (!mountRef.current) return;

        function createGradientTexture(stops: string[]) {
            let arr: string[];
            if (Array.isArray(stops) && stops.length > 0) {
                arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
            } else {
                arr = ['#ffffff', '#ffffff'];
            }
            const w = arr.length;
            const data = new Uint8Array(w * 4);
            for (let i = 0; i < w; i++) {
                const c = new THREE.Color(arr[i]);
                data[i * 4 + 0] = Math.round(c.r * 255);
                data[i * 4 + 1] = Math.round(c.g * 255);
                data[i * 4 + 2] = Math.round(c.b * 255);
                data[i * 4 + 3] = 255;
            }
            const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
            tex.magFilter = THREE.LinearFilter;
            tex.minFilter = THREE.LinearFilter;
            tex.wrapS = THREE.ClampToEdgeWrapping;
            tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.generateMipmaps = false;
            tex.needsUpdate = true;
            return tex;
        }

        const gradientTex = createGradientTexture(colors);
        const backgroundVec = new THREE.Vector4(0, 0, 0, 0);

        // Core rendering utilities
        class FluidCore {
            width = 0;
            height = 0;
            pixelRatio = 1;
            time = 0;
            delta = 0;
            container: HTMLElement | null = null;
            renderer: THREE.WebGLRenderer | null = null;
            clock: THREE.Clock | null = null;

            init(container: HTMLElement) {
                this.container = container;
                this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
                this.resize();
                this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
                this.renderer.autoClear = false;
                this.renderer.setClearColor(new THREE.Color(0x000000), 0);
                this.renderer.setPixelRatio(this.pixelRatio);
                this.renderer.setSize(this.width, this.height);
                this.renderer.domElement.style.width = '100%';
                this.renderer.domElement.style.height = '100%';
                this.renderer.domElement.style.display = 'block';
                this.clock = new THREE.Clock();
                this.clock.start();
            }

            resize() {
                if (!this.container) return;
                const rect = this.container.getBoundingClientRect();
                this.width = Math.max(1, Math.floor(rect.width));
                this.height = Math.max(1, Math.floor(rect.height));
                if (this.renderer) this.renderer.setSize(this.width, this.height, false);
            }

            update() {
                if (!this.clock) return;
                this.delta = this.clock.getDelta();
                this.time += this.delta;
            }
        }

        // Pointer tracking for interaction
        class PointerTracker {
            coords = new THREE.Vector2();
            coords_old = new THREE.Vector2();
            diff = new THREE.Vector2();
            container: HTMLElement | null = null;
            isAutoActive = false;
            autoIntensity = 2.0;

            init(container: HTMLElement) {
                this.container = container;
                window.addEventListener('mousemove', this.onMouseMove);
                window.addEventListener('touchmove', this.onTouchMove, { passive: true });
            }

            cleanup() {
                window.removeEventListener('mousemove', this.onMouseMove);
                window.removeEventListener('touchmove', this.onTouchMove);
            }

            onMouseMove = (e: MouseEvent) => {
                if (!this.container) return;
                const rect = this.container.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                const nx = (e.clientX - rect.left) / rect.width;
                const ny = (e.clientY - rect.top) / rect.height;
                this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
            };

            onTouchMove = (e: TouchEvent) => {
                if (!this.container || e.touches.length !== 1) return;
                const t = e.touches[0];
                const rect = this.container.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                const nx = (t.clientX - rect.left) / rect.width;
                const ny = (t.clientY - rect.top) / rect.height;
                this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
            };

            update() {
                this.diff.subVectors(this.coords, this.coords_old);
                this.coords_old.copy(this.coords);
                if (this.isAutoActive) this.diff.multiplyScalar(this.autoIntensity);
            }
        }

        // Shader source definitions
        const quadVertexShader = `
      attribute vec3 position;
      uniform vec2 boundarySpace;
      varying vec2 uv;
      void main(){
        vec3 pos = position;
        vec2 scale = 1.0 - boundarySpace * 2.0;
        pos.xy = pos.xy * scale;
        uv = vec2(0.5) + pos.xy * 0.5;
        gl_Position = vec4(pos, 1.0);
      }
    `;

        const velocityAdvectShader = `
      precision highp float;
      uniform sampler2D velocity;
      uniform float dt;
      uniform bool isBFECC;
      uniform vec2 fboSize;
      varying vec2 uv;
      void main(){
        vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
        if(!isBFECC){
          vec2 vel = texture2D(velocity, uv).xy;
          vec2 uv2 = uv - vel * dt * ratio;
          gl_FragColor = vec4(texture2D(velocity, uv2).xy, 0.0, 0.0);
        } else {
          vec2 vel_old = texture2D(velocity, uv).xy;
          vec2 spot_old = uv - vel_old * dt * ratio;
          vec2 vel_new1 = texture2D(velocity, spot_old).xy;
          vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
          vec2 error = spot_new2 - uv;
          vec2 spot_new3 = uv - error / 2.0;
          vec2 vel_2 = texture2D(velocity, spot_new3).xy;
          vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
          gl_FragColor = vec4(texture2D(velocity, spot_old2).xy, 0.0, 0.0);
        }
      }
    `;

        const forceApplyShader = `
      precision highp float;
      uniform vec2 force;
      uniform vec2 center;
      uniform vec2 scale;
      varying vec2 vUv;
      void main(){
        vec2 circle = (vUv - 0.5) * 2.0;
        float d = 1.0 - min(length(circle), 1.0);
        d *= d;
        gl_FragColor = vec4(force * d, 0.0, 1.0);
      }
    `;

        const pointerVertexShader = `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform vec2 center;
      uniform vec2 scale;
      uniform vec2 px;
      varying vec2 vUv;
      void main(){
        vec2 pos = position.xy * scale * 2.0 * px + center;
        vUv = uv;
        gl_Position = vec4(pos, 0.0, 1.0);
      }
    `;

        const divergenceCalcShader = `
      precision highp float;
      uniform sampler2D velocity;
      uniform float dt;
      uniform vec2 px;
      varying vec2 uv;
      void main(){
        float x0 = texture2D(velocity, uv - vec2(px.x, 0.0)).x;
        float x1 = texture2D(velocity, uv + vec2(px.x, 0.0)).x;
        float y0 = texture2D(velocity, uv - vec2(0.0, px.y)).y;
        float y1 = texture2D(velocity, uv + vec2(0.0, px.y)).y;
        float divergence = (x1 - x0 + y1 - y0) / 2.0;
        gl_FragColor = vec4(divergence / dt);
      }
    `;

        const pressureSolveShader = `
      precision highp float;
      uniform sampler2D pressure;
      uniform sampler2D divergence;
      uniform vec2 px;
      varying vec2 uv;
      void main(){
        float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
        float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
        float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
        float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
        float div = texture2D(divergence, uv).r;
        gl_FragColor = vec4((p0 + p1 + p2 + p3) / 4.0 - div);
      }
    `;

        const gradientSubtractShader = `
      precision highp float;
      uniform sampler2D pressure;
      uniform sampler2D velocity;
      uniform vec2 px;
      uniform float dt;
      varying vec2 uv;
      void main(){
        float p0 = texture2D(pressure, uv + vec2(px.x, 0.0)).r;
        float p1 = texture2D(pressure, uv - vec2(px.x, 0.0)).r;
        float p2 = texture2D(pressure, uv + vec2(0.0, px.y)).r;
        float p3 = texture2D(pressure, uv - vec2(0.0, px.y)).r;
        vec2 v = texture2D(velocity, uv).xy;
        vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
        gl_FragColor = vec4(v - gradP * dt, 0.0, 1.0);
      }
    `;

        const colorOutputShader = `
      precision highp float;
      uniform sampler2D velocity;
      uniform sampler2D palette;
      uniform vec4 bgColor;
      uniform float distortion;
      uniform bool shiny;
      varying vec2 uv;
      void main(){
        vec2 vel = texture2D(velocity, uv).xy;
        float lenv = clamp(length(vel), 0.0, 1.0);
        float r, g, b;
        if (shiny) {
          r = texture2D(palette, vec2(lenv + distortion * 0.1, 0.5)).r;
          g = texture2D(palette, vec2(lenv, 0.5)).g;
          b = texture2D(palette, vec2(lenv - distortion * 0.1, 0.5)).b;
          float specular = pow(lenv, 3.5) * 0.8;
          vec3 finalColor = vec3(r, g, b) + vec3(specular);
          float outA = clamp(mix(bgColor.a, 1.0, lenv * 1.5), 0.0, 1.0);
          gl_FragColor = vec4(finalColor, outA);
        } else {
          vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
          float outA = mix(bgColor.a, 1.0, lenv);
          gl_FragColor = vec4(c, outA);
        }
      }
    `;

        const fluidCore = new FluidCore();
        const pointer = new PointerTracker();

        const container = mountRef.current;
        container.style.position = container.style.position || 'relative';
        container.style.overflow = 'hidden';

        fluidCore.init(container);
        pointer.init(container);
        pointer.autoIntensity = autoIntensity;

        if (!fluidCore.renderer) return;

        container.appendChild(fluidCore.renderer.domElement);

        // Create framebuffers for simulation
        const bufferWidth = Math.max(1, Math.round(resolution * fluidCore.width));
        const bufferHeight = Math.max(1, Math.round(resolution * fluidCore.height));
        const pixelScale = new THREE.Vector2(1.0 / bufferWidth, 1.0 / bufferHeight);
        const bufferSize = new THREE.Vector2(bufferWidth, bufferHeight);

        const bufferOpts: THREE.RenderTargetOptions = {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            depthBuffer: false,
            stencilBuffer: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
        };

        const velocityA = new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, bufferOpts);
        const velocityB = new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, bufferOpts);
        const divergenceBuffer = new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, bufferOpts);
        const pressureA = new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, bufferOpts);
        const pressureB = new THREE.WebGLRenderTarget(bufferWidth, bufferHeight, bufferOpts);

        // Rendering setup
        const viewCamera = new THREE.Camera();
        const quadGeometry = new THREE.PlaneGeometry(2, 2);

        // Velocity advection material
        const advectMaterial = new THREE.RawShaderMaterial({
            vertexShader: quadVertexShader,
            fragmentShader: velocityAdvectShader,
            uniforms: {
                boundarySpace: { value: pixelScale },
                velocity: { value: velocityA.texture },
                fboSize: { value: bufferSize },
                dt: { value: dt },
                isBFECC: { value: BFECC }
            }
        });

        // Force application material
        const forceMaterial = new THREE.RawShaderMaterial({
            vertexShader: pointerVertexShader,
            fragmentShader: forceApplyShader,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms: {
                px: { value: pixelScale },
                force: { value: new THREE.Vector2() },
                center: { value: new THREE.Vector2() },
                scale: { value: new THREE.Vector2(cursorSize, cursorSize) }
            }
        });

        // Divergence calculation material
        const divergenceMaterial = new THREE.RawShaderMaterial({
            vertexShader: quadVertexShader,
            fragmentShader: divergenceCalcShader,
            uniforms: {
                boundarySpace: { value: pixelScale },
                velocity: { value: velocityB.texture },
                px: { value: pixelScale },
                dt: { value: dt }
            }
        });

        // Pressure solver material
        const pressureMaterial = new THREE.RawShaderMaterial({
            vertexShader: quadVertexShader,
            fragmentShader: pressureSolveShader,
            uniforms: {
                boundarySpace: { value: pixelScale },
                pressure: { value: pressureA.texture },
                divergence: { value: divergenceBuffer.texture },
                px: { value: pixelScale }
            }
        });

        // Gradient subtraction material
        const gradientMaterial = new THREE.RawShaderMaterial({
            vertexShader: quadVertexShader,
            fragmentShader: gradientSubtractShader,
            uniforms: {
                boundarySpace: { value: pixelScale },
                pressure: { value: pressureA.texture },
                velocity: { value: velocityB.texture },
                px: { value: pixelScale },
                dt: { value: dt }
            }
        });

        // Output rendering material
        const outputMaterial = new THREE.RawShaderMaterial({
            vertexShader: quadVertexShader,
            fragmentShader: colorOutputShader,
            transparent: true,
            depthWrite: false,
            uniforms: {
                boundarySpace: { value: new THREE.Vector2() },
                velocity: { value: velocityA.texture },
                palette: { value: gradientTex },
                bgColor: { value: backgroundVec },
                distortion: { value: distort },
                shiny: { value: shiny }
            }
        });

        const advectScene = new THREE.Scene();
        advectScene.add(new THREE.Mesh(quadGeometry, advectMaterial));

        const forceScene = new THREE.Scene();
        const forceMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), forceMaterial);
        forceScene.add(forceMesh);

        const divergenceScene = new THREE.Scene();
        divergenceScene.add(new THREE.Mesh(quadGeometry, divergenceMaterial));

        const pressureScene = new THREE.Scene();
        pressureScene.add(new THREE.Mesh(quadGeometry, pressureMaterial));

        const gradientScene = new THREE.Scene();
        gradientScene.add(new THREE.Mesh(quadGeometry, gradientMaterial));

        const outputScene = new THREE.Scene();
        outputScene.add(new THREE.Mesh(quadGeometry, outputMaterial));

        const render = () => {
            if (!fluidCore.renderer) return;

            pointer.update();
            fluidCore.update();

            // Advection
            advectMaterial.uniforms.velocity.value = velocityA.texture;
            advectMaterial.uniforms.dt.value = dt;
            fluidCore.renderer.setRenderTarget(velocityB);
            fluidCore.renderer.render(advectScene, viewCamera);

            // External force - clamp center to avoid edge artifacts
            const cursorSizeNorm = cursorSize * pixelScale.x * 2;
            const margin = cursorSizeNorm + 0.1;
            const clampedX = Math.max(-1 + margin, Math.min(1 - margin, pointer.coords.x));
            const clampedY = Math.max(-1 + margin, Math.min(1 - margin, pointer.coords.y));

            // Reduce force near edges
            const edgeDistX = Math.min(Math.abs(pointer.coords.x + 1), Math.abs(pointer.coords.x - 1));
            const edgeDistY = Math.min(Math.abs(pointer.coords.y + 1), Math.abs(pointer.coords.y - 1));
            const edgeFalloff = Math.min(1, Math.min(edgeDistX, edgeDistY) / 0.3);

            const forceX = (pointer.diff.x / 2) * mouseForce * edgeFalloff;
            const forceY = (pointer.diff.y / 2) * mouseForce * edgeFalloff;
            forceMaterial.uniforms.force.value.set(forceX, forceY);
            forceMaterial.uniforms.center.value.set(clampedX, clampedY);
            forceMaterial.uniforms.scale.value.set(cursorSize, cursorSize);
            fluidCore.renderer.setRenderTarget(velocityB);
            fluidCore.renderer.render(forceScene, viewCamera);

            // Divergence
            divergenceMaterial.uniforms.velocity.value = velocityB.texture;
            fluidCore.renderer.setRenderTarget(divergenceBuffer);
            fluidCore.renderer.render(divergenceScene, viewCamera);

            // Poisson iterations
            for (let i = 0; i < iterationsPoisson; i++) {
                const pIn = i % 2 === 0 ? pressureA : pressureB;
                const pOut = i % 2 === 0 ? pressureB : pressureA;
                pressureMaterial.uniforms.pressure.value = pIn.texture;
                fluidCore.renderer.setRenderTarget(pOut);
                fluidCore.renderer.render(pressureScene, viewCamera);
            }

            // Pressure projection
            gradientMaterial.uniforms.velocity.value = velocityB.texture;
            gradientMaterial.uniforms.pressure.value = (iterationsPoisson % 2 === 0 ? pressureA : pressureB).texture;
            fluidCore.renderer.setRenderTarget(velocityA);
            fluidCore.renderer.render(gradientScene, viewCamera);

            // Output
            outputMaterial.uniforms.velocity.value = velocityA.texture;
            fluidCore.renderer.setRenderTarget(null);
            fluidCore.renderer.render(outputScene, viewCamera);

            rafRef.current = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            fluidCore.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', handleResize);
            pointer.cleanup();

            velocityA.dispose();
            velocityB.dispose();
            divergenceBuffer.dispose();
            pressureA.dispose();
            pressureB.dispose();
            quadGeometry.dispose();
            advectMaterial.dispose();
            forceMaterial.dispose();
            divergenceMaterial.dispose();
            pressureMaterial.dispose();
            gradientMaterial.dispose();
            outputMaterial.dispose();
            gradientTex.dispose();

            if (fluidCore.renderer) {
                const canvas = fluidCore.renderer.domElement;
                if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
                fluidCore.renderer.dispose();
            }
        };
    }, [colors, shiny, distort, mouseForce, cursorSize, dt, BFECC, resolution, iterationsPoisson, autoIntensity]);

    return (
        <div
            ref={mountRef}
            className={`liquid-ether-container ${className || ''}`}
            style={style}
        />
    );
}