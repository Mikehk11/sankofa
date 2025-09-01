"use client";

import Link from "next/link";
import { useMemo } from "react";

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="footer">
      <div className="container grid">
        <div className="brandline">
          <img src="/logo-sankofa.svg" alt="" height={18} style={{ opacity: 0.9 }} />
          <span className="muted">© {year} Sankofa</span>
        </div>

        <nav className="links" aria-label="Footer">
          <Link href="/docs">Docs</Link>
          <Link href="/projects/archive">Archive</Link>
          <a href="mmkanyatsi@gmail.com">Contact</a>
          <a href="https://github.com/Mikehk11" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}