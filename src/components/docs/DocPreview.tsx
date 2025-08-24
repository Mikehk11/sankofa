"use client";
import { useMemo } from "react";
import styles from "./Docs.module.scss";
import { useDocs } from "@/state/docs";

function renderLiteMarkdown(src: string) {
  let html = src
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer">$1</a>`);
  html = html.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/gs, (m) => `<ul>${m}</ul>`);
  html = html
    .split(/\n{2,}/)
    .map((block) => (/^<h\d|^<ul|^<li/.test(block.trim()) ? block : `<p>${block}</p>`))
    .join("\n");
  return { __html: html };
}

export default function DocPreview({
  docId,
  onBack,
}: {
  docId: string | null;
  onBack: () => void;
}) {
  const docs = useDocs((s) => s.docs);
  const doc = useMemo(() => docs.find((d) => d.id === docId) ?? null, [docs, docId]);

  if (!doc) return <div className={styles.previewCard}>No document selected.</div>;

  const firstLink = doc.links[0];

  const canEmbedFile =
    doc.file &&
    (doc.file.mime === "application/pdf" || doc.file.mime.startsWith("image/"));

  return (
    <div className={styles.previewCard}>
      <div className={styles.toolbar}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <strong style={{ marginLeft: 8 }}>{doc.title || "Untitled"}</strong>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {doc.file && (
            <a
              className="btn"
              href={doc.file.dataUrl}
              download={doc.file.name}
            >
              Download file
            </a>
          )}
        </div>
      </div>

      {canEmbedFile ? (
        doc.file!.mime === "application/pdf" ? (
          <iframe
            src={doc.file!.dataUrl}
            style={{ width: "100%", height: 520, border: "1px solid var(--border)", borderRadius: 12 }}
          />
        ) : (
          <img
            src={doc.file!.dataUrl}
            alt={doc.file!.name}
            style={{ maxWidth: "100%", border: "1px solid var(--border)", borderRadius: 12 }}
          />
        )
      ) : firstLink && (firstLink.endsWith(".pdf") || firstLink.includes("docs.google.com")) ? (
        <iframe
          src={firstLink}
          style={{ width: "100%", height: 520, border: "1px solid var(--border)", borderRadius: 12 }}
        />
      ) : (
        <div className={styles.previewBox} dangerouslySetInnerHTML={renderLiteMarkdown(doc.content)} />
      )}

      {doc.links.length > 0 && (
        <div>
          <strong>Links</strong>
          <div className={styles.linkList} style={{ marginTop: 8 }}>
            {doc.links.map((u) => (
              <div key={u} className={styles.linkItem}>
                <a href={u} target="_blank" rel="noreferrer" className="mono">{u}</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}