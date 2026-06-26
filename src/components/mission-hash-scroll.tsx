"use client";

import { useEffect } from "react";

export function MissionHashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const scrollToTarget = () => {
      const target = document.querySelector(hash);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    const frame = window.requestAnimationFrame(scrollToTarget);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
