"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getCurrentNotebook } from "@/lib/api/notebook-service";
import type { Notebook } from "@/lib/types";

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
  isPublic: boolean;
  setVisibility: (v: boolean) => void;
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
  const [isPublic, setVisibility] = useState(false);

  const triggerSave = () => setSaveSignal((prev) => prev + 1);
  const triggerAddBlock = () => setAddBlockSignal((prev) => prev + 1);

  useEffect(() => {
    if (pageId) {
      getCurrentNotebook(pageId).then((data) => {
        if (data) {
          setVisibility(data.isPublic);
          setNotebook(data);
        }
      });
    }
  }, [pageId]);

  return (
    <NotebookContext.Provider
      value={{
        setVisibility,
        isPublic,
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
