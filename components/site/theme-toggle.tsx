"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

// Read the live theme straight from <html class="dark"> (set pre-paint by the
// init script in layout). useSyncExternalStore gives a stable server snapshot
// (light) and re-renders if the class ever changes — no effect, no flash.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );

  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      aria-pressed={dark}
      title={dark ? "Switch to light" : "Switch to dark"}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-paper-deep",
        className,
      )}
    >
      {dark ? (
        <Sun className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.8} />
      ) : (
        <Moon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.8} />
      )}
    </button>
  );
}
