"use client";

import { Check, Loader2, Save } from "lucide-react";
import { useNotebook } from "./notebook-context";

export function SavePageButton() {
  const { triggerSave, isSaving, hasSaved } = useNotebook();

  return (
    <button
      type="button"
      onClick={triggerSave}
      disabled={isSaving}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all border
        hover:cursor-pointer
        ${
          hasSaved
            ? "bg-green-500/10 border-green-500/50 text-green-400"
            : "bg-[#252525] border-[#333] text-gray-300 hover:bg-[#333] hover:border-[#555]"
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
      {isSaving ? "Salvando..." : hasSaved ? "Salvo!" : "Salvar Progresso"}
    </button>
  );
}
