"use client";

import { useMemo, useState } from "react";
import styles from "@/components/docs/Docs.module.scss";
import DocList from "@/components/docs/DocList";
import DocEditor from "@/components/docs/DocEditor";
import DocPreview from "@/components/docs/DocPreview";
import { useDocs } from "@/state/docs";

function slugify(s: string) {
  return (s || "document")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DocsPage() {
  const docs = useDocs((s) => s.docs);
  const [current, setCurrent] = useState<string | null>(docs[0]?.id ?? null);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  // keep selection valid when docs change
  useMemo(() => {
    if (current && !docs.find((d) => d.id === current)) {
      setCurrent(docs[0]?.id ?? null);
    }
  }, [docs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = (id: string) => {
    const d = docs.find((x) => x.id === id);
    if (!d) return;

    // If there's an uploaded file, download it directly
    if (d.file?.dataUrl) {
      const a = document.createElement("a");
      a.href = d.file.dataUrl;
      a.download = d.file.name || "file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    // Otherwise export the note as .md
    const text =
      `# ${d.title || "Untitled"}\n\n` +
      (d.content || "") +
      (d.links.length
        ? `\n\nLinks:\n${d.links.map((u) => `- ${u}`).join("\n")}\n`
        : "");
    const blob = new Blob([text], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${slugify(d.title)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <h1 style={{ margin: 0 }}>Docs</h1>

      <div className={styles.wrap}>
        <DocList
          currentId={current}
          onPick={(id) => {
            setCurrent(id);
            setMode("edit");
          }}
          onPreview={(id) => {
            setCurrent(id);
            setMode("preview");
          }}
          onDownload={handleDownload}
        />

        {mode === "edit" ? (
          <DocEditor
            docId={current}
            onPreview={(id) => {
              setCurrent(id);
              setMode("preview");
            }}
          />
        ) : (
          <DocPreview docId={current} onBack={() => setMode("edit")} />
        )}
      </div>
    </section>
  );
}