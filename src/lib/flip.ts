/** Where a shared-element flight starts: the card image as it sits on the page. */
export type FlipOrigin = { rect: DOMRect; src: string; radius: string };

export function flipOriginOf(frame: HTMLElement | null): FlipOrigin | null {
  const img = frame?.querySelector("img");
  if (!frame || !img || matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  return {
    rect: frame.getBoundingClientRect(),
    src: img.currentSrc || img.src,
    radius: getComputedStyle(frame).borderTopLeftRadius || "16px",
  };
}

/**
 * Flies a copy of the origin image onto `target` (an object-fit: contain
 * <img>), landing exactly on the visible picture, then hands over to it.
 * Returns a cancel function.
 */
export function flyImage(
  origin: FlipOrigin,
  target: HTMLImageElement,
  natural: { width: number; height: number },
  onDone: () => void,
) {
  const box = target.getBoundingClientRect();
  const fit = Math.min(box.width / natural.width, box.height / natural.height);
  const w = natural.width * fit;
  const h = natural.height * fit;
  const to = { left: box.left + (box.width - w) / 2, top: box.top + (box.height - h) / 2, width: w, height: h };

  const clone = document.createElement("img");
  clone.src = origin.src;
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed",
    zIndex: "60",
    objectFit: "cover",
    pointerEvents: "none",
    left: "0px",
    top: "0px",
    margin: "0",
    willChange: "left, top, width, height, border-radius",
    boxShadow: "0 40px 100px -30px rgb(0 0 0 / 0.75)",
  });
  document.body.appendChild(clone);

  const r = origin.rect;
  const animation = clone.animate(
    [
      { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, borderRadius: origin.radius },
      { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: "8px" },
    ],
    { duration: 850, easing: "cubic-bezier(0.76, 0, 0.24, 1)", fill: "forwards" },
  );
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    onDone();
    // Let the real image paint under the copy before removing it.
    requestAnimationFrame(() => requestAnimationFrame(() => clone.remove()));
  };
  animation.onfinish = finish;
  return () => {
    animation.cancel();
    clone.remove();
    finish();
  };
}
