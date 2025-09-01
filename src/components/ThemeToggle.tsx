"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initial =
      saved ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setMode(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function toggle() {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button className="btn" onClick={toggle} aria-label="Toggle theme">
      {mode === "dark" ? "Light" : "Dark"}
    </button>
  );
}