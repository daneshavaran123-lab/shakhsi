"use client";

import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * A touch table in miniature. Every project is a glossy tile (gold, lacquer
 * black, bone or glass) floating on the screen with a few loose beads; a
 * soft spring gathers them, they collide, and a finger — the pointer, or a
 * ghost finger when nobody is touching — shoves them around. Tapping a tile
 * brings it forward and flips it; the page shows that project's card.
 */

export type TableTile = { id: string; mono: string; name: string; index: string };

type Props = {
  tiles: TableTile[];
  active: boolean;
  still: boolean;
  accent: string;
  narrow: boolean;
  eventSource: RefObject<HTMLElement | null>;
  selected: number | null;
  onSelect: (index: number | null) => void;
  onTouch: (index: number) => void;
  onHover: (index: number | null) => void;
  /** Set to true while a person is interacting; the page fades its prompt. */
  engaged: MutableRefObject<boolean>;
};

type Body = {
  p: THREE.Vector3;
  v: THREE.Vector3;
  r: number;
  tile: number | null; // index into tiles, or null for a bead
  finish: number;
  shape: "sphere" | "capsule" | "torus";
  spin: THREE.Vector3;
  sel: number; // 0 → resting, 1 → brought forward
  flip: number;
};

const TILE = 1.3;
const FINISH_INK = ["#16130e", "#d8bb8a", "#16130e", "#ffffff"];

function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function makeBodies(tiles: number, beads: number): Body[] {
  const list: Body[] = [];
  for (let i = 0; i < tiles + beads; i++) {
    const isTile = i < tiles;
    const a = rand(i + 11) * Math.PI * 2;
    const d = 1 + rand(i + 21) * 3;
    const kind = rand(i + 31);
    list.push({
      p: new THREE.Vector3(Math.cos(a) * d, Math.sin(a) * d * 0.6, (rand(i + 41) - 0.5) * 1.2),
      v: new THREE.Vector3(),
      r: isTile ? TILE * 0.62 : 0.24 + rand(i + 1) * 0.22,
      tile: isTile ? i : null,
      finish: i % 4,
      shape: kind < 0.55 ? "sphere" : kind < 0.85 ? "capsule" : "torus",
      spin: new THREE.Vector3(rand(i + 51) - 0.5, rand(i + 61) - 0.5, rand(i + 71) - 0.5).multiplyScalar(0.8),
      sel: 0,
      flip: 0,
    });
  }
  return list;
}

/** The face printed on each tile: index, monogram and project name. */
function faceTexture(tile: TableTile, ink: string, fonts: { display: string; body: string }) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = 0.7;
  ctx.font = `500 34px ${fonts.body}`;
  ctx.fillText(tile.index, 256, 70);
  ctx.globalAlpha = 1;
  ctx.font = `400 230px ${fonts.display}`;
  ctx.fillText(tile.mono, 256, 245);
  ctx.globalAlpha = 0.85;
  ctx.font = `500 40px ${fonts.body}`;
  let name = tile.name;
  while (ctx.measureText(name).width > 420 && name.length > 4) name = name.slice(0, -2);
  if (name !== tile.name) name = `${name.trim()}…`;
  ctx.direction = /[؀-ۿ]/.test(name) ? "rtl" : "ltr";
  ctx.fillText(name, 256, 425);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
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

type Hand = { p: THREE.Vector3; prev: THREE.Vector3; r: number; on: boolean; ghost: boolean };

function Scene(props: Props & { fonts: { display: string; body: string } }) {
  const { tiles, still, accent, narrow, eventSource, selected, onSelect, onTouch, onHover, engaged, fonts } = props;
  const beads = narrow ? 6 : 12;
  const bodies = useMemo(() => makeBodies(tiles.length, beads), [tiles.length, beads]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const ring = useRef<THREE.Mesh>(null);
  const ripples = useRef<(THREE.Mesh | null)[]>([]);
  const rippleState = useRef(Array.from({ length: 4 }, () => ({ t: 1, x: 0, y: 0 })));
  const { camera, pointer, size, invalidate } = useThree();
  const hand = useRef<Hand>({ p: new THREE.Vector3(99, 99, 0), prev: new THREE.Vector3(99, 99, 0), r: 1, on: false, ghost: false });
  const lastHuman = useRef(-1e9);
  const hovered = useRef<number | null>(null);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const touched = useRef(new Set<number>());
  const bounds = useRef({ x: 6, yMin: -3.5, yMax: 3.5 });

  const materials = useMemo(
    () => [
      new THREE.MeshPhysicalMaterial({ color: accent, metalness: 1, roughness: 0.24, clearcoat: 0.5 }),
      new THREE.MeshPhysicalMaterial({ color: "#0e0e10", metalness: 0.2, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
      new THREE.MeshPhysicalMaterial({ color: "#ede8df", roughness: 0.32, clearcoat: 0.8, sheen: 0.4 }),
      new THREE.MeshPhysicalMaterial({
        color: "#ffffff",
        roughness: 0.05,
        transmission: 1,
        thickness: 0.8,
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
      tile: new RoundedBoxGeometry(TILE, TILE, 0.34, 6, 0.2),
      face: new THREE.PlaneGeometry(TILE * 0.86, TILE * 0.86),
      sphere: new THREE.SphereGeometry(1, 40, 40),
      capsule: new THREE.CapsuleGeometry(0.6, 0.9, 10, 28),
      torus: new THREE.TorusGeometry(0.72, 0.3, 20, 56),
      ring: new THREE.RingGeometry(0.92, 1, 64),
    }),
    [],
  );
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

  const faces = useMemo(
    () =>
      tiles.map((tile, i) => {
        const finish = bodies[i]?.finish ?? 0;
        return new THREE.MeshBasicMaterial({
          map: faceTexture(tile, FINISH_INK[finish], fonts),
          transparent: true,
          toneMapped: false,
        });
      }),
    [tiles, bodies, fonts],
  );
  useEffect(() => () => faces.forEach((m) => (m.map?.dispose(), m.dispose())), [faces]);

  const ringMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
    [accent],
  );
  const rippleMaterials = useMemo(
    () =>
      Array.from(
        { length: 4 },
        () => new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
      ),
    [accent],
  );

  // Visible area at z = 0, so bodies stay on the "screen".
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const dist = cam.position.z;
    const halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * dist;
    const cy = cam.position.y;
    bounds.current = { x: halfH * (size.width / size.height) - 0.8, yMin: cy - halfH + 0.8, yMax: cy + halfH - 0.8 };
  }, [camera, size]);

  // Real pointer presence and taps.
  useEffect(() => {
    const el = eventSource.current;
    if (!el) return;
    const move = () => {
      hand.current.on = true;
      hand.current.ghost = false;
      lastHuman.current = performance.now();
      engaged.current = true;
    };
    const leave = () => {
      hand.current.on = false;
    };
    const down = () => {
      move();
      const slot = rippleState.current.reduce((a, b, i, arr) => (b.t > arr[a].t ? i : a), 0);
      rippleState.current[slot] = { t: 0, x: hand.current.p.x, y: hand.current.p.y };
      hand.current.r = 1.9; // a tap is a bigger shove
      invalidate();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
    };
  }, [eventSource, engaged, invalidate]);

  const tmp = useMemo(() => ({ n: new THREE.Vector3(), dir: new THREE.Vector3(), d2: new THREE.Vector3() }), []);

  useMemo(() => {
    for (let s = 0; s < 260; s++) step(1 / 60, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodies]);

  function step(dt: number, h: Hand | null) {
    const pull = narrow ? 1.9 : 1.5;
    const sel = selectedRef.current;
    for (const b of bodies) {
      const chosen = b.tile !== null && b.tile === sel;
      b.sel += ((chosen ? 1 : 0) - b.sel) * Math.min(1, dt * 6);
      // Gather toward the centre; the chosen tile comes forward instead.
      const tz = chosen ? 2.6 : 0;
      b.v.x -= b.p.x * pull * (chosen ? 3 : 1) * dt;
      b.v.y -= b.p.y * pull * (chosen ? 3 : 1) * dt;
      b.v.z -= (b.p.z - tz) * pull * 2 * dt;
      b.v.multiplyScalar(Math.pow(0.2, dt));
      b.p.addScaledVector(b.v, dt);

      // Soft walls at the edge of the screen.
      const { x: bx, yMin, yMax } = bounds.current;
      if (Math.abs(b.p.x) > bx) {
        b.p.x = Math.sign(b.p.x) * bx;
        b.v.x *= -0.5;
      }
      if (b.p.y > yMax || b.p.y < yMin) {
        b.p.y = THREE.MathUtils.clamp(b.p.y, yMin, yMax);
        b.v.y *= -0.5;
      }

      if (h?.on && !chosen) {
        tmp.n.subVectors(b.p, h.p);
        tmp.n.z *= 0.4;
        const d = tmp.n.length();
        const min = h.r + b.r;
        if (d < min && d > 1e-4) {
          tmp.n.divideScalar(d);
          b.p.addScaledVector(tmp.n, (min - d) * 0.6);
          const speed = tmp.d2.subVectors(h.p, h.prev).length() / Math.max(dt, 1e-3);
          b.v.addScaledVector(tmp.n, Math.min(12, 1.5 + speed * 0.12));
          if (b.tile !== null && !h.ghost && !touched.current.has(b.tile)) {
            touched.current.add(b.tile);
            onTouch(b.tile);
          }
        }
      }
    }
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        tmp.n.subVectors(b.p, a.p);
        const d = tmp.n.length();
        const min = a.r * (1 + a.sel * 0.6) + b.r * (1 + b.sel * 0.6);
        if (d >= min || d < 1e-5) continue;
        tmp.n.divideScalar(d);
        const overlap = min - d;
        const ma = a.r ** 3 * (1 + a.sel * 20);
        const mb = b.r ** 3 * (1 + b.sel * 20);
        const wa = mb / (ma + mb);
        a.p.addScaledVector(tmp.n, -overlap * wa);
        b.p.addScaledVector(tmp.n, overlap * (1 - wa));
        const rel = tmp.dir.subVectors(b.v, a.v).dot(tmp.n);
        if (rel < 0) {
          const impulse = -rel * 0.6;
          a.v.addScaledVector(tmp.n, -impulse * wa);
          b.v.addScaledVector(tmp.n, impulse * (1 - wa));
        }
      }
    }
  }

  useFrame((state, delta) => {
    const now = performance.now();
    const h = hand.current;
    h.prev.copy(h.p);
    h.r += (1 - h.r) * Math.min(1, delta * 4);

    if (h.on && !h.ghost) {
      // Real pointer, projected onto the z = 0 plane.
      tmp.dir.set(pointer.x, pointer.y, 0.5).unproject(camera).sub(camera.position).normalize();
      const dist = -camera.position.z / tmp.dir.z;
      h.p.copy(camera.position).addScaledVector(tmp.dir, dist);
    } else if (!still && now - lastHuman.current > 3500) {
      // Ghost finger: a slow demonstration sweep every few seconds.
      const cycle = ((now - lastHuman.current - 3500) / 1000) % 6;
      h.ghost = true;
      h.on = cycle < 2.2;
      if (h.on) {
        const k = cycle / 2.2;
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        const sx = bounds.current.x * 0.9;
        h.p.set(THREE.MathUtils.lerp(-sx, sx, e), Math.sin(k * Math.PI * 2) * 0.9, 0);
        if (cycle - delta < 1.1 && cycle >= 1.1) {
          const slot = rippleState.current.reduce((a, b, i, arr) => (b.t > arr[a].t ? i : a), 0);
          rippleState.current[slot] = { t: 0, x: h.p.x, y: h.p.y };
        }
      }
    }

    if (!still) {
      const dt = Math.min(delta, 1 / 30);
      step(dt / 2, h);
      step(dt / 2, h);
    }

    bodies.forEach((b, i) => {
      const g = groups.current[i];
      if (!g) return;
      g.position.copy(b.p);
      if (b.tile !== null) {
        // Tiles keep their faces to the viewer, leaning with their motion.
        b.flip += ((b.sel > 0.5 ? Math.PI * 2 : 0) - b.flip) * Math.min(1, delta * 3);
        const hov = hovered.current === b.tile ? 1 : 0;
        g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -b.v.y * 0.12 + Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.08, 0.1);
        g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, b.v.x * 0.12 + b.flip + Math.cos(state.clock.elapsedTime * 0.5 + i) * 0.1, 0.1);
        g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, -b.v.x * 0.04, 0.1);
        const s = 1 + hov * 0.1 + b.sel * 0.35;
        g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.15));
      } else {
        g.rotation.x += (b.spin.x + b.v.y * 0.2) * delta;
        g.rotation.y += (b.spin.y + b.v.x * 0.2) * delta;
      }
    });

    // The finger ring and its ripples.
    if (ring.current) {
      ring.current.position.set(h.p.x, h.p.y, 1.2);
      ring.current.scale.setScalar(h.r * 0.75);
      ringMaterial.opacity += ((h.on ? (h.ghost ? 0.35 : 0.8) : 0) - ringMaterial.opacity) * 0.15;
    }
    rippleState.current.forEach((r, i) => {
      const m = ripples.current[i];
      if (!m) return;
      r.t = Math.min(1, r.t + delta / 0.9);
      m.position.set(r.x, r.y, 1.1);
      m.scale.setScalar(0.4 + r.t * 2.6);
      rippleMaterials[i].opacity = (1 - r.t) * 0.7;
    });
  });

  const over = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = i;
    onHover(i);
  };
  const out = (i: number) => () => {
    if (hovered.current === i) {
      hovered.current = null;
      onHover(null);
    }
  };

  return (
    <>
      {bodies.map((b, i) => (
        <group
          key={i}
          ref={(g) => {
            groups.current[i] = g;
          }}
          position={b.p}
          scale={b.tile !== null ? 1 : b.r * (b.shape === "sphere" ? 1 : 0.85)}
        >
          {b.tile !== null ? (
            <>
              <mesh
                geometry={geometries.tile}
                material={materials[b.finish]}
                onPointerOver={over(b.tile)}
                onPointerOut={out(b.tile)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(selectedRef.current === b.tile ? null : b.tile);
                  if (b.tile !== null && !touched.current.has(b.tile)) {
                    touched.current.add(b.tile);
                    onTouch(b.tile);
                  }
                  invalidate();
                }}
              />
              <mesh geometry={geometries.face} material={faces[b.tile]} position={[0, 0, 0.175]} />
              <mesh geometry={geometries.face} material={faces[b.tile]} position={[0, 0, -0.175]} rotation={[0, Math.PI, 0]} />
            </>
          ) : (
            <mesh geometry={geometries[b.shape]} material={materials[b.finish]} />
          )}
        </group>
      ))}
      <mesh ref={ring} geometry={geometries.ring} material={ringMaterial} />
      {rippleMaterials.map((m, i) => (
        <mesh
          key={i}
          ref={(r) => {
            ripples.current[i] = r;
          }}
          geometry={geometries.ring}
          material={m}
        />
      ))}
    </>
  );
}

