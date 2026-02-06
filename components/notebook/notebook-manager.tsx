"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  createFullBackup,
  deleteNotebook as dbDelete,
  getAllNotebooks,
  getNotebook,
  restoreFullBackup,
  saveNotebook,
} from "@/lib/storage";
import type { NotebookMeta } from "@/lib/types";

interface NotebookManagerType {
  pages: NotebookMeta[];
  createPage: () => void;
  deletePage: (id: string) => void;
  refreshPages: () => void;
  downloadBackup: () => Promise<void>;
  uploadBackup: (file: File) => Promise<void>;
  renamePage: (id: string, newTitle: string) => Promise<void>;
}

const NotebookManagerContext = createContext<NotebookManagerType | undefined>(
  undefined,
);

export function NotebookManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pages, setPages] = useState<NotebookMeta[]>([]);
  const router = useRouter();

  const refreshPages = async () => {
    const data = await getAllNotebooks();
    setPages(data);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <Desnecessário no array de dependências>
  useEffect(() => {
    refreshPages();
  }, []);

  const renamePage = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    const notebook = await getNotebook(id);

    if (!notebook) {
      console.error("Notebook não encontrado");
      return;
    }

    await saveNotebook(id, notebook.blocks, newTitle);

    window.dispatchEvent(
      new CustomEvent("notebook-title-updated", {
        detail: { id, title: newTitle },
      }),
    );

    await refreshPages();
  };

  const createPage = async () => {
    const newId =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    await saveNotebook(newId, [], "Nova Página");

    await refreshPages();

    router.push(`/docs/${newId}`);
  };

  const deletePage = async (id: string) => {
    await dbDelete(id);

    await refreshPages();

    router.push("/docs");
  };

  const downloadBackup = async () => {
    const json = await createFullBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `rust-notebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadBackup = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target?.result as string;
        if (!content) return;

        const success = await restoreFullBackup(content);
        if (success) {
          await refreshPages();
          alert("Backup restaurado com sucesso!");
          router.push("/docs");
          resolve();
        } else {
          alert("Erro ao ler o arquivo de backup.");
          reject();
        }
      };

      reader.readAsText(file);
    });
  };

  return (
    <NotebookManagerContext.Provider
      value={{
        pages,
        createPage,
        renamePage,
        deletePage,
        refreshPages,
        uploadBackup,
        downloadBackup,
      }}
    >
      {children}
    </NotebookManagerContext.Provider>
  );
}

export const useNotebookManager = () => {
  const context = useContext(NotebookManagerContext);
  if (!context)
    throw new Error("useNotebookManager must be used within Provider");
  return context;
};
