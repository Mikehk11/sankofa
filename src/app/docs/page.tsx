"use client";

import { useMemo, useState } from "react";
import { useDocs } from "@/state/docs";
import { useUser } from "@/state/users";
import { USERS } from "@/data/users";

function prettyBytes(num: number) {
  if (num < 1024) return `${num} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    num /= 1024;
    i++;
  } while (num >= 1024 && i < units.length - 1);
  return `${num.toFixed(1)} ${units[i]}`;
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString();
}
function nameForUser(id: string) {
  return USERS.find((u) => u.id === id)?.name || id;
}

export default function DocsPage() {
  const { user } = useUser();

  const docs = useDocs((s) => s.docs);
  const order = useDocs((s) => s.order);
  const addFiles = useDocs((s) => s.addFiles);
  const rename = useDocs((s) => s.rename);
  const remove = useDocs((s) => s.remove);

  const [query, setQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const ids = useMemo(() => {
    const q = query.trim().toLowerCase();
    return order.filter((id) => {
      const d = docs[id];
      if (!d) return false;
      return d.name.toLowerCase().includes(q);
    });
  }, [order, docs, query]);

  const selected = previewId ? docs[previewId] : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 16, padding: 16 }}>
      {/* Left: controls + list */}
      <section style={{ display: "grid", gap: 12 }}>
        {/* Search + Upload */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="Search docs by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: 220,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--card)",
            }}
          />
          <label className="btn" style={{ cursor: "pointer" }}>
            Upload
            <input
              type="file"
              multiple
              hidden
              onChange={(e) => {
                // Capture the element BEFORE any async work (React pools the event)
                const input = e.currentTarget;
                const files = Array.from(input.files ?? []);

                if (!files.length) {
                  input.value = "";
                  return;
                }
                if (!user) {
                  alert("Please sign in first.");
                  input.value = "";
                  return;
                }

                // Do async add, then clear the picker (so same file can be re-selected later)
                Promise.resolve(addFiles(files, user.id)).finally(() => {
                  input.value = "";
                });
              }}
            />
          </label>
          <button className="btn-secondary" onClick={() => setQuery("")}>
            Clear
          </button>
        </div>

        {/* List */}
        <div style={{ display: "grid", gap: 8 }}>
          {ids.map((id) => {
            const d = docs[id]!;
            return (
              <div
                key={id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <div
                  onClick={() => setPreviewId(id)}
                  style={{ display: "grid", gap: 4, cursor: "pointer" }}
                  title="Open preview"
                >
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>
                    {formatDate(d.uploadedAt)} · {d.ext || "file"} · {prettyBytes(d.size)} · uploaded by{" "}
                    {nameForUser(d.uploadedBy)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn" onClick={() => setPreviewId(id)}>
                    Preview
                  </button>
                  {d.dataUrl && (
                    <a className="btn" href={d.dataUrl} download={`${d.name}.${d.ext}`}>
                      Download
                    </a>
                  )}
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      const name = prompt("Rename document", d.name);
                      if (name != null) rename(id, name);
                    }}
                  >
                    Rename
                  </button>
                  <button className="btn-destructive" onClick={() => remove(id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {ids.length === 0 && (
            <div style={{ opacity: 0.7 }}>
              {query ? `No documents match “${query}”.` : "No documents yet. Click Upload to add one."}
            </div>
          )}
        </div>
      </section>

      {/* Right: preview pane */}
      <aside
        style={{
          position: "sticky",
          top: 16,
          alignSelf: "start",
          border: "1px solid var(--border)",
          background: "var(--card)",
          borderRadius: 12,
          minHeight: 320,
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        <div
          style={{
            padding: 10,
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 600 }}>{selected ? selected.name : "Preview"}</div>
          <div style={{ marginLeft: "auto" }}>
            {selected && (
              <button className="btn" onClick={() => setPreviewId(null)}>
                Close
              </button>
            )}
          </div>
        </div>

        <div style={{ height: "100%", background: "var(--bg-2)", display: "grid", placeItems: "center" }}>
          {!selected && <div style={{ opacity: 0.7 }}>Select a document from the list.</div>}
          {selected && <DocPreview docId={selected.id} />}
        </div>
      </aside>
    </div>
  );
}

function DocPreview({ docId }: { docId: string }) {
  const doc = useDocs((s) => s.docs[docId]);
  if (!doc) return null;

  if (!doc.dataUrl) {
    return (
      <div style={{ padding: 16, textAlign: "center", opacity: 0.8 }}>
        Preview unavailable (file too large or not stored for preview). Use download instead.
      </div>
    );
  }

  const isImage = doc.mime.startsWith("image/");
  const isPdf = doc.mime === "application/pdf" || doc.ext === "pdf";
  const isVideo = doc.mime.startsWith("video/");

  if (isImage) return <img src={doc.dataUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%" }} />;
  if (isPdf) return <iframe src={doc.dataUrl} title="PDF" style={{ width: "100%", height: "100%", border: 0 }} />;
  if (isVideo)
    return (
      <video controls style={{ maxWidth: "100%", maxHeight: "100%" }}>
        <source src={doc.dataUrl} type={doc.mime} />
      </video>
    );

  return (
    <div style={{ padding: 16, textAlign: "center", opacity: 0.8 }}>
      No embedded preview for “.{doc.ext}”. Use download.
    </div>
  );
}