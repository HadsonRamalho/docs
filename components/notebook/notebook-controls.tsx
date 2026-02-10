"use client";

import { Check, Copy, Loader2, Lock, Save, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { Button } from "../ui/button";
import { useNotebook } from "./notebook-context";

export function NotebookControls() {
  const { user } = useAuth();
  const {
    triggerSave,
    isSaving,
    hasSaved,
    setVisibility,
    notebook,
    isPublic,
    triggerClone,
    isCloning,
  } = useNotebook();

  const isOwner = user && notebook && user.id === notebook.userId;

  if (!isOwner) {
    return (
      <div className="flex w-full justify-between gap-2">
        <Button onClick={triggerClone}>
          <Copy />
          Fazer uma cópia
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:flex w-full justify-between gap-2">
      <div className="grid grid-cols-1 w-full md:w-100 md:flex gap-2 items-center justify-center md:justify-start">
        <Select
          value={isPublic ? "true" : "false"}
          onValueChange={(val) => setVisibility(val === "true")}
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder="Visibilidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="false">
                <Lock className="size-4" />
                Privado
              </SelectItem>
              <SelectItem value="true">
                <Users className="size-4" />
                Público
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          onClick={triggerClone}
          disabled={isCloning}
          className="w-full md:w-40"
        >
          {isCloning ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              <Copy />
              Fazer uma cópia
            </>
          )}
        </Button>
      </div>
      <Button
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
      </Button>
    </div>
  );
}
