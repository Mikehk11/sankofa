"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { USERS } from "@/data/users";
import { useUser } from "@/state/users";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useUser((s) => s.setUser);

  const [id, setId] = useState("");
  const [name, setName] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    const allowed = USERS.map((u) => u.id);
    if (!allowed.includes(id)) {
      alert(`ID must be one of: ${allowed.join(", ")}`);
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Please enter your name");
      return;
    }

    setUser({ id, name: trimmed });
    router.push("/dashboard");
  }

  return (
    <section style={{ maxWidth: 420, margin: "40px auto", display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>Sign in</h1>
      <p style={{ opacity: 0.7, marginTop: -6 }}>
        Use your team ID (e.g. 001…005) and your name.
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>ID</span>
          <input
            placeholder="001"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--fg)",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--card)",
              color: "var(--fg)",
            }}
          />
        </label>

        <button className="btn" type="submit">Continue</button>
      </form>
    </section>
  );
}