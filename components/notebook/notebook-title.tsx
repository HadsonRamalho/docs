"use client";

import { useEffect, useState } from "react";
import { useNotebook } from "./notebook-context";
import { useNotebookManager } from "./notebook-manager";

export function NotebookTitle() {
  const { notebook } = useNotebook();
  const { renamePage } = useNotebookManager();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState<string | undefined>("");

  useEffect(() => {
    if (notebook?.title) {
      setTitle(notebook.title);
    }
  }, [notebook?.title]);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail.id === notebook?.id) {
        setTitle(e.detail.title);
      }
    };

    window.addEventListener("notebook-title-updated", handleUpdate);
    return () =>
      window.removeEventListener("notebook-title-updated", handleUpdate);
  }, [notebook?.id]);

  const handleBlur = () => {
    setIsEditing(false);

    if (!notebook) {
      console.error("Notebook não encontrado. Impossível atualizar título.");
      return;
    }

    const currentTitle = title?.trim() || "";
    const originalTitle = notebook.title?.trim() || "";

    if (!currentTitle) {
      setTitle(originalTitle);
      return;
    }

    if (currentTitle !== originalTitle) {
      renamePage(notebook.id, currentTitle);
    }
  };

  if (isEditing) {
    return (
      <input
        className="text-3xl font-bold bg-transparent border-b-2 border-emerald-500 outline-none w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleBlur}
      />
    );
  }

  return (
    <h1
      className="text-3xl font-bold cursor-text hover:bg-white/5 rounded px-1 transition-colors"
      onClick={() => setIsEditing(true)}
    >
      {title || "..."}
    </h1>
  );
}
