"use client";

import { create } from "zustand";
import { nanoid } from "nanoid";

export type Doc = {
  id: string;
  name: string;        // human title (defaults to filename without extension)
  ext: string;         // "pdf", "png", etc
  size: number;        // bytes
  mime: string;        // "application/pdf", "image/png", ...
  uploadedBy: string;  // user id (001, 002, ...)
  uploadedAt: number;  // epoch ms
  dataUrl?: string | null; // base64 for preview/download (small files only)
};

type DocsState = {
  docs: Record<string, Doc>;
  order: string[]; // newest first
  addFiles: (files: File[], userId: string) => Promise<void>;
  rename: (id: string, name: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "sankofa:docs:v1";
const MAX_INLINE = 2 * 1024 * 1024; // store preview inline up to 2MB

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("read-failed"));
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(file);
  });

function load(): Pick<DocsState, "docs" | "order"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { docs: {}, order: [] };
    const p = JSON.parse(raw) as { docs: Record<string, Doc>; order: string[] };
    return { docs: p.docs || {}, order: p.order || [] };
  } catch {
    return { docs: {}, order: [] };
  }
}

function save(docs: Record<string, Doc>, order: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ docs, order }));
  } catch {
    // ignore quota errors
  }
}

export const useDocs = create<DocsState>((set, get) => ({
  ...load(),

  async addFiles(files, userId) {
    const docs = { ...get().docs };
    const order = [...get().order];

    for (const f of files) {
      const id = nanoid(8);
      const dot = f.name.lastIndexOf(".");
      const name = dot > 0 ? f.name.slice(0, dot) : f.name;
      const ext = dot > 0 ? f.name.slice(dot + 1).toLowerCase() : "";

      let dataUrl: string | null = null;
      try {
        if (f.size <= MAX_INLINE) dataUrl = await toDataUrl(f);
      } catch {
        // ignore preview failures; metadata still stored
      }

      docs[id] = {
        id,
        name,
        ext,
        size: f.size,
        mime: f.type || "application/octet-stream",
        uploadedBy: userId,
        uploadedAt: Date.now(),
        dataUrl,
      };
      order.unshift(id);
    }

    save(docs, order);
    set({ docs, order });
  },

  rename(id, name) {
    const docs = { ...get().docs };
    if (docs[id]) {
      docs[id] = { ...docs[id], name: name.trim() || docs[id].name };
      save(docs, get().order);
      set({ docs });
    }
  },

  remove(id) {
    const docs = { ...get().docs };
    delete docs[id];
    const order = get().order.filter((x) => x !== id);
    save(docs, order);
    set({ docs, order });
  },

  clear() {
    save({}, []);
    set({ docs: {}, order: [] });
  },
}));