"use client";

export default function Sidebar() {
  const Item = ({ href, label, emoji }: { href: string; label: string; emoji: string }) => (
    <a href={href} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 10, color: "inherit", textDecoration: "none"
    }}>
      <span>{emoji}</span><span>{label}</span>
    </a>
  );

  return (
    <aside style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <img src="/logo-sankofa.svg" width={24} height={24} alt="Sankofa" />
        <strong>Sankofa</strong>
      </div>

      <nav style={{ display: "grid", gap: 6 }}>
        <Item href="/dashboard" label="Dashboard" emoji="🏠" />
        <Item href="/tasks"     label="Tasks"     emoji="🧩" />
        <Item href="/projects"  label="Projects"  emoji="📊" />
        <Item href="/calendar"  label="Calendar"  emoji="📆" />
        <Item href="/docs"      label="Docs"      emoji="📄" />
        <Item href="/chat"      label="Chat"      emoji="💬" />
        <Item href="/settings"  label="Settings"  emoji="⚙️" />
      </nav>
    </aside>
  );
}