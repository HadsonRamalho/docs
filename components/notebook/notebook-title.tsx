"use client";

import { useEffect, useState } from "react";
import { useNotebook } from "./notebook-context";
import { useNotebookManager } from "./notebook-manager";

interface NotebookTitleProps {
  pageTitle: string | undefined;
}

export function NotebookTitle({ pageTitle }: NotebookTitleProps) {
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
      console.error("Notebook não encontrado");
      return;
    }

    const currentTitle = title?.trim() || "";
    const originalTitle = notebook.title?.trim() || "";

    if (!currentTitle || currentTitle === originalTitle) {
      setTitle(originalTitle);
      return;
    }

    renamePage(notebook.id, currentTitle);
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
      onClick={() => {
        !pageTitle && setIsEditing(true);
      }}
    >
      {title || pageTitle || "..."}
    </h1>
  );
}
