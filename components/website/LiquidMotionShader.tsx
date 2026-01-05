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

        function makePaletteTexture(stops: string[]) {
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

        const paletteTex = makePaletteTexture(colors);
        const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

        // Common utilities
        class Common {
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

        // Mouse tracking
        class Mouse {
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

            dispose() {
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

        // Shader sources
        const face_vert = `
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

        const advection_frag = `
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

        const externalForce_frag = `
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

        const mouse_vert = `
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

        const divergence_frag = `
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

        const poisson_frag = `
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

        const pressure_frag = `
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

        const color_frag = `
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

        const common = new Common();
        const mouse = new Mouse();

        const container = mountRef.current;
        container.style.position = container.style.position || 'relative';
        container.style.overflow = 'hidden';

        common.init(container);
        mouse.init(container);
        mouse.autoIntensity = autoIntensity;

        if (!common.renderer) return;

        container.appendChild(common.renderer.domElement);

        // Create FBOs for simulation
        const fboWidth = Math.max(1, Math.round(resolution * common.width));
        const fboHeight = Math.max(1, Math.round(resolution * common.height));
        const cellScale = new THREE.Vector2(1.0 / fboWidth, 1.0 / fboHeight);
        const fboSize = new THREE.Vector2(fboWidth, fboHeight);

        const fboOpts: THREE.RenderTargetOptions = {
            type: THREE.HalfFloatType,
            format: THREE.RGBAFormat,
            depthBuffer: false,
            stencilBuffer: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
        };

        const vel0 = new THREE.WebGLRenderTarget(fboWidth, fboHeight, fboOpts);
        const vel1 = new THREE.WebGLRenderTarget(fboWidth, fboHeight, fboOpts);
        const divFbo = new THREE.WebGLRenderTarget(fboWidth, fboHeight, fboOpts);
        const pressure0 = new THREE.WebGLRenderTarget(fboWidth, fboHeight, fboOpts);
        const pressure1 = new THREE.WebGLRenderTarget(fboWidth, fboHeight, fboOpts);

        // Scenes and materials
        const camera = new THREE.Camera();
        const geometry = new THREE.PlaneGeometry(2, 2);

        // Advection pass
        const advectionMat = new THREE.RawShaderMaterial({
            vertexShader: face_vert,
            fragmentShader: advection_frag,
            uniforms: {
                boundarySpace: { value: cellScale },
                velocity: { value: vel0.texture },
                fboSize: { value: fboSize },
                dt: { value: dt },
                isBFECC: { value: BFECC }
            }
        });

        // External force pass
        const forceMat = new THREE.RawShaderMaterial({
            vertexShader: mouse_vert,
            fragmentShader: externalForce_frag,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            uniforms: {
                px: { value: cellScale },
                force: { value: new THREE.Vector2() },
                center: { value: new THREE.Vector2() },
                scale: { value: new THREE.Vector2(cursorSize, cursorSize) }
            }
        });

        // Divergence pass
        const divMat = new THREE.RawShaderMaterial({
            vertexShader: face_vert,
            fragmentShader: divergence_frag,
            uniforms: {
                boundarySpace: { value: cellScale },
                velocity: { value: vel1.texture },
                px: { value: cellScale },
                dt: { value: dt }
            }
        });

        // Poisson pass
        const poissonMat = new THREE.RawShaderMaterial({
            vertexShader: face_vert,
            fragmentShader: poisson_frag,
            uniforms: {
                boundarySpace: { value: cellScale },
                pressure: { value: pressure0.texture },
                divergence: { value: divFbo.texture },
                px: { value: cellScale }
            }
        });

        // Pressure pass
        const pressureMat = new THREE.RawShaderMaterial({
            vertexShader: face_vert,
            fragmentShader: pressure_frag,
            uniforms: {
                boundarySpace: { value: cellScale },
                pressure: { value: pressure0.texture },
                velocity: { value: vel1.texture },
                px: { value: cellScale },
                dt: { value: dt }
            }
        });

        // Output pass
        const outputMat = new THREE.RawShaderMaterial({
            vertexShader: face_vert,
            fragmentShader: color_frag,
            transparent: true,
            depthWrite: false,
            uniforms: {
                boundarySpace: { value: new THREE.Vector2() },
                velocity: { value: vel0.texture },
                palette: { value: paletteTex },
                bgColor: { value: bgVec4 },
                distortion: { value: distort },
                shiny: { value: shiny }
            }
        });

        const advectionScene = new THREE.Scene();
        advectionScene.add(new THREE.Mesh(geometry, advectionMat));

        const forceScene = new THREE.Scene();
        const forceMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), forceMat);
        forceScene.add(forceMesh);

        const divScene = new THREE.Scene();
        divScene.add(new THREE.Mesh(geometry, divMat));

        const poissonScene = new THREE.Scene();
        poissonScene.add(new THREE.Mesh(geometry, poissonMat));

        const pressureScene = new THREE.Scene();
        pressureScene.add(new THREE.Mesh(geometry, pressureMat));

        const outputScene = new THREE.Scene();
        outputScene.add(new THREE.Mesh(geometry, outputMat));

        const render = () => {
            if (!common.renderer) return;

            mouse.update();
            common.update();

            // Advection
            advectionMat.uniforms.velocity.value = vel0.texture;
            advectionMat.uniforms.dt.value = dt;
            common.renderer.setRenderTarget(vel1);
            common.renderer.render(advectionScene, camera);

            // External force - clamp center to avoid edge artifacts
            const cursorSizeNorm = cursorSize * cellScale.x * 2;
            const margin = cursorSizeNorm + 0.1;
            const clampedX = Math.max(-1 + margin, Math.min(1 - margin, mouse.coords.x));
            const clampedY = Math.max(-1 + margin, Math.min(1 - margin, mouse.coords.y));

            // Reduce force near edges
            const edgeDistX = Math.min(Math.abs(mouse.coords.x + 1), Math.abs(mouse.coords.x - 1));
            const edgeDistY = Math.min(Math.abs(mouse.coords.y + 1), Math.abs(mouse.coords.y - 1));
            const edgeFalloff = Math.min(1, Math.min(edgeDistX, edgeDistY) / 0.3);

            const forceX = (mouse.diff.x / 2) * mouseForce * edgeFalloff;
            const forceY = (mouse.diff.y / 2) * mouseForce * edgeFalloff;
            forceMat.uniforms.force.value.set(forceX, forceY);
            forceMat.uniforms.center.value.set(clampedX, clampedY);
            forceMat.uniforms.scale.value.set(cursorSize, cursorSize);
            common.renderer.setRenderTarget(vel1);
            common.renderer.render(forceScene, camera);

            // Divergence
            divMat.uniforms.velocity.value = vel1.texture;
            common.renderer.setRenderTarget(divFbo);
            common.renderer.render(divScene, camera);

            // Poisson iterations
            for (let i = 0; i < iterationsPoisson; i++) {
                const pIn = i % 2 === 0 ? pressure0 : pressure1;
                const pOut = i % 2 === 0 ? pressure1 : pressure0;
                poissonMat.uniforms.pressure.value = pIn.texture;
                common.renderer.setRenderTarget(pOut);
                common.renderer.render(poissonScene, camera);
            }

            // Pressure projection
            pressureMat.uniforms.velocity.value = vel1.texture;
            pressureMat.uniforms.pressure.value = (iterationsPoisson % 2 === 0 ? pressure0 : pressure1).texture;
            common.renderer.setRenderTarget(vel0);
            common.renderer.render(pressureScene, camera);

            // Output
            outputMat.uniforms.velocity.value = vel0.texture;
            common.renderer.setRenderTarget(null);
            common.renderer.render(outputScene, camera);

            rafRef.current = requestAnimationFrame(render);
        };

        render();

        const handleResize = () => {
            common.resize();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            window.removeEventListener('resize', handleResize);
            mouse.dispose();

            vel0.dispose();
            vel1.dispose();
            divFbo.dispose();
            pressure0.dispose();
            pressure1.dispose();
            geometry.dispose();
            advectionMat.dispose();
            forceMat.dispose();
            divMat.dispose();
            poissonMat.dispose();
            pressureMat.dispose();
            outputMat.dispose();
            paletteTex.dispose();

            if (common.renderer) {
                const canvas = common.renderer.domElement;
                if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
                common.renderer.dispose();
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