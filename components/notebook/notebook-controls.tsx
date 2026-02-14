"use client";

import { Copy, Loader2, Lock, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { getUserNotebookPermissions } from "@/lib/api/notebook-service";
import type { TeamRole } from "@/lib/types/team-types";
import { Button } from "../ui/button";
import { useNotebook } from "./notebook-context";

export function NotebookControls() {
  const { user } = useAuth();
  const {
    handleToggleVisibility,
    notebook,
    isPublic,
    triggerClone,
    isCloning,
  } = useNotebook();
  const t = useTranslations("notebook_controls");

  const [permissions, setPermissions] = useState<TeamRole | undefined>(
    undefined,
  );

  const loadPermissions = async () => {
    if (notebook) {
      const data = await getUserNotebookPermissions(notebook?.id);
      setPermissions(data);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [notebook]);

  if (!user) {
    return null;
  }

  if (!permissions?.can_write && permissions?.can_read) {
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
        {permissions?.can_manage_privacy && (
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
        )}
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
    </div>
  );
}
