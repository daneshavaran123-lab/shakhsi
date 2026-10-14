"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COLS = 150;
const ROWS = 80;
const WIDTH = 24;
const DEPTH = 13;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPress;
  uniform float uPixelRatio;
  attribute float aSeed;
  varying float vLift;

  void main() {
    vec3 p = position;

    // Slow, layered swell: reads like breathing paper, not like water.
    float swell = sin(p.x * 0.35 + uTime * 0.35) * 0.18
                + sin(p.z * 0.55 - uTime * 0.25 + p.x * 0.12) * 0.14;

    // A touch dimple where the pointer meets the surface, with a soft rim.
    float d = distance(p.xz, uPointer);
    float touch = exp(-d * d * 0.45);
    float ring = sin(d * 3.2 - uTime * 2.4) * exp(-d * 0.55) * 0.08;

    p.y += swell + touch * (0.85 + uPress * 0.6) + ring;
    vLift = touch;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = (1.25 + aSeed * 0.9 + touch * 2.4) * uPixelRatio;
    gl_PointSize = size * (9.0 / -mv.z);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uInk;
  uniform vec3 uAccent;
  varying float vLift;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float a = smoothstep(0.5, 0.32, r);
    vec3 col = mix(uInk, uAccent, smoothstep(0.25, 0.85, vLift));
    gl_FragColor = vec4(col, a * (0.55 + vLift * 0.45));
  }
`;

function Field({ still }: { still: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const pointer = useRef(new THREE.Vector2(0, 2));
  const press = useRef(0);
  const lastMove = useRef(-Infinity);
  const { camera, gl } = useThree();

  const geometry = useMemo(() => {
    const positions = new Float32Array(COLS * ROWS * 3);
    const seeds = new Float32Array(COLS * ROWS);
    let i = 0;
    for (let z = 0; z < ROWS; z++) {
      for (let x = 0; x < COLS; x++) {
        positions[i * 3] = (x / (COLS - 1) - 0.5) * WIDTH;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (z / (ROWS - 1) - 0.5) * DEPTH;
        // Deterministic jitter so SSR/CSR and reloads look identical.
        seeds[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        if (seeds[i] < 0) seeds[i] += 1;
        i++;
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 2) },
      uPress: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
      uInk: { value: new THREE.Color("#161512") },
      uAccent: { value: new THREE.Color("#c8461d") },
    }),
    [gl],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") lastMove.current = performance.now();
    };
    const down = () => (press.current = 1);
    const up = () => (press.current = 0);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame((state, delta) => {
    const m = material.current;
    if (!m) return;
    if (!still) m.uniforms.uTime.value += Math.min(delta, 0.05);

    // Follow the mouse; when it rests (or on touch), drift on a slow figure-eight.
    const t = m.uniforms.uTime.value;
    const idle = performance.now() - lastMove.current > 2500;
    if (idle) {
      target.set(Math.sin(t * 0.21) * 4.5, Math.sin(t * 0.42) * 1.6 + 0.5);
      pointer.current.lerp(target, still ? 1 : 0.02);
    } else {
      ray.setFromCamera(state.pointer, camera);
      if (ray.ray.intersectPlane(plane, hit)) {
        pointer.current.lerp(target.set(hit.x, hit.z), 0.08);
      }
    }
    m.uniforms.uPointer.value.copy(pointer.current);
    m.uniforms.uPress.value += (press.current - m.uniforms.uPress.value) * 0.08;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={material}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Hero backdrop: a field of ink dots that dimples under the pointer —
 * a quiet nod to the touch screens most of the projects live on.
 */
export default function DotField({
  active,
  still,
  eventSource,
}: {
  active: boolean;
  still: boolean;
  /** Element that feeds pointer coordinates, so overlaid text doesn't block them. */
  eventSource: RefObject<HTMLElement | null>;
}) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 4.2, 7.5], fov: 42, near: 0.1, far: 50 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      onCreated={({ camera }) => camera.lookAt(0, -0.6, -1.5)}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <Field still={still} />
    </Canvas>
  );
}
