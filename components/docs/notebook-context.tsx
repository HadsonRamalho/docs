"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

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
}

const NotebookContext = createContext<NotebookContextType | undefined>(
  undefined,
);

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [saveSignal, setSaveSignal] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [addBlockSignal, setAddBlockSignal] = useState(0);

  const triggerSave = () => setSaveSignal((prev) => prev + 1);
  const triggerAddBlock = () => setAddBlockSignal((prev) => prev + 1);

  return (
    <NotebookContext.Provider
      value={{
        triggerSave,
        saveSignal,
        isSaving,
        setIsSaving,
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
