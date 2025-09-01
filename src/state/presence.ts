import { create } from "zustand";
import { USERS } from "@/data/users";

export type Status = "online" | "away" | "busy" | "offline";

export type Presence = {
  id: string;
  name: string;
  status: Status;
  lastSeen?: number;
};

type PresenceState = {
  selfId: string | null;
  people: Record<string, Presence>;
  setSelf: (id: string | null) => void;
  setStatus: (id: string, status: Status) => void;
  team: () => Presence[];
};

const initial: Record<string, Presence> = Object.fromEntries(
  USERS.map((u) => [u.id, { id: u.id, name: u.name, status: "offline" as Status }])
);

export const usePresence = create<PresenceState>((set, get) => ({
  selfId: null,
  people: initial,
  setSelf: (id) => set({ selfId: id ?? null }),
  setStatus: (id, status) =>
    set((s) => ({
      people: {
        ...s.people,
        [id]: { ...(s.people[id] ?? { id, name: id }), status, lastSeen: Date.now() },
      },
    })),
  team: () => Object.values(get().people).sort((a, b) => a.name.localeCompare(b.name)),
}));