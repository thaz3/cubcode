"use client";

import { useEffect, useRef } from "react";
import { clearParentUnlockOnCubViewAction } from "@/lib/actions/parent-pin";

/**
 * End the parent unlock session when Cub view is actually shown.
 * Runs on client mount only — not on link prefetch or RSC cache refreshes,
 * which previously cleared the cookie while the parent was still on dashboard.
 */
export function ClearParentUnlockOnCubView() {
  const cleared = useRef(false);

  useEffect(() => {
    if (cleared.current) return;
    cleared.current = true;
    void clearParentUnlockOnCubViewAction();
  }, []);

  return null;
}
