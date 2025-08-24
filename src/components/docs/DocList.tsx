"use client";
import styles from "./Docs.module.scss";
import { useDocs } from "@/state/docs";

function typeOfDoc(d: { type?: string; links: string[]; file?: any }) {
  if (d.type) return d.type;
  if (d.file) return "file";
  return d.links?.length ? "link" : "note";
}

const MAX_BYTES = 4 * 1024 * 1024; // ~4MB for localStorage safety

export default function DocList({
  currentId,
  onPick,
  onPreview,
  onDownload,
}: {
  currentId: string | null;
  onPick: (id: string) => void;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
}) {
  const { docs, add, remove, setFile } = useDocs();

  async function handleNewFileFilePicker() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;

      if (f.size > MAX_BYTES) {
        window.alert(
          "This file is larger than 4MB and cannot be saved in the browser storage.\n" +
            "Tip: upload it to Google Drive and add its link to a note."
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        // create the doc first
        const id = crypto.randomUUID();
        add({
          id,
          title: f.name,
          content: "",
          links: [],
          type: "file",
          file: { name: f.name, mime: f.type || "application/octet-stream", size: f.size, dataUrl },
        });
        // ensure file is set (also useful if you want to attach to an existing doc later)
        setFile(id, { name: f.name, mime: f.type || "application/octet-stream", size: f.size, dataUrl });
        onPick(id);
        onPreview(id);
      };
      reader.readAsDataURL(f);
    };
    input.click();
  }

  return (
    <aside className={styles.sidebar}>
      <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Documents</strong>
        <button className="btn" onClick={handleNewFileFilePicker}>New</button>
      </div>

      <div className={styles.headRow}>
        <div>Title</div>
        <div>Type</div>
        <div style={{ textAlign: "right" }}>Actions</div>
      </div>

      {docs.map((d) => (
        <div
          key={d.id}
          className={styles.itemRow}
          style={{ outline: currentId === d.id ? "2px solid var(--secondary)" : "none" }}
        >
          <div className={styles.titleCell} title={d.title || "Untitled"}>
            <span>📄</span>
            <span onClick={() => onPick(d.id)} style={{ cursor: "pointer" }}>
              {d.title || "Untitled"}
            </span>
          </div>

          <div><span className={styles.badge}>{typeOfDoc(d)}</span></div>

          <div className={styles.actions}>
            <button className={styles.miniBtn} onClick={() => onPick(d.id)}>Edit</button>
            <button className={styles.miniBtn} onClick={() => onPreview(d.id)}>Preview</button>
            <button className={styles.miniBtn} onClick={() => onDownload(d.id)}>Download</button>
            <button className={`${styles.miniBtn} ${styles.danger}`} onClick={() => remove(d.id)}>Delete</button>
          </div>
        </div>
      ))}
    </aside>
  );
}