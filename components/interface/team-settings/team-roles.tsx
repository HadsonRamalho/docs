"use client";

import { Plus, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeamRole } from "@/lib/types/team-types";

interface TeamRolesProps {
  roles: TeamRole[];
}

export function TeamRoles({ roles }: TeamRolesProps) {
  const a = useTranslations("team_settings.team_role");
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            {a("title")}
          </CardTitle>
          <CardDescription>{a("description")}</CardDescription>
        </div>
        <Button size="sm" className="gap-2">
          <Plus size={16} /> {a("new_role_button")}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className="border rounded-lg p-5 bg-card space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-semibold">{role.name}</h4>
                <Button variant="ghost" size="sm" className="h-8 text-primary">
                  {a("edit_role_button")}
                </Button>
              </div>

              <div className="space-y-2.5 text-sm">
                <PermissionItem label="Ler Notebook" active={role.can_read} />
                <PermissionItem
                  label={a("roles.can_write")}
                  active={role.can_write}
                />
                <PermissionItem
                  label={a("roles.can_manage_privacy")}
                  active={role.can_manage_privacy}
                />
                <PermissionItem
                  label={a("roles.can_invite_users")}
                  active={role.can_invite_users}
                />
                <PermissionItem
                  label={a("roles.can_manage_permissions")}
                  active={role.can_manage_permissions}
                />
                <PermissionItem
                  label={a("roles.can_manage_clones")}
                  active={role.can_manage_clones}
                />
                <PermissionItem
                  label={a("roles.can_manage_team")}
                  active={role.can_manage_team}
                />
                <PermissionItem
                  label={a("roles.can_remove_users")}
                  active={role.can_remove_users}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionItem({ label, active }: { label: string; active: boolean }) {
  const a = useTranslations("team_settings.team_role");

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          active ? "text-primary font-medium" : "text-muted-foreground/40"
        }
      >
        {active ? a("active") : a("inactive")}
      </span>
    </div>
  );
}
