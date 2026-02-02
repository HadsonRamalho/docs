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
              ? "bg-green-500/10 border-green-500/50 text-green-400"
              : "bg-orange-600 border-orange-700 text-white hover:bg-orange-500 hover:border-orange-600"
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
