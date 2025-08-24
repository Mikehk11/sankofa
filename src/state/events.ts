"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Use a name that won't collide with DOM Event
export type CalendarEvent = {
  id: string;
  title: string;
  start: string;      // ISO datetime
  end?: string;       // ISO datetime
  location?: string;
  projectId?: string;
};

const SEED: CalendarEvent[] = [
  {
    id: "e1",
    title: "Community workshop – civic rights",
    start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // +1 day
    location: "Abidjan",
  },
  {
    id: "e2",
    title: "High-school outreach – Treichville",
    start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // +3 days
    location: "Treichville",
  },
  {
    id: "e3",
    title: "Partners sync",
    start: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), // +6 days
  },
];

type EventsState = {
  events: CalendarEvent[];
  add: (e: Omit<CalendarEvent, "id"> & { id?: string }) => void;
  update: (id: string, patch: Partial<CalendarEvent>) => void;
  remove: (id: string) => void;
};

export const useEvents = create<EventsState>()(
  persist(
    (set) => ({
      events: SEED,
      add: (e) =>
        set((s) => ({
          events: [...s.events, { id: e.id ?? crypto.randomUUID(), ...e }],
        })),
      update: (id, patch) =>
        set((s) => ({
          events: s.events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)),
        })),
      remove: (id) =>
        set((s) => ({ events: s.events.filter((ev) => ev.id !== id) })),
    }),
    { name: "sankofa-events" }
  )
);

// Optional: keep this for any places that still import plain seeds
export const EVENTS = SEED;