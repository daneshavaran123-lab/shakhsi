"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

import { afterIntro } from "@/components/intro";

/**
 * A real-time ink simulation (stable fluids on the GPU): the pointer stirs
 * champagne and bone ink through the hero, and when nobody is stirring a slow
 * current keeps it alive. Pauses whenever the hero is off screen.
 */

type Props = {
  active: boolean;
  still: boolean;
  /** Ink colours, hex. */
  colors: string[];
  /** Light theme: darker, denser ink on paper instead of light on black. */
  light: boolean;
  eventSource: RefObject<HTMLElement | null>;
};

const SIM_RES = 128;
const DYE_RES = 640;
const PRESSURE_ITERATIONS = 18;
const CURL = 22;
const SPLAT_FORCE = 5200;
const SPLAT_RADIUS = 0.22;

const baseVertex = /* glsl */ `
  uniform vec2 texelSize;
  varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
  void main() {
    vUv = uv;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position, 1.0);
  }
`;

const head = /* glsl */ `
  precision highp float;
  varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
`;

const shaders = {
  splat: `${head}
    uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
    void main() {
      vec2 p = vUv - point; p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
    }`,
  advection: `${head}
    uniform sampler2D uVelocity; uniform sampler2D uSource; uniform vec2 velTexel; uniform float dt; uniform float dissipation;
    void main() {
      vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * velTexel;
      gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
    }`,
  curl: `${head}
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).y; float R = texture2D(uVelocity, vR).y;
      float T = texture2D(uVelocity, vT).x; float B = texture2D(uVelocity, vB).x;
      gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
    }`,
  vorticity: `${head}
    uniform sampler2D uVelocity; uniform sampler2D uCurl; uniform float curl; uniform float dt;
    void main() {
      float L = texture2D(uCurl, vL).x; float R = texture2D(uCurl, vR).x;
      float T = texture2D(uCurl, vT).x; float B = texture2D(uCurl, vB).x;
      float C = texture2D(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C; force.y *= -1.0;
      vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;
      gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
    }`,
  divergence: `${head}
    uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uVelocity, vL).x; float R = texture2D(uVelocity, vR).x;
      float T = texture2D(uVelocity, vT).y; float B = texture2D(uVelocity, vB).y;
      vec2 C = texture2D(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
      if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
      gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
    }`,
  clear: `${head}
    uniform sampler2D uTexture; uniform float value;
    void main() { gl_FragColor = value * texture2D(uTexture, vUv); }`,
  pressure: `${head}
    uniform sampler2D uPressure; uniform sampler2D uDivergence;
    void main() {
      float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
      float div = texture2D(uDivergence, vUv).x;
      gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
    }`,
  gradient: `${head}
    uniform sampler2D uPressure; uniform sampler2D uVelocity;
    void main() {
      float L = texture2D(uPressure, vL).x; float R = texture2D(uPressure, vR).x;
      float T = texture2D(uPressure, vT).x; float B = texture2D(uPressure, vB).x;
      vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
      gl_FragColor = vec4(vel, 0.0, 1.0);
    }`,
  display: `${head}
    uniform sampler2D uTexture; uniform float light; uniform float time;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + time) * 43758.5453); }
    void main() {
      vec3 c = texture2D(uTexture, vUv).rgb;
      c = 1.0 - exp(-c * 1.6);                        // soft tone map
      float a = clamp(max(c.r, max(c.g, c.b)) * 1.15, 0.0, 1.0);
      c += (hash(vUv * 512.0) - 0.5) * 0.035;         // film grain, avoids banding
      gl_FragColor = vec4(c, a * mix(1.0, 0.85, light));
    }`,
};

type Target = THREE.WebGLRenderTarget;
type Double = { read: Target; write: Target; swap: () => void };

function resolution(res: number, w: number, h: number) {
  let aspect = w / h;
  if (aspect < 1) aspect = 1 / aspect;
  const min = Math.round(res);
  const max = Math.round(res * aspect);
  return w > h ? { w: max, h: min } : { w: min, h: max };
}

export default function Fluid({ active, still, colors, light, eventSource }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({ active, colors, light });
  state.current = { active, colors, light };
  const wake = useRef<() => void>(() => {});

  useEffect(() => wake.current(), [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false });
    } catch {
      return; // No WebGL: the hero keeps its plain backdrop.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    scene.add(quad);

    const material = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({
        vertexShader: baseVertex,
        fragmentShader,
        uniforms: { texelSize: { value: new THREE.Vector2() }, ...uniforms },
        depthTest: false,
        depthWrite: false,
      });

    const m = {
      splat: material(shaders.splat, {
        uTarget: { value: null },
        aspectRatio: { value: 1 },
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
        radius: { value: 0 },
      }),
      advection: material(shaders.advection, {
        uVelocity: { value: null },
        uSource: { value: null },
        velTexel: { value: new THREE.Vector2() },
        dt: { value: 0 },
        dissipation: { value: 0 },
      }),
      curl: material(shaders.curl, { uVelocity: { value: null } }),
      vorticity: material(shaders.vorticity, {
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: CURL },
        dt: { value: 0 },
      }),
      divergence: material(shaders.divergence, { uVelocity: { value: null } }),
      clear: material(shaders.clear, { uTexture: { value: null }, value: { value: 0.8 } }),
      pressure: material(shaders.pressure, { uPressure: { value: null }, uDivergence: { value: null } }),
      gradient: material(shaders.gradient, { uPressure: { value: null }, uVelocity: { value: null } }),
      display: material(shaders.display, { uTexture: { value: null }, light: { value: 0 }, time: { value: 0 } }),
    };
    m.display.transparent = true;

    const target = (w: number, h: number, linear: boolean) =>
      new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: linear ? THREE.LinearFilter : THREE.NearestFilter,
        magFilter: linear ? THREE.LinearFilter : THREE.NearestFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
        depthBuffer: false,
      });
    const double = (w: number, h: number, linear: boolean): Double => {
      const d = { read: target(w, h, linear), write: target(w, h, linear), swap: () => {} };
      d.swap = () => {
        [d.read, d.write] = [d.write, d.read];
      };
      return d;
    };

    let sim = { w: 1, h: 1 };
    let dyeSize = { w: 1, h: 1 };
    let velocity: Double, dye: Double, pressure: Double, divergence: Target, curl: Target;
    const all = () => [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, divergence, curl];

    const pass = (mat: THREE.ShaderMaterial, out: Target | null, texel: { w: number; h: number }) => {
      mat.uniforms.texelSize.value.set(1 / texel.w, 1 / texel.h);
      quad.material = mat;
      renderer.setRenderTarget(out);
      renderer.render(scene, camera);
    };

    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      if (velocity) all().forEach((t) => t.dispose());
      sim = resolution(SIM_RES, w, h);
      dyeSize = resolution(DYE_RES, w, h);
      velocity = double(sim.w, sim.h, true);
      dye = double(dyeSize.w, dyeSize.h, true);
      pressure = double(sim.w, sim.h, false);
      divergence = target(sim.w, sim.h, false);
      curl = target(sim.w, sim.h, false);
    };
    resize();

    const aspect = () => canvas.clientWidth / Math.max(1, canvas.clientHeight);

    const splat = (x: number, y: number, dx: number, dy: number, color: THREE.Color) => {
      const a = aspect();
      m.splat.uniforms.aspectRatio.value = a;
      m.splat.uniforms.point.value.set(x, y);
      m.splat.uniforms.uTarget.value = velocity.read.texture;
      m.splat.uniforms.color.value.set(dx, dy, 0);
      m.splat.uniforms.radius.value = (SPLAT_RADIUS / 100) * (a > 1 ? a : 1);
      pass(m.splat, velocity.write, sim);
      velocity.swap();
      m.splat.uniforms.uTarget.value = dye.read.texture;
      m.splat.uniforms.color.value.set(color.r, color.g, color.b);
      pass(m.splat, dye.write, dyeSize);
      dye.swap();
    };

    const step = (dt: number) => {
      m.curl.uniforms.uVelocity.value = velocity.read.texture;
      pass(m.curl, curl, sim);

      m.vorticity.uniforms.uVelocity.value = velocity.read.texture;
      m.vorticity.uniforms.uCurl.value = curl.texture;
      m.vorticity.uniforms.dt.value = dt;
      pass(m.vorticity, velocity.write, sim);
      velocity.swap();

      m.divergence.uniforms.uVelocity.value = velocity.read.texture;
      pass(m.divergence, divergence, sim);

      m.clear.uniforms.uTexture.value = pressure.read.texture;
      pass(m.clear, pressure.write, sim);
      pressure.swap();

      m.pressure.uniforms.uDivergence.value = divergence.texture;
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        m.pressure.uniforms.uPressure.value = pressure.read.texture;
        pass(m.pressure, pressure.write, sim);
        pressure.swap();
      }

      m.gradient.uniforms.uPressure.value = pressure.read.texture;
      m.gradient.uniforms.uVelocity.value = velocity.read.texture;
      pass(m.gradient, velocity.write, sim);
      velocity.swap();

      m.advection.uniforms.velTexel.value.set(1 / sim.w, 1 / sim.h);
      m.advection.uniforms.dt.value = dt;
      m.advection.uniforms.uVelocity.value = velocity.read.texture;
      m.advection.uniforms.uSource.value = velocity.read.texture;
      m.advection.uniforms.dissipation.value = 0.25;
      pass(m.advection, velocity.write, sim);
      velocity.swap();

      m.advection.uniforms.uVelocity.value = velocity.read.texture;
      m.advection.uniforms.uSource.value = dye.read.texture;
      m.advection.uniforms.dissipation.value = 0.9;
      pass(m.advection, dye.write, dyeSize);
      dye.swap();
    };

    const display = (time: number) => {
      m.display.uniforms.uTexture.value = dye.read.texture;
      m.display.uniforms.light.value = state.current.light ? 1 : 0;
      m.display.uniforms.time.value = time % 100;
      pass(m.display, null, { w: canvas.width, h: canvas.height });
    };

    // Ink: each stroke picks the next colour; intensity is kept low so the
    // simulation reads as smoke rather than paint.
    let hue = 0;
    const ink = (strength = 0.16) => {
      const list = state.current.colors;
      const c = new THREE.Color(list[hue++ % list.length] || "#d8bb8a");
      return c.multiplyScalar(state.current.light ? strength * 1.4 : strength);
    };

    // Pointer stirring.
    const pointer = { x: 0.5, y: 0.5, moved: false, last: -Infinity, color: ink() };
    const source = eventSource.current ?? canvas;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      const a = aspect();
      let dx = x - pointer.x;
      let dy = y - pointer.y;
      if (a < 1) dx *= a;
      if (a > 1) dy /= a;
      if (!pointer.moved) {
        pointer.moved = true;
        pointer.color = ink();
      } else if (Math.abs(dx) + Math.abs(dy) > 0) {
        splat(x, y, dx * SPLAT_FORCE, dy * SPLAT_FORCE, pointer.color);
      }
      pointer.x = x;
      pointer.y = y;
      pointer.last = performance.now();
    };
    const onLeave = () => (pointer.moved = false);
    const onDown = () => (pointer.color = ink(0.3));
    source.addEventListener("pointermove", onMove, { passive: true });
    source.addEventListener("pointerleave", onLeave);
    source.addEventListener("pointerdown", onDown);

    // An opening bloom so the scene never starts empty.
    const bloom = () => {
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        splat(0.5 + Math.cos(angle) * 0.12, 0.45 + Math.sin(angle) * 0.12, Math.cos(angle) * 1400, Math.sin(angle) * 1400, ink(0.3));
      }
    };
    // Bloom as the page is revealed (straight away when there's no preloader).
    const stopIntro = afterIntro(bloom);

    // A slow current when idle (touch screens, or a still mouse).
    let drift = 0;
    const idle = (t: number) => {
      if (performance.now() - pointer.last < 2200) return;
      drift += 1;
      if (drift % 3) return;
      const s = t * 0.00022;
      const x = 0.5 + Math.sin(s * 1.7) * 0.32;
      const y = 0.5 + Math.sin(s * 2.3 + 1.2) * 0.26;
      const dx = Math.cos(s * 1.7) * 1.7 * 0.32;
      const dy = Math.cos(s * 2.3 + 1.2) * 2.3 * 0.26;
      if (drift % 120 === 0) pointer.color = ink(0.18);
      splat(x, y, dx * 420, dy * 420, pointer.color.clone().multiplyScalar(0.8));
    };

    let frame = 0;
    let last = performance.now();
    const loop = (t: number) => {
      frame = 0;
      if (!state.current.active) return;
      const dt = Math.min((t - last) / 1000, 1 / 60);
      last = t;
      idle(t);
      step(dt);
      display(t / 1000);
      frame = requestAnimationFrame(loop);
    };

    if (still) {
      // Reduced motion: let the opening bloom settle, show it once, and stop.
      for (let i = 0; i < 90; i++) step(1 / 60);
      display(0);
    } else {
      wake.current = () => {
        if (frame || !state.current.active) return;
        last = performance.now();
        frame = requestAnimationFrame(loop);
      };
      wake.current();
    }

    let size = `${canvas.clientWidth}x${canvas.clientHeight}`;
    const ro = new ResizeObserver(() => {
      const next = `${canvas.clientWidth}x${canvas.clientHeight}`;
      if (next === size) return;
      size = next;
      resize();
      bloom();
      if (still) {
        for (let i = 0; i < 90; i++) step(1 / 60);
        display(0);
      }
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      stopIntro();
      wake.current = () => {};
      ro.disconnect();
      source.removeEventListener("pointermove", onMove);
      source.removeEventListener("pointerleave", onLeave);
      source.removeEventListener("pointerdown", onDown);
      all().forEach((t) => t.dispose());
      Object.values(m).forEach((mat) => mat.dispose());
      quad.geometry.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still]);

  return <canvas ref={canvasRef} className="block size-full" />;
}
