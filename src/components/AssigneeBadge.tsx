"use client";

import { USERS } from "@/data/users";

function initials(name = "?") {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}
function colorFromName(name = "User") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return `hsl(${hue} 60% 60%)`;
}

export default function AssigneeBadge({ id }: { id?: string }) {
  if (!id) {
    return (
      <div
        title="Unassigned"
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: "var(--bg)",
        }}
      />
    );
  }
  const u = USERS.find((x) => x.id === id);
  const name = u?.name ?? "User";
  const online = !!u?.online;

  return (
    <div style={{ position: "relative", width: 24, height: 24 }}>
      <div
        title={name}
        aria-label={name}
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: colorFromName(name),
          display: "grid",
          placeItems: "center",
          color: "#0F2430",
          fontWeight: 800,
          fontSize: 10,
          border: "1px solid var(--border)",
        }}
      >
        {initials(name)}
      </div>
      <span
        title={online ? "Online" : "Offline"}
        style={{
          position: "absolute",
          right: -2,
          bottom: -2,
          width: 9,
          height: 9,
          borderRadius: 999,
          background: online ? "#22c55e" : "#9aa3ad",
          border: "2px solid var(--card)",
        }}
      />
    </div>
  );
}