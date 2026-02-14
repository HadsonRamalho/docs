import { Copy, Loader2, Lock, Printer, Share2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ControlRules = {
  showPrivacySelector: boolean;
  showClone: boolean;
  showShare: boolean;
  showExport: boolean;
};

interface ControlActionsProps {
  rules: ControlRules;
  isPublic: boolean;
  isCloning: boolean;
  onToggleVisibility: (isPublic: boolean) => void;
  onClone: () => void;
  onShare: () => void;
  onExport: () => void;
}

export function ControlActions({
  rules,
  isPublic,
  isCloning,
  onToggleVisibility,
  onClone,
  onShare,
  onExport,
}: ControlActionsProps) {
  const t = useTranslations("notebook_controls");

  return (
    <div className="grid grid-cols-1 w-full md:w-auto md:flex gap-2 items-center justify-center md:justify-start print:hidden">
      {rules.showPrivacySelector && (
        <Select
          value={isPublic ? "true" : "false"}
          onValueChange={(val) => onToggleVisibility(val === "true")}
        >
          <SelectTrigger className="w-full md:w-45">
            <SelectValue placeholder={t("visibility")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="false">
                <Lock className="size-4 mr-2 inline-block" />
                {t("private")}
              </SelectItem>
              <SelectItem value="true">
                <Users className="size-4 mr-2 inline-block" />
                {t("public")}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {rules.showClone && (
        <Button
          onClick={onClone}
          disabled={isCloning}
          className="w-full md:w-auto"
        >
          {isCloning ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Copy className="size-4 mr-2" />
          )}
          {t("clone")}
        </Button>
      )}

      {rules.showShare && (
        <Button
          onClick={onShare}
          variant="secondary"
          className="gap-2 shadow-sm w-full md:w-auto"
        >
          <Share2 size={16} />
          {t("share")}
        </Button>
      )}

      {rules.showExport && (
        <Button
          onClick={onExport}
          className="gap-2 backdrop-blur-sm w-full md:w-auto"
        >
          <Printer className="size-4" />
          {t("pdf")}
        </Button>
      )}
    </div>
  );
}
