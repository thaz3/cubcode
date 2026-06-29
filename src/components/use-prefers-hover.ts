"use client";

import { useEffect, useState } from "react";

/** True when the primary input supports hover (mouse/trackpad), not touch-only. */
export function usePrefersHover() {
  const [prefersHover, setPrefersHover] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    function update() {
      setPrefersHover(media.matches);
    }
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersHover;
}

/** Use native selects/date inputs instead of custom tile pickers (touch/iPad). */
export function useTouchNativeControls() {
  const prefersHover = usePrefersHover();
  return !prefersHover;
}