function Rig({ narrow }: { narrow: boolean }) {
  const { camera } = useThree();
  useEffect(() => {
    // Aim a little low so the cluster floats above the on-screen prompt.
    const y = narrow ? -1.6 : -0.9;
    camera.position.set(0, y, narrow ? 13 : 10.5);
    camera.lookAt(0, y, 0);
  }, [camera, narrow]);
  return null;
}

export default function TouchTable(props: Props) {
  const { active, still, accent, narrow, eventSource, onSelect } = props;

  // The faces use the site's own type; wait for it before printing them.
  const fonts = useMemo(() => {
    if (typeof document === "undefined") return { display: "serif", body: "sans-serif" };
    const probe = document.createElement("span");
    probe.className = "font-display";
    document.body.appendChild(probe);
    const display = getComputedStyle(probe).fontFamily;
    probe.remove();
    return { display, body: getComputedStyle(document.body).fontFamily };
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active && !still ? "always" : "demand"}
      camera={{ fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      onPointerMissed={() => onSelect(null)}
      style={{ touchAction: "pan-y" }}
    >
      <Rig narrow={narrow} />
      <Environment />
      <directionalLight position={[4, 6, 6]} intensity={2.2} />
      <pointLight position={[-5, -2, 4]} intensity={30} color={accent} />
      <Scene {...props} fonts={fonts} />
    </Canvas>
  );
}
