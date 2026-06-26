"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function scrollToHashTarget(hash: string, attempt = 0) {
  if (!hash) return;
  const target = document.querySelector(hash);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (attempt < 12) {
    window.setTimeout(() => scrollToHashTarget(hash, attempt + 1), 50);
  }
}

export function MissionHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const frame = window.requestAnimationFrame(() => {
      scrollToHashTarget(hash);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    function handleHashChange() {
      scrollToHashTarget(window.location.hash);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return null;
}
