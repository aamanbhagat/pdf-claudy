"use client";

import { useEffect } from "react";

/**
 * Homepage intro: hold on the hero for a beat, then glide down to the tools
 * section with a custom rAF tween (smoother + more cinematic than native
 * smooth-scroll). Plays once per tab session and bails the instant the user
 * does anything — scrolls, taps, or presses a nav key — so it never hijacks.
 * Skipped entirely under prefers-reduced-motion or when a deep-link hash is present.
 */
export function IntroScroll({
  targetId = "all-tools",
  delay = 900,
  duration = 1400,
  offset = 80,
}: {
  targetId?: string;
  delay?: number;
  duration?: number;
  offset?: number;
}) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.location.hash) return;
    if (window.scrollY > 4) return;
    try {
      if (sessionStorage.getItem("introScrolled")) return;
    } catch {}

    let raf = 0;
    let timer = 0;
    let active = true;
    const listeners: Array<[string, EventListener]> = [];

    const cleanup = () => {
      for (const [type, fn] of listeners) window.removeEventListener(type, fn);
    };
    const stop = () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      cleanup();
    };

    // Any genuine user input hands control back immediately.
    const takeover = () => stop();
    const onKey = (e: Event) => {
      const k = (e as KeyboardEvent).key;
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar", "Escape"].includes(k)) stop();
    };
    const passive = { passive: true } as AddEventListenerOptions;
    for (const t of ["wheel", "touchstart", "pointerdown"]) {
      window.addEventListener(t, takeover, passive);
      listeners.push([t, takeover]);
    }
    window.addEventListener("keydown", onKey, passive);
    listeners.push(["keydown", onKey]);

    // easeInOutCubic — gentle acceleration, long buttery deceleration.
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    timer = window.setTimeout(() => {
      if (!active) return;
      const el = document.getElementById(targetId);
      if (!el) return stop();
      try {
        sessionStorage.setItem("introScrolled", "1");
      } catch {}

      const startY = window.scrollY;
      const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
      const distance = targetY - startY;
      if (Math.abs(distance) < 8) return stop();

      let startTs = 0;
      const step = (ts: number) => {
        if (!active) return;
        if (!startTs) startTs = ts;
        const t = Math.min(1, (ts - startTs) / duration);
        window.scrollTo(0, startY + distance * ease(t));
        if (t < 1) raf = requestAnimationFrame(step);
        else stop();
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return stop;
  }, [targetId, delay, duration, offset]);

  return null;
}
