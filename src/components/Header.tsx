"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useUser } from "@/state/users";

// Removed the /tasks item
const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects",  label: "Projects" },
  { href: "/calendar",  label: "Calendar" },
  { href: "/docs",      label: "Docs" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useUser();
  const [open, setOpen] = useState(false);

  // Prefetch only existing routes
  useEffect(() => {
    NAV.forEach(({ href }) => (router as any)?.prefetch?.(href));
  }, [router]);

  const isActive = (href: string) => pathname === href;

  const pillBase: React.CSSProperties = {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--pill-border)",
    borderRadius: 999,
    padding: "6px 12px",
    textDecoration: "none",
    color: "var(--fg)",
    display: "inline-block",
  };
  const pillActive: React.CSSProperties = {
    background: "var(--pill-active)",
    borderColor: "var(--pill-border-active)",
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--bg)",
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: "var(--border)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          alignItems: "center",
          gap: 12,
          maxWidth: 1200,
          margin: "0 auto",
          padding: 12,
        }}
      >
        {/* Brand + primary nav */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="brand" aria-label="Sankofa">
            <img src="/logo-sankofa.svg" alt="" style={{ height: 18 }} />
          </Link>

          <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={isActive(item.href) ? { ...pillBase, ...pillActive } : pillBase}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Theme toggle */}
        <div>
          <ThemeToggle />
        </div>

        {/* Account */}
        <div style={{ position: "relative" }}>
          {!user ? (
            <Link className="btn" href="/login">Sign in</Link>
          ) : (
            <>
              <button
                className="btn"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                title={`ID: ${user.id}`}
              >
                {`Hi, ${user.name}`} ▾
              </button>

              {open && (
                <div
                  role="menu"
                  style={{
                    position: "absolute",
                    right: 0,
                    marginTop: 6,
                    minWidth: 220,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "var(--border)",
                    borderRadius: 12,
                    background: "var(--card)",
                    boxShadow: "0 12px 30px rgba(0,0,0,.18)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: 10, borderBottomWidth: 1, borderBottomStyle: "solid", borderBottomColor: "var(--border)" }}>
                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                    <div style={{ opacity: 0.65, fontSize: 12 }}>ID: {user.id}</div>
                  </div>

                  <div style={{ padding: 8, display: "grid", gap: 6 }}>
                    <Link className="btn-secondary" href="/login" onClick={() => setOpen(false)}>
                      Switch account
                    </Link>
                    <button
                      className="btn-destructive"
                      onClick={() => {
                        clearUser();
                        setOpen(false);
                        window.location.assign("/login");
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}