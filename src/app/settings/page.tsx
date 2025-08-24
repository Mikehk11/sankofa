"use client";
import { useUsers } from "@/state/users";
import { useState } from "react";

function nextId(existing: string[]) {
  const nums = existing
    .map((id) => parseInt(id, 10))
    .filter((n) => !Number.isNaN(n));
  const candidate = (Math.max(0, ...nums) + 1).toString().padStart(3, "0");
  return candidate;
}

export default function SettingsPage() {
  const { users, add, update, remove, toggleOnline } = useUsers();
  const [name, setName] = useState("");
  const [id, setId] = useState(nextId(users.map((u) => u.id)));

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>Team Settings</h1>

      {/* Add member */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Add member</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            add({ id, name, online: false });
            setName("");
            setId(nextId(users.map((u) => u.id)));
          }}
          style={{ display: "grid", gap: 8, gridTemplateColumns: "120px 1fr auto" }}
        >
          <input
            className="mono"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID (e.g. 006)"
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--card)",
              color: "var(--fg)",
            }}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            style={{
              padding: "10px 12px",
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--card)",
              color: "var(--fg)",
            }}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </div>

      {/* Members list */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Members</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr auto auto",
                gap: 10,
                alignItems: "center",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: 10,
                background: "var(--bg)",
              }}
            >
              <input
                className="mono"
                value={u.id}
                onChange={(e) => update(u.id, { id: e.target.value })}
                style={{
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card)",
                  color: "var(--fg)",
                }}
              />
              <input
                value={u.name}
                onChange={(e) => update(u.id, { name: e.target.value })}
                style={{
                  padding: "8px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--card)",
                  color: "var(--fg)",
                }}
              />

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={u.online}
                  onChange={() => toggleOnline(u.id)}
                />
                Online
              </label>

              <button className="btn" onClick={() => remove(u.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Changes here instantly update the avatars on the dashboard and chat.
        </p>
      </div>
    </section>
  );
}