"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Shows a slim top bar for ~300–500ms whenever the pathname changes.
 * This is purely visual; it hides tiny waiting times and feels snappier.
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 2,
        width: visible ? "100%" : 0,
        transition: "width 450ms ease",
        background: "var(--accent, #4f78ff)",
        zIndex: 70,
      }}
    />
  );
}