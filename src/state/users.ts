"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/data/users";
import { USERS } from "@/data/users";

type UsersState = {
  users: User[];
  add: (u: Omit<User, "id"> & { id?: string }) => void;
  update: (id: string, patch: Partial<User>) => void;
  remove: (id: string) => void;
  toggleOnline: (id: string) => void;
};

export const useUsers = create<UsersState>()(
  persist(
    (set) => ({
      users: USERS,
      add: (u) =>
        set((s) => ({
          users: [...s.users, { id: u.id ?? crypto.randomUUID(), ...u }],
        })),
      update: (id, patch) =>
        set((s) => ({
          users: s.users.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      remove: (id) =>
        set((s) => ({ users: s.users.filter((x) => x.id !== id) })),
      toggleOnline: (id) =>
        set((s) => ({
          users: s.users.map((x) =>
            x.id === id ? { ...x, online: !x.online } : x
          ),
        })),
    }),
    { name: "sankofa-users" }
  )
);