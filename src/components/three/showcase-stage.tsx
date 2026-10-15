"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export type StageDevice = {
  device: "table" | "display" | "kiosk";
  /** Image shown on the screen; omitted for the kids' launcher, which is drawn live. */
  screen?: string;
};

type Props = {
  devices: StageDevice[];
  /** 0 → first device, 1 → last; written by the page's scroll handler. */
  progress: MutableRefObject<number>;
  active: boolean;
  still: boolean;
  accent: string;
  locale: "fa" | "en";
};

/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

function useImageTexture(src?: string) {
  const texture = useMemo(() => {
    if (!src) return null;
    const t = new THREE.TextureLoader().load(src);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [src]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

/**
 * The kids' launcher, painted on a canvas: a locked, friendly home screen of
 * bobbing app tiles — an illustration of "children stay inside".
 */
function useLauncherTexture(locale: "fa" | "en", still: boolean) {
  const { canvas, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 432;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return { canvas, texture };
  }, []);

  const font = useMemo(
    () => (typeof document !== "undefined" ? getComputedStyle(document.body).fontFamily : "sans-serif"),
    [],
  );

  const draw = (time: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#5ec8ff");
    sky.addColorStop(1, "#a7f3d0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Soft clouds
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (let i = 0; i < 4; i++) {
      const x = ((time * 12 + i * 220) % (w + 160)) - 80;
      ctx.beginPath();
      ctx.ellipse(x, 60 + i * 18, 70, 22, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lock badge: the launcher keeps children in.
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    roundRect(ctx, w / 2 - 120, 18, 240, 40, 20);
    ctx.fill();
    ctx.fillStyle = "#0f766e";
    ctx.font = `600 20px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.direction = locale === "fa" ? "rtl" : "ltr";
    ctx.fillText(locale === "fa" ? "🔒 محیط امن کودک" : "🔒 Safe kids’ space", w / 2, 39);

    const tiles = [
      { c: "#f97316", s: "circle" },
      { c: "#8b5cf6", s: "star" },
      { c: "#ef4444", s: "heart" },
      { c: "#10b981", s: "tri" },
      { c: "#eab308", s: "sun" },
      { c: "#3b82f6", s: "square" },
    ];
    const tw = 150;
    const gap = 36;
    const startX = (w - (tw * 3 + gap * 2)) / 2;
    tiles.forEach((tile, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const bob = still ? 0 : Math.sin(time * 2 + i) * 5;
      const x = startX + col * (tw + gap);
      const y = 92 + row * 160 + bob;
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      roundRect(ctx, x + 4, y + 8, tw, 130, 28);
      ctx.fill();
      ctx.fillStyle = tile.c;
      roundRect(ctx, x, y, tw, 130, 28);
      ctx.fill();
      ctx.fillStyle = "#fff";
      drawGlyph(ctx, tile.s, x + tw / 2, y + 65, 34, time + i);
    });
    texture.needsUpdate = true;
  };

  return { texture, draw };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGlyph(ctx: CanvasRenderingContext2D, shape: string, cx: number, cy: number, r: number, t: number) {
  ctx.beginPath();
  if (shape === "circle") ctx.arc(cx, cy, r, 0, Math.PI * 2);
  else if (shape === "square") ctx.rect(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6);
  else if (shape === "tri") {
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy + r * 0.8);
    ctx.lineTo(cx - r, cy + r * 0.8);
  } else if (shape === "heart") {
    ctx.moveTo(cx, cy + r * 0.8);
    ctx.bezierCurveTo(cx - r * 1.4, cy - r * 0.2, cx - r * 0.6, cy - r * 1.2, cx, cy - r * 0.4);
    ctx.bezierCurveTo(cx + r * 0.6, cy - r * 1.2, cx + r * 1.4, cy - r * 0.2, cx, cy + r * 0.8);
  } else if (shape === "sun") {
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + t * 0.5;
      ctx.moveTo(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8);
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, r * 0.12, 0, Math.PI * 2);
    }
  } else {
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = k % 2 === 0 ? r : r * 0.45;
      const fn = k === 0 ? "moveTo" : "lineTo";
      ctx[fn](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  }
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* Devices (primitives, metres-ish)                                    */
/* ------------------------------------------------------------------ */

const bodyWhite = new THREE.MeshStandardMaterial({ color: "#f4f4f2", roughness: 0.35, metalness: 0.05 });
const bodyDark = new THREE.MeshStandardMaterial({ color: "#1a1a1c", roughness: 0.4, metalness: 0.3 });
const glass = new THREE.MeshStandardMaterial({ color: "#0b0b0c", roughness: 0.15, metalness: 0.6 });

function Screen({ map, w, h }: { map: THREE.Texture | null; w: number; h: number }) {
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      {map ? <meshBasicMaterial map={map} toneMapped={false} /> : <meshBasicMaterial color="#111" />}
    </mesh>
  );
}

function Table({ map }: { map: THREE.Texture | null }) {
  return (
    <group position={[0, -0.25, 0]}>
      {/* Top */}
      <mesh position={[0, 0.5, 0]} material={bodyWhite} castShadow>
        <boxGeometry args={[2.3, 0.12, 1.35]} />
      </mesh>
      {/* Glass + screen */}
      <mesh position={[0, 0.561, 0]} material={glass}>
        <boxGeometry args={[1.9, 0.005, 1.1]} />
      </mesh>
      <group position={[0, 0.566, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <Screen map={map} w={1.76} h={0.99} />
      </group>
      {/* Curved-looking sides: two slabs and feet */}
      {[-1.06, 1.06].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.05, 0]} material={bodyWhite} castShadow>
            <boxGeometry args={[0.16, 0.9, 1.35]} />
          </mesh>
          <mesh position={[0, -0.38, 0]} material={bodyWhite}>
            <boxGeometry args={[0.34, 0.06, 1.35]} />
          </mesh>
        </group>
      ))}
      {/* Service box */}
      <mesh position={[0.45, 0.2, 0]} material={bodyWhite}>
        <boxGeometry args={[0.7, 0.4, 0.9]} />
      </mesh>
    </group>
  );
}

function Display({ map }: { map: THREE.Texture | null }) {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh material={bodyDark} castShadow>
        <boxGeometry args={[2.7, 1.58, 0.08]} />
      </mesh>
      <group position={[0, 0, 0.042]}>
        <Screen map={map} w={2.56} h={1.44} />
      </group>
      {/* Floor stand */}
      <mesh position={[0, -1.15, -0.05]} material={bodyDark}>
        <boxGeometry args={[0.18, 0.8, 0.08]} />
      </mesh>
      <mesh position={[0, -1.56, 0]} material={bodyDark}>
        <boxGeometry args={[1.1, 0.05, 0.6]} />
      </mesh>
    </group>
  );
}

function Kiosk({ map }: { map: THREE.Texture | null }) {
  return (
    <group position={[0, -0.1, 0]}>
      <mesh material={bodyDark} castShadow>
        <boxGeometry args={[0.95, 2.3, 0.32]} />
      </mesh>
      <group position={[0, 0.38, 0.162]}>
        <Screen map={map} w={0.8} h={1.24} />
      </group>
      {/* Accent strip and base */}
      <mesh position={[0, -0.55, 0.162]}>
        <planeGeometry args={[0.8, 0.012]} />
        <meshBasicMaterial color="#d8bb8a" toneMapped={false} />
      </mesh>
      <mesh position={[0, -1.18, 0.05]} material={bodyDark}>
        <boxGeometry args={[1.2, 0.06, 0.7]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Stage                                                               */
/* ------------------------------------------------------------------ */

function DeviceSlot({
  index,
  item,
  progress,
  count,
  drag,
  still,
  locale,
}: {
  index: number;
  item: StageDevice;
  progress: MutableRefObject<number>;
  count: number;
  drag: MutableRefObject<number>;
  still: boolean;
  locale: "fa" | "en";
}) {
  const group = useRef<THREE.Group>(null);
  const image = useImageTexture(item.screen);
  const launcher = useLauncherTexture(locale, still);
  const map = item.screen ? image : launcher.texture;

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    if (!item.screen) launcher.draw(still ? 0 : state.clock.elapsedTime);

    // Distance from the current chapter: 0 = centre stage.
    const d = progress.current * Math.max(count - 1, 1) - index;
    const visible = Math.max(0, 1 - Math.abs(d) * 1.4);
    const base = item.device === "table" ? -0.5 : item.device === "kiosk" ? -0.35 : -0.25;
    const spin = still ? 0 : Math.sin(state.clock.elapsedTime * 0.35) * 0.12;

    g.position.x = THREE.MathUtils.lerp(g.position.x, d * -3.2, 0.12);
    g.position.y = THREE.MathUtils.lerp(g.position.y, -Math.abs(d) * 0.6, 0.12);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, base + d * 0.9 + drag.current + spin, 0.08);
    g.rotation.x = item.device === "table" ? 0.35 : 0.08;
    const s = 0.75 + visible * 0.25;
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.12));
    g.visible = visible > 0.01;
  });

  return (
    <group ref={group}>
      {item.device === "table" && <Table map={map} />}
      {item.device === "display" && <Display map={map} />}
      {item.device === "kiosk" && <Kiosk map={map} />}
    </group>
  );
}

function Rig() {
  const { camera, size } = useThree();
  useEffect(() => {
    // Pull back on narrow screens so the widest device still fits.
    const aspect = size.width / size.height;
    camera.position.set(0, 0.6, aspect < 0.9 ? 7.4 : 5.6);
    camera.lookAt(0, -0.1, 0);
  }, [camera, size]);
  return null;
}

export default function ShowcaseStage({ devices, progress, active, still, accent, locale }: Props) {
  const drag = useRef(0);
  const target = useRef(0);
  const dragging = useRef<{ x: number; start: number } | null>(null);

  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 32, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onPointerDown={(e) => {
        dragging.current = { x: e.clientX, start: target.current };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        target.current = dragging.current.start + (e.clientX - dragging.current.x) * 0.008;
      }}
      onPointerUp={() => (dragging.current = null)}
      onPointerLeave={() => (dragging.current = null)}
      style={{ touchAction: "pan-y", cursor: "grab" }}
    >
      <Rig />
      <DragEase drag={drag} target={target} />
      <hemisphereLight args={["#ffffff", "#2a2420", 1.4]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} />
      <pointLight position={[-3, 1, 2]} intensity={6} color={accent} />
      {devices.map((item, i) => (
        <DeviceSlot
          key={i}
          index={i}
          item={item}
          count={devices.length}
          progress={progress}
          drag={drag}
          still={still}
          locale={locale}
        />
      ))}
      {/* Soft floor shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.7, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>
    </Canvas>
  );
}

/** Eases the drag rotation and slowly returns it to rest. */
function DragEase({ drag, target }: { drag: MutableRefObject<number>; target: MutableRefObject<number> }) {
  useFrame(() => {
    drag.current += (target.current - drag.current) * 0.1;
  });
  return null;
}
