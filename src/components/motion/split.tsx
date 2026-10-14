import { createElement, type ElementType } from "react";

import { cn } from "@/lib/utils";

type SplitProps = {
  /** One string per visual line; words within a line wrap naturally. */
  lines: string[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  /** "rise" slides words up from a mask, "scrub" ties their ink to scroll. */
  mode?: "rise" | "scrub";
  delay?: number;
};

/**
 * Server-rendered word split. Words are wrapped at render time instead of
 * mutating the DOM later, so hydration is stable and screen readers get
 * the plain sentence via aria-label.
 */
export function Split({
  lines,
  as = "p",
  className,
  lineClassName,
  mode = "rise",
  delay,
}: SplitProps) {
  const label = lines.join(" ");
  let i = 0;

  return createElement(
    as,
    {
      className,
      "aria-label": label,
      "data-split": mode,
      "data-delay": delay,
    },
    lines.map((line, li) => (
      <span key={li} aria-hidden="true" className={cn("block", lineClassName)}>
        {line.split(" ").map((word, wi, arr) => (
          <span key={wi}>
            <span className={mode === "rise" ? "split-mask" : undefined}>
              <span className="split-word" style={{ ["--i" as string]: i++ }}>
                {word}
              </span>
            </span>
            {wi < arr.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    )),
  );
}
