"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";

/**
 * A quiet companion cursor: a ring that trails the pointer, swells over
 * interactive elements and shows a short label on `[data-cursor]` targets.
 * Mouse-only; touch and reduced-motion visitors never see it.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<{ hover: boolean; label: string | null; down: boolean; visible: boolean }>({
    hover: false,
    label: null,
    down: false,
    visible: false,
  });
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    const fine = matchMedia("(pointer: fine)").matches;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      const interactive = target?.closest("a, button, [role=button], input, label");
      setState((s) => {
        const label = labelled?.dataset.cursor ?? null;
        const hover = !!interactive || !!labelled;
        if (s.label === label && s.hover === hover && s.visible) return s;
        return { ...s, label, hover, visible: true };
      });
    };
    const leave = () => setState((s) => ({ ...s, visible: false }));
    const down = () => setState((s) => ({ ...s, down: true }));
    const up = () => setState((s) => ({ ...s, down: false }));

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [x, y]);

  if (!enabled) return null;

  const size = state.label ? 84 : state.hover ? 44 : 14;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[80]"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        animate={{
          width: size,
          height: size,
          opacity: state.visible ? 1 : 0,
          scale: state.down ? 0.85 : 1,
          backgroundColor: state.label ? "var(--accent)" : "rgba(0,0,0,0)",
          borderColor: state.label ? "var(--accent)" : "var(--foreground)",
          borderWidth: state.hover && !state.label ? 1 : state.label ? 0 : 1.5,
        }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{ borderStyle: "solid", mixBlendMode: state.label ? "normal" : "difference" }}
      >
        <AnimatePresence>
          {state.label && (
            <motion.span
              key={state.label}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
              className="px-2 text-center text-[0.7rem] leading-tight font-medium text-accent-foreground"
            >
              {state.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
