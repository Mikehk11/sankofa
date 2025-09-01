"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocalUser = { id: string; name: string } | null;

type UserState = {
  user: LocalUser;
  setUser: (u: NonNullable<LocalUser>) => void;
  clearUser: () => void;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      clearUser: () => set({ user: null }),
    }),
    { name: "sankofa_user" } // localStorage key
  )
);