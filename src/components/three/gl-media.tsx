"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { gsap } from "@/lib/gsap";

/**
 * One fixed WebGL canvas that redraws every `[data-gl]` image on the page
 * in place: the pictures bend with scroll speed, split their colour channels
 * when moving fast, ripple and lean in under the pointer, and are uncovered
 * by an ink-edged wipe the first time they arrive. The DOM <img> stays
 * underneath as the accessible, no-WebGL fallback.
 */

const vertex = /* glsl */ `
  uniform float uVelocity;
  uniform float uHover;
  uniform vec2 uMouse;
  varying vec2 vUv;
  #define PI 3.14159265
  void main() {
    vUv = uv;
    vec3 p = position;
    p.y -= sin(uv.x * PI) * uVelocity;                         // the middle drags behind
    float d = distance(uv, uMouse);
    p.xy += (uv - uMouse) * 0.025 * uHover * smoothstep(0.6, 0.0, d); // swell under the pointer
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform vec2 uPlane;
  uniform vec2 uImage;
  uniform float uVelocity;
  uniform float uHover;
  uniform float uReveal;
  uniform float uRadius;
  uniform float uTime;
  uniform float uTop;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float roundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    // object-fit: cover
    float rp = uPlane.x / uPlane.y;
    float ri = uImage.x / uImage.y;
    vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
    vec2 k = s * (1.0 - 0.07 * uHover);
    vec2 uv = (vUv - 0.5) * k + 0.5;
    uv.y += uTop * (1.0 - k.y) * 0.5;                          // object-position: top

    // Ripple rings around the pointer.
    float d = distance(vUv, uMouse);
    uv += (vUv - uMouse) * sin(d * 28.0 - uTime * 5.0) * 0.01 * uHover * smoothstep(0.5, 0.0, d);

    // Chromatic split with speed (and a touch on hover).
    float shift = abs(uVelocity) * 0.1 + uHover * 0.002;
    vec4 c = texture2D(uTex, uv);
    c.r = texture2D(uTex, uv + vec2(0.0, shift)).r;
    c.b = texture2D(uTex, uv - vec2(0.0, shift)).b;

    // Rounded corners, matching the card.
    vec2 px = (vUv - 0.5) * uPlane;
    float box = roundedBox(px, uPlane * 0.5, uRadius);
    float corners = 1.0 - smoothstep(-1.0, 0.5, box);

    // First-arrival wipe from the bottom, with an inky edge.
    float n = (noise(vUv * vec2(6.0, 3.0) + uTime * 0.2) - 0.5) * 0.18;
    float reveal = smoothstep(0.0, 0.06, uReveal * 1.2 - (vUv.y + n));

    gl_FragColor = vec4(c.rgb, corners * reveal);
  }
`;

type Item = {
  el: HTMLElement;
  img: HTMLImageElement;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  texture: THREE.Texture;
  revealed: boolean;
  cleanup: () => void;
};

export default function GlMedia() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
    const items = new Map<HTMLElement, Item>();

    const size = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.left = -w / 2;
      camera.right = w / 2;
      camera.top = h / 2;
      camera.bottom = -h / 2;
      camera.updateProjectionMatrix();
    };
    size();
    window.addEventListener("resize", size);

    const add = (el: HTMLElement) => {
      const img = el.querySelector("img");
      if (!img) return;
      const texture = new THREE.Texture();
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        uniforms: {
          uTex: { value: texture },
          uPlane: { value: new THREE.Vector2(1, 1) },
          uImage: { value: new THREE.Vector2(1, 1) },
          uVelocity: { value: 0 },
          uHover: { value: 0 },
          uReveal: { value: 0 },
          uRadius: { value: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0 },
          uTime: { value: 0 },
          uTop: { value: getComputedStyle(img).objectPosition.split(" ")[1] === "0%" ? 1 : 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        },
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      scene.add(mesh);

      // Upload a decoded copy of whichever source the <img> settled on
      // (srcset may swap it later); the DOM element itself stays untouched.
      let loaded = "";
      const ready = () => {
        const src = img.currentSrc || img.src;
        if (!img.complete || !img.naturalWidth || src === loaded) return;
        loaded = src;
        const copy = new Image();
        copy.decoding = "async";
        copy.src = src;
        copy
          .decode()
          .then(() => {
            if (loaded !== src) return;
            texture.dispose();
            texture.image = copy;
            texture.needsUpdate = true;
            material.uniforms.uImage.value.set(copy.naturalWidth, copy.naturalHeight);
            el.dataset.glOn = "";
          })
          .catch(() => {});
      };
      img.addEventListener("load", ready);
      ready();

      const enter = () => gsap.to(material.uniforms.uHover, { value: 1, duration: 0.9, ease: "expo.out" });
      const leave = () => gsap.to(material.uniforms.uHover, { value: 0, duration: 0.9, ease: "expo.out" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        gsap.to(material.uniforms.uMouse.value, {
          x: (e.clientX - r.left) / r.width,
          y: 1 - (e.clientY - r.top) / r.height,
          duration: 0.6,
          ease: "power3.out",
        });
      };
      const host = el.closest<HTMLElement>("[data-gl-host]") ?? el;
      host.addEventListener("pointerenter", enter);
      host.addEventListener("pointerleave", leave);
      host.addEventListener("pointermove", move);

      items.set(el, {
        el,
        img,
        mesh,
        texture,
        revealed: false,
        cleanup: () => {
          img.removeEventListener("load", ready);
          host.removeEventListener("pointerenter", enter);
          host.removeEventListener("pointerleave", leave);
          host.removeEventListener("pointermove", move);
          gsap.killTweensOf([material.uniforms.uHover, material.uniforms.uReveal, material.uniforms.uMouse.value]);
          scene.remove(mesh);
          material.dispose();
          texture.dispose();
          delete el.dataset.glOn;
        },
      });
    };

    const scan = () => {
      const found = new Set(document.querySelectorAll<HTMLElement>("[data-gl]"));
      items.forEach((item, el) => {
        if (!found.has(el) || !el.isConnected) {
          item.cleanup();
          items.delete(el);
        }
      });
      found.forEach((el) => !items.has(el) && add(el));
    };
    scan();
    let pending = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    let lastY = window.scrollY;
    let velocity = 0;
    let frame = 0;
    const loop = (t: number) => {
      frame = requestAnimationFrame(loop);
      const y = window.scrollY;
      velocity += (y - lastY - velocity) * 0.12;
      lastY = y;
      const bend = Math.max(-0.14, Math.min(0.14, velocity * 0.0035));

      const w = window.innerWidth;
      const h = window.innerHeight;
      let any = false;
      items.forEach((item) => {
        const r = item.el.getBoundingClientRect();
        const onScreen = r.bottom > -50 && r.top < h + 50 && r.width > 0 && "glOn" in item.el.dataset;
        item.mesh.visible = onScreen;
        if (!item.mesh.visible) return;
        any = true;

        if (!item.revealed && r.top < h * 0.92) {
          item.revealed = true;
          gsap.to(item.mesh.material.uniforms.uReveal, { value: 1, duration: 1.6, ease: "power3.out" });
        }
        item.mesh.position.set(r.left + r.width / 2 - w / 2, -(r.top + r.height / 2) + h / 2, 0);
        item.mesh.scale.set(r.width, r.height, 1);
        const u = item.mesh.material.uniforms;
        u.uPlane.value.set(r.width, r.height);
        u.uVelocity.value = bend;
        u.uTime.value = t / 1000;
      });
      if (any) renderer.render(scene, camera);
      else renderer.clear();
    };
    frame = requestAnimationFrame(loop);
    document.documentElement.classList.add("gl-media");

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pending);
      mo.disconnect();
      window.removeEventListener("resize", size);
      items.forEach((item) => item.cleanup());
      geometry.dispose();
      renderer.dispose();
      document.documentElement.classList.remove("gl-media");
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] size-full print:hidden"
    />
  );
}
