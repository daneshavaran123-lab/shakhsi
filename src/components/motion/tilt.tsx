"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Leans toward the pointer with a soft glare that follows it. Mouse only;
 * motion-sensitive visitors get a flat card.
 */
export function Tilt({ className, children, max = 6, ...rest }: ComponentPropsWithoutRef<"article"> & { max?: number }) {
  const ref = useRef<HTMLElement>(null);
  const frame = useRef(0);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (e.pointerType !== "mouse" || !el) return;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.style.setProperty("--glare", "1");
    });
  };

  const leave = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
  };

  return (
    <article
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={cn(
        "tilt relative [transform:perspective(1100px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] transition-transform duration-500 ease-out-expo will-change-transform motion-reduce:[transform:none]",
        className,
      )}
      {...rest}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[var(--glare,0)] transition-opacity duration-500 [background:radial-gradient(28rem_circle_at_var(--gx,50%)_var(--gy,0%),rgb(255_255_255/0.08),transparent_60%)] motion-reduce:hidden"
      />
    </article>
  );
}
