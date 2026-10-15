/**
 * Motion tokens — one vocabulary for GSAP, Motion and CSS (see globals.css).
 *
 *   micro-interactions  fast and responsive     (≈0.2–0.45s)
 *   UI / sections       smooth and cinematic    (≈0.6–1.2s)
 *   hero                slower and dramatic     (≈1.4–2.6s)
 *
 * Eases are calm decelerations; nothing bounces.
 */
export const ease = {
  /** Expo out — the house curve for entrances. */
  out: [0.16, 1, 0.3, 1],
  /** Symmetric, for curtains and handoffs that both leave and arrive. */
  inOut: [0.76, 0, 0.24, 1],
  /** Quick settle for small UI responses. */
  snap: [0.22, 1, 0.36, 1],
} as const;

export const gsapEase = {
  out: "expo.out",
  reveal: "power4.out",
  inOut: "expo.inOut",
  scrub: "none",
} as const;

export const duration = {
  micro: 0.35,
  ui: 0.6,
  reveal: 1,
  section: 1.2,
  hero: 1.6,
} as const;

export const stagger = {
  word: 0.045,
  line: 0.11,
  item: 0.08,
} as const;

/** Spring presets for Motion (pointer-following and press feedback). */
export const spring = {
  press: { type: "spring", stiffness: 520, damping: 34, mass: 0.6 },
  follow: { type: "spring", stiffness: 180, damping: 22, mass: 0.5 },
  layout: { type: "spring", bounce: 0.15, duration: 0.55 },
} as const;

/** Scroll scrub lag, in seconds: enough to feel weighted, never laggy. */
export const scrub = 1.1;
