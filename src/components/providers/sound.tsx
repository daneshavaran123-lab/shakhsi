"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type Sound = { on: boolean; toggle: () => void };

const SoundContext = createContext<Sound>({ on: false, toggle: () => {} });

export const useSound = () => useContext(SoundContext);

/**
 * Optional sound, off until the visitor asks for it: a low, slowly breathing
 * pad and a soft tick when the pointer reaches something clickable.
 * Synthesised with Web Audio, so nothing is downloaded.
 */
export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const audio = useRef<{ ctx: AudioContext; master: GainNode } | null>(null);

  const ensure = useCallback(() => {
    if (audio.current) return audio.current;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Pad: two detuned voices through a breathing low-pass filter.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 6;
    const pad = ctx.createGain();
    pad.gain.value = 0.5;
    filter.connect(pad).connect(master);
    [55, 82.41, 110.3].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 1 ? "triangle" : "sine";
      osc.frequency.value = freq;
      osc.detune.value = (i - 1) * 7;
      const g = ctx.createGain();
      g.gain.value = i === 2 ? 0.25 : 0.5;
      osc.connect(g).connect(filter);
      osc.start();
    });
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const depth = ctx.createGain();
    depth.gain.value = 260;
    lfo.connect(depth).connect(filter.frequency);
    lfo.start();

    audio.current = { ctx, master };
    return audio.current;
  }, []);

  const toggle = useCallback(() => {
    const a = ensure();
    const next = !on;
    const now = a.ctx.currentTime;
    if (next) a.ctx.resume();
    a.master.gain.cancelScheduledValues(now);
    a.master.gain.setValueAtTime(a.master.gain.value, now);
    a.master.gain.linearRampToValueAtTime(next ? 0.09 : 0, now + (next ? 1.6 : 0.5));
    setOn(next);
  }, [ensure, on]);

  // Hover ticks.
  useEffect(() => {
    if (!on) return;
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      const a = audio.current;
      const hit = (e.target as Element | null)?.closest("a, button, [role=button]");
      if (!a || !hit || hit === last) return;
      last = hit;
      const t = a.ctx.currentTime;
      const osc = a.ctx.createOscillator();
      const g = a.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1900, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.05);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      osc.connect(g).connect(a.master);
      osc.start(t);
      osc.stop(t + 0.08);
    };
    const out = (e: PointerEvent) => {
      if (!(e.relatedTarget as Element | null)?.closest?.("a, button, [role=button]")) last = null;
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerout", out);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
    };
  }, [on]);

  // Fade out when the tab is hidden.
  useEffect(() => {
    const vis = () => {
      const a = audio.current;
      if (!a || !on) return;
      if (document.hidden) a.ctx.suspend();
      else a.ctx.resume();
    };
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [on]);

  useEffect(() => () => void audio.current?.ctx.close(), []);

  return <SoundContext.Provider value={{ on, toggle }}>{children}</SoundContext.Provider>;
}
