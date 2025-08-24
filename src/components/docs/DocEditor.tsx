"use client";

import { useMemo, useState } from "react";
import styles from "./Docs.module.scss";
import { useDocs } from "@/state/docs";
import type { Doc } from "@/state/docs";

/** tiny markdown-ish renderer */
function renderLiteMarkdown(src: string) {
  let html = src
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);
  // group consecutive <li>…</li> into a <ul>
  html = html.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/gs, (m) => `<ul>${m}</ul>`);
  // paragraph wrap for remaining blocks
  html = html
    .split(/\n{2,}/)
    .map((block) => (/^<h\d|^<ul|^<li/.test(block.trim()) ? block : `<p>${block}</p>`))
    .join("\n");
  return { __html: html };
}

const MAX_BYTES = 4 * 1024 * 1024; // ~4MB safe for localStorage

export default function DocEditor({
  docId,
  onPreview,
}: {
  docId: string | null;
  onPreview: (id: string) => void;
}) {
  const { docs, update, addLink, removeLink, setFile, clearFile } = useDocs();
  const current: Doc | null = useMemo(
    () => docs.find((d) => d.id === docId) ?? null,
    [docs, docId]
  );
  const [newLink, setNewLink] = useState("");

  // Guard: if nothing selected, show hint
  if (!current) return <div className={styles.editorCard}>Select or create a document.</div>;

  // Snapshot safe values for closures (prevents "possibly null" errors)
  const id = current.id;
  const titleSnap = current.title;

  function handleUploadReplace() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;

      if (f.size > MAX_BYTES) {
        window.alert("File too large for browser storage (~4MB limit). Use a Google Drive link instead.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        setFile(id, {
          name: f.name,
          mime: f.type || "application/octet-stream",
          size: f.size,
          dataUrl,
        });
        update(id, { title: titleSnap || f.name, type: "file" });
      };
      reader.readAsDataURL(f);
    };
    input.click();
  }

  return (
    <div className={styles.editorCard}>
      <div className={styles.toolbar}>
        <input
          className={styles.title}
          value={current.title}
          onChange={(e) => update(id, { title: e.target.value })}
          placeholder="Document title…"
        />
        <button className="btn" onClick={() => onPreview(id)}>Preview</button>
        <button className="btn" onClick={handleUploadReplace}>
          {current.file ? "Replace file" : "Upload file"}
        </button>
        {current.file && (
          <button className="btn" onClick={() => clearFile(id)}>Remove file</button>
        )}
      </div>

      <div
        className={`row ${styles.editorGridTwoCol}`}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "start" }}
      >
        <textarea
          className={styles.area}
          value={current.content}
          onChange={(e) => update(id, { content: e.target.value })}
          placeholder="Write notes in simple Markdown (#, **bold**, *italic*, - list)"
        />
        <div className={styles.previewBox} dangerouslySetInnerHTML={renderLiteMarkdown(current.content)} />
      </div>

      <div className="card" style={{ padding: 12 }}>
        <strong>Links</strong>
        <div className={styles.linkList} style={{ marginTop: 8 }}>
          {current.links.map((u) => (
            <div className={styles.linkItem} key={u}>
              <a href={u} target="_blank" rel="noreferrer" className="mono">{u}</a>
              <button className="btn" onClick={() => removeLink(id, u)}>Remove</button>
            </div>
          ))}
        </div>

        <form
          className={styles.toolbar}
          onSubmit={(e) => {
            e.preventDefault();
            if (!newLink.trim()) return;
            addLink(id, newLink.trim());
            setNewLink("");
          }}
          style={{ marginTop: 8 }}
        >
          <input
            className={styles.inp}
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="https://drive.google.com/…"
          />
          <button className="btn" type="submit">Add link</button>
        </form>
      </div>
    </div>
  );
}