"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = { id: string; name: string };
type Status = "online" | "away" | "busy" | "offline";

type AuthState = {
  user: AuthUser | null;
  status: Status;
  signIn: (user: AuthUser) => void;
  signOut: () => void;
  setStatus: (s: Status) => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "online",
      signIn: (user) => {
        set({ user, status: "online" });
        try {
          document.cookie = `sankofa_uid=${encodeURIComponent(user.id)}; path=/; max-age=2592000`;
        } catch {}
      },
      signOut: () => {
        set({ user: null, status: "offline" });
        try {
          document.cookie = "sankofa_uid=; path=/; max-age=0";
        } catch {}
      },
      setStatus: (s) => set({ status: s }),
    }),
    { name: "sankofa-auth" }
  )
);