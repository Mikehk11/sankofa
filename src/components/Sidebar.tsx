"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.scss";

type Item = { href: string; label: string; icon: string };

const NAV: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/tasks",     label: "Tasks",     icon: "🧩" },
  { href: "/projects",  label: "Projects",  icon: "📊" }, 
  { href: "/calendar",  label: "Calendar",  icon: "📅" },
  { href: "/chat",      label: "Chat",      icon: "💬" },
  { href: "/docs",      label: "Docs",      icon: "📄" },
  { href: "/settings",  label: "Settings",  icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/public/logo-sankofa.svg" alt="" height={20} width={20} />
        <span>Sankofa</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.link} ${active ? styles.active : ""}`}
            >
              <span className={styles.icon}>{icon}</span>
              <span className={styles.label}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}