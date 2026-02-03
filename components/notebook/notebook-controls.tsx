"use client";

import { Save, Loader2, Check } from "lucide-react";
import { useNotebook } from "./notebook-context";

export function NotebookControls() {
  const { triggerSave, isSaving, hasSaved } = useNotebook();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={triggerSave}
        disabled={isSaving}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all border
          ${
            hasSaved
              ? "bg-emerald-500 border-green-500/50 text-white"
              : "bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-500 hover:border-emerald-600"
          }
        `}
      >
        {isSaving ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : hasSaved ? (
          <Check className="size-3.5" />
        ) : (
          <Save className="size-3.5" />
        )}
        {isSaving ? "Salvando..." : hasSaved ? "Salvo!" : "Salvar"}
      </button>
    </div>
  );
}
