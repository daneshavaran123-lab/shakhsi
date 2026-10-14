"use client";

import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * A cluster of glossy objects (gold, lacquer black, bone and glass) held
 * together by a soft spring and shoved around by the pointer. Bodies are
 * spheres for the physics; capsules and rings just ride along. Scroll
 * progress loosens the spring so the cluster drifts apart.
 */

type Props = {
  active: boolean;
  still: boolean;
  accent: string;
  /** 0 → tight cluster, 1 → scattered. Written by the section's scroll handler. */
  spread: MutableRefObject<number>;
  eventSource: RefObject<HTMLElement | null>;
  count?: number;
  /** Where the cluster sits: -1 left, 0 centre, 1 right. */
  side?: number;
};

type Body = {
  p: THREE.Vector3;
  v: THREE.Vector3;
  r: number;
  shape: "sphere" | "capsule" | "torus";
  material: number;
  spin: THREE.Vector3;
};

function rand(seed: number) {
  // Deterministic, so server and client agree and every visit looks composed.
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function makeBodies(count: number): Body[] {
  return Array.from({ length: count }, (_, i) => {
    const r = 0.28 + rand(i + 1) * 0.42;
    const a = rand(i + 11) * Math.PI * 2;
    const d = 1.2 + rand(i + 21) * 2.6;
    const kind = rand(i + 31);
    return {
      p: new THREE.Vector3(Math.cos(a) * d, Math.sin(a) * d * 0.7, (rand(i + 41) - 0.5) * 1.6),
      v: new THREE.Vector3(),
      r,
      shape: kind < 0.6 ? "sphere" : kind < 0.88 ? "capsule" : "torus",
      material: i % 4,
      spin: new THREE.Vector3(rand(i + 51) - 0.5, rand(i + 61) - 0.5, rand(i + 71) - 0.5).multiplyScalar(0.6),
    };
  });
}

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Bodies({
  count,
  still,
  spread,
  accent,
  eventSource,
}: {
  count: number;
  still: boolean;
  spread: MutableRefObject<number>;
  accent: string;
  eventSource: RefObject<HTMLElement | null>;
}) {
  const bodies = useMemo(() => makeBodies(count), [count]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { camera, pointer } = useThree();
  const hand = useRef({ p: new THREE.Vector3(99, 99, 0), prev: new THREE.Vector3(99, 99, 0), r: 1.1 });
  // The pointer only counts while it is actually over the section.
  const present = useRef(false);
  useEffect(() => {
    const el = eventSource.current;
    if (!el) return;
    const on = () => (present.current = true);
    const off = () => (present.current = false);
    el.addEventListener("pointermove", on);
    el.addEventListener("pointerleave", off);
    return () => {
      el.removeEventListener("pointermove", on);
      el.removeEventListener("pointerleave", off);
    };
  }, [eventSource]);

  const materials = useMemo(
    () => [
      new THREE.MeshPhysicalMaterial({ color: accent, metalness: 1, roughness: 0.22, clearcoat: 0.4 }),
      new THREE.MeshPhysicalMaterial({ color: "#0e0e10", metalness: 0.2, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
      new THREE.MeshPhysicalMaterial({ color: "#ede8df", metalness: 0, roughness: 0.32, clearcoat: 0.8, sheen: 0.4 }),
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        metalness: 0,
        roughness: 0.04,
        transmission: 1,
        thickness: 0.9,
        ior: 1.45,
        attenuationColor: new THREE.Color(accent),
        attenuationDistance: 2.5,
      }),
    ],
    [accent],
  );
  useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

  const geometries = useMemo(
    () => ({
      sphere: new THREE.SphereGeometry(1, 48, 48),
      capsule: new THREE.CapsuleGeometry(0.62, 0.9, 12, 32),
      torus: new THREE.TorusGeometry(0.72, 0.3, 24, 64),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

  const tmp = useMemo(() => ({ n: new THREE.Vector3(), dir: new THREE.Vector3(), target: new THREE.Vector3() }), []);

  // Settle once so the first frame is already a composed cluster.
  useMemo(() => {
    for (let s = 0; s < 240; s++) step(bodies, 1 / 60, 0, null, tmp);
  }, [bodies, tmp]);

  useFrame((_, delta) => {
    if (still) return;
    // Pointer on the z = 0 plane.
    tmp.dir.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const dist = -camera.position.z / tmp.dir.z;
    hand.current.prev.copy(hand.current.p);
    hand.current.p.copy(camera.position).addScaledVector(tmp.dir, dist);

    const dt = Math.min(delta, 1 / 30);
    const h = present.current ? hand.current : null;
    step(bodies, dt / 2, spread.current, h, tmp);
    step(bodies, dt / 2, spread.current, h, tmp);

    bodies.forEach((b, i) => {
      const m = meshes.current[i];
      if (!m) return;
      m.position.copy(b.p);
      m.rotation.x += (b.spin.x + b.v.y * 0.2) * dt;
      m.rotation.y += (b.spin.y + b.v.x * 0.2) * dt;
      m.rotation.z += b.spin.z * dt;
    });
  });

  return (
    <>
      {bodies.map((b, i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          position={b.p}
          rotation={[b.spin.x * 4, b.spin.y * 4, b.spin.z * 4]}
          scale={b.shape === "sphere" ? b.r : b.r * 0.85}
          geometry={geometries[b.shape]}
          material={materials[b.material]}
        />
      ))}
    </>
  );
}

function step(
  bodies: Body[],
  dt: number,
  spread: number,
  hand: { p: THREE.Vector3; prev: THREE.Vector3; r: number } | null,
  tmp: { n: THREE.Vector3; dir: THREE.Vector3; target: THREE.Vector3 },
) {
  const pull = 2.4 * (1 - spread * 0.85);
  for (const b of bodies) {
    // Spring toward the centre (flattened a little in depth).
    b.v.x -= b.p.x * pull * dt;
    b.v.y -= b.p.y * pull * dt;
    b.v.z -= b.p.z * pull * 1.6 * dt;
    // Scroll pushes everything outward and slightly up.
    if (spread > 0) {
      tmp.n.copy(b.p).normalize();
      b.v.addScaledVector(tmp.n, spread * 3.2 * dt);
      b.v.y += spread * 0.6 * dt;
    }
    b.v.multiplyScalar(Math.pow(0.18, dt)); // drag
    b.p.addScaledVector(b.v, dt);

    // The pointer is a solid ball that shoves.
    if (hand) {
      tmp.n.subVectors(b.p, hand.p);
      tmp.n.z *= 0.5;
      const d = tmp.n.length();
      const min = hand.r + b.r;
      if (d < min && d > 1e-4) {
        tmp.n.divideScalar(d);
        b.p.addScaledVector(tmp.n, min - d);
        const handSpeed = tmp.target.subVectors(hand.p, hand.prev).length() / Math.max(dt, 1e-3);
        b.v.addScaledVector(tmp.n, Math.min(14, 2 + handSpeed * 0.15));
      }
    }
  }
  // Body–body collisions.
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      tmp.n.subVectors(b.p, a.p);
      const d = tmp.n.length();
      const min = a.r + b.r;
      if (d >= min || d < 1e-5) continue;
      tmp.n.divideScalar(d);
      const overlap = min - d;
      const wa = b.r ** 3 / (a.r ** 3 + b.r ** 3);
      a.p.addScaledVector(tmp.n, -overlap * wa);
      b.p.addScaledVector(tmp.n, overlap * (1 - wa));
      // Exchange the velocity along the normal, a little bouncy.
      const rel = tmp.dir.subVectors(b.v, a.v).dot(tmp.n);
      if (rel < 0) {
        const impulse = -rel * 0.6;
        a.v.addScaledVector(tmp.n, -impulse * wa);
        b.v.addScaledVector(tmp.n, impulse * (1 - wa));
      }
    }
  }
}

function Rig({ side }: { side: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const narrow = aspect < 0.8;
    // Frame the cluster beside the headline (or above it on narrow screens).
    const x = narrow ? 0 : -side * 2.1;
    const y = narrow ? -2.2 : -0.4;
    camera.position.set(x, y, narrow ? 15 : 10.5);
    camera.lookAt(x, y, 0);
  }, [camera, size, side]);
  return null;
}

export default function Cluster({ active, still, accent, spread, eventSource, count = 22, side = 0 }: Props) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active && !still ? "always" : "demand"}
      camera={{ fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <Rig side={side} />
      <Environment />
      <directionalLight position={[4, 6, 6]} intensity={2.2} />
      <pointLight position={[-5, -2, 3]} intensity={30} color={accent} />
      <Bodies count={count} still={still} spread={spread} accent={accent} eventSource={eventSource} />
    </Canvas>
  );
}
