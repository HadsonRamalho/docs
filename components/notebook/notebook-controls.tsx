"use client";

import { Check, Copy, Loader2, Lock, Save, Users } from "lucide-react";
import { useTranslations } from "next-intl";
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
    handleToggleVisibility,
    notebook,
    isPublic,
    triggerClone,
    isCloning,
  } = useNotebook();
  const t = useTranslations("notebook_controls");

  const isOwner = user && notebook && user.id === notebook.userId;

  if (!user) {
    return null;
  }

  if (!isOwner) {
    return (
      <div className="flex w-full justify-between gap-2">
        <Button onClick={triggerClone}>
          <Copy />
          {t("clone")}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:flex w-full justify-between gap-2">
      <div className="grid grid-cols-1 w-full md:w-100 md:flex gap-2 items-center justify-center md:justify-start">
        <Select
          value={isPublic ? "true" : "false"}
          onValueChange={(val) => handleToggleVisibility(val === "true")}
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder={t("visibility")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="false">
                <Lock className="size-4" />
                {t("private")}
              </SelectItem>
              <SelectItem value="true">
                <Users className="size-4" />
                {t("public")}
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
              {t("clone")}
            </>
          )}
        </Button>
      </div>
      <Button
        onClick={triggerSave}
        disabled={isSaving}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all border
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
        {isSaving ? t("saving") : hasSaved ? t("saved") : t("save")}
      </Button>
    </div>
  );
}
