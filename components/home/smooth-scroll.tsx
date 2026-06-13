"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Premium smooth scrolling for the homepage (Lenis — inertia/lerp wheel +
 * touch), plus the intro: hold on the hero, then glide to the tools section
 * via Lenis's sub-pixel tween for a genuinely buttery feel.
 *
 * Homepage-scoped on purpose — tool pages and editors keep native scroll, so
 * there's zero risk to the interactive canvases/modals. Plays the intro once
 * per session, bails on any user input, and is skipped under reduced motion.
 */
const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
// Gentle ease-in, long buttery ease-out — smooth without the "flat then woosh" of expo.
const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

export function SmoothScroll({ introTargetId = "all-tools" }: { introTargetId?: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: easeOutExpo,
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Intro glide — once per session, only from the top with no deep-link hash.
    let introTimer = 0;
    let started = false;
    const eligible =
      !window.location.hash &&
      window.scrollY < 4 &&
      (() => {
        try {
          return !sessionStorage.getItem("introScrolled");
        } catch {
          return true;
        }
      })();

    const cancelIntro = () => {
      if (introTimer) clearTimeout(introTimer);
      // If the glide is already running, a tiny nudge to the current position
      // cancels Lenis's programmatic animation and hands scroll back to the user.
      if (started) lenis.scrollTo(lenis.animatedScroll, { immediate: true, force: true });
      detach();
    };
    const takeover = () => cancelIntro();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ", "Spacebar", "Escape"].includes(e.key))
        cancelIntro();
    };
    const detach = () => {
      window.removeEventListener("wheel", takeover);
      window.removeEventListener("touchstart", takeover);
      window.removeEventListener("keydown", onKey);
    };

    if (eligible) {
      window.addEventListener("wheel", takeover, { passive: true });
      window.addEventListener("touchstart", takeover, { passive: true });
      window.addEventListener("keydown", onKey, { passive: true });
      introTimer = window.setTimeout(() => {
        const el = document.getElementById(introTargetId);
        if (!el) return detach();
        try {
          sessionStorage.setItem("introScrolled", "1");
        } catch {}
        started = true;
        // Numeric target (element top minus a header allowance) — deterministic.
        const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 88);
        lenis.scrollTo(target, {
          duration: 1.7,
          easing: easeInOutQuart,
          onComplete: detach,
        });
      }, 750);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (introTimer) clearTimeout(introTimer);
      detach();
      lenis.destroy();
    };
  }, [introTargetId]);

  return null;
}
