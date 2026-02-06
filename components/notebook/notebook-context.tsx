"use client";

import { getNotebook } from "@/lib/storage";
import { Notebook } from "@/lib/types";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface NotebookContextType {
  triggerSave: () => void;
  saveSignal: number;
  isSaving: boolean;
  setIsSaving: (v: boolean) => void;
  hasSaved: boolean;
  setHasSaved: (v: boolean) => void;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  triggerAddBlock: () => void;
  addBlockSignal: number;
  notebook: Notebook | null;
  setNotebook: (n: Notebook) => void;
}

const NotebookContext = createContext<NotebookContextType | undefined>(
  undefined,
);

export function NotebookProvider({
  children,
  pageId,
}: {
  children: ReactNode;
  pageId: string | null;
}) {
  const [saveSignal, setSaveSignal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [addBlockSignal, setAddBlockSignal] = useState(0);
  const [notebook, setNotebook] = useState<Notebook | null>(null);

  const triggerSave = () => setSaveSignal((prev) => prev + 1);
  const triggerAddBlock = () => setAddBlockSignal((prev) => prev + 1);

  useEffect(() => {
    if (pageId) {
      getNotebook(pageId).then((data) => {
        if (data) setNotebook(data);
      });
    }
  }, [pageId]);

  return (
    <NotebookContext.Provider
      value={{
        triggerSave,
        saveSignal,
        isSaving,
        setIsSaving,
        notebook,
        setNotebook,
        isDragging,
        setIsDragging,
        hasSaved,
        setHasSaved,
        triggerAddBlock,
        addBlockSignal,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export function useNotebook() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error("useNotebook deve ser usado dentro de um NotebookProvider");
  }
  return context;
}
