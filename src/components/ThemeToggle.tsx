"use client";
import { useEffect, useState } from "react";
import "@/styles/global.scss";

/**
 * Simple light/dark toggle.
 * - Remembers choice in localStorage ("sankofa-theme")
 * - Respects system preference on first load
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = typeof window !== "undefined" && localStorage.getItem("sankofa-theme");
    const prefers = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : !!prefers;
    document.documentElement.classList.toggle("dark", dark);
    setIsDark(dark);
  }, []);

  if (!mounted) return null;

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("sankofa-theme", next ? "dark" : "light");
  };

  return (
    <button className="btn" onClick={toggle} aria-label="Toggle theme">
      {isDark ? "Light" : "Dark"}
    </button>
  );
}