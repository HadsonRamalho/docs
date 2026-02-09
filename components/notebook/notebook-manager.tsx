"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  createNotebook,
  deleteNotebook,
  getMyNotebooks,
  updateNotebookTitle,
} from "@/lib/api/notebook-service";
import { restoreFullBackup } from "@/lib/storage";
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
  const { user } = useAuth();
  const router = useRouter();

  const refreshPages = async () => {
    if (!user) {
      return;
    }
    const data = await getMyNotebooks();
    setPages(data);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <Desnecessário no array de dependências>
  useEffect(() => {
    refreshPages();
  }, []);

  const renamePage = async (id: string, newTitle: string) => {
    if (!user) {
      return;
    }
    if (!newTitle.trim()) return;

    try {
      await updateNotebookTitle(id, newTitle);

      window.dispatchEvent(
        new CustomEvent("notebook-title-updated", {
          detail: { id, title: newTitle },
        }),
      );

      await refreshPages();
    } catch (error) {
      console.error("Erro ao renomear notebook:", error);
    }
  };

  const createPage = async () => {
    if (!user) {
      return;
    }
    try {
      const newId = await createNotebook();

      await refreshPages();

      router.push(`/docs/${newId}`);
    } catch (error) {
      console.error("Falha ao criar o notebook: ", error);
    }
  };

  const deletePage = async (id: string) => {
    if (!user) {
      return;
    }
    await deleteNotebook(id);

    await refreshPages();

    router.push("/docs");
  };

  const downloadBackup = async () => {
    if (!user) {
      return;
    }
    const pages = await getMyNotebooks();
    const json = JSON.stringify(pages, null, 2);
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
    if (!user) {
      return;
    }
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
