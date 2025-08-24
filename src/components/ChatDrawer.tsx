"use client";
import { useMemo, useState } from "react";
import styles from "./ChatDrawer.module.scss";
import { useUsers } from "@/state/users";

type Msg = { who: "me" | "them"; text: string };

export default function ChatDrawer({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const users = useUsers((s) => s.users);
  const user = useMemo(() => users.find((u) => u.id === userId) ?? null, [userId, users]);
  const [msgs, setMsgs] = useState<Msg[]>(
    user ? [{ who: "them", text: `Salut ! C'est ${user.name}.` }] : []
  );
  const [text, setText] = useState("");

  if (!user) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.drawer}>
        <div className={styles.head}>
          <strong>Chat · {user.name}</strong>
          <button className="btn" style={{ marginLeft: "auto" }} onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.body}>
          {msgs.map((m, i) => (
            <div key={i} className={`${styles.msg} ${m.who === "me" ? styles.me : ""}`}>
              {m.text}
            </div>
          ))}
        </div>

        <form
          className={styles.inputRow}
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            setMsgs((prev) => [...prev, { who: "me", text }]);
            setText("");
          }}
        >
          <input
            className={styles.inp}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
          />
          <button className="btn" type="submit">
            Send
          </button>
        </form>
      </aside>
    </>
  );
}