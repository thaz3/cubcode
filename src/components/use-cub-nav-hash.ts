"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useCubNavLocation() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  return { pathname, hash };
}
