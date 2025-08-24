"use client";
import styles from "./AvatarRow.module.scss";
import { useUsers } from "@/state/users";

export default function AvatarRow({ onPick }: { onPick: (userId: string) => void }) {
  const users = useUsers((s) => s.users);

  return (
    <div className={styles.row}>
      {users.map((u) => {
        const initials = u.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return (
          <div
            key={u.id}
            className={styles.avatar}
            title={`${u.name} (${u.id})`}
            onClick={() => onPick(u.id)}
          >
            <span className="mono">{initials}</span>
            <span className={`${styles.dot} ${u.online ? styles.online : ""}`} />
          </div>
        );
      })}
    </div>
  );
}