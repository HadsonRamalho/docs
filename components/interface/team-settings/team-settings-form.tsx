"use client";

import { Home, Loader2, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/interface/back-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { handleApiError } from "@/lib/api/handle-api-error";
import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRoles,
  getUserTeamPermissions,
} from "@/lib/api/teams-service";
import type {
  Team,
  TeamMemberWithUserData,
  TeamRole,
} from "@/lib/types/team-types";
import { TeamData } from "./team-data";
import { TeamMembers } from "./team-members";
import { TeamRoles } from "./team-roles";

interface TeamSettingsFormProps {
  teamId: string;
}

export default function TeamSettingsForm({ teamId }: TeamSettingsFormProps) {
  const t = useTranslations("team_settings.team_form");

  const [activeTab, setActiveTab] = useState<"general" | "members" | "roles">(
    "general",
  );

  const [team, setTeam] = useState<Team | null>(null);
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [members, setMembers] = useState<[TeamMemberWithUserData, TeamRole][]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [userPermissions, setUserPermissions] = useState<TeamRole | undefined>(
    undefined,
  );

  const reloadTeamRoles = async () => {
    try {
      const tempRoles = await fetchTeamRoles(teamId);
      setRoles(tempRoles);
    } catch (err) {
      handleApiError({ err, t });
    }
  };

  const reloadTeamMembers = async () => {
    try {
      const tempMembers = await fetchTeamMembers(teamId);
      setMembers(tempMembers);
    } catch (err) {
      handleApiError({ err, t });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getUserTeamPermissions(teamId),
      fetchTeam(teamId),
      fetchTeamMembers(teamId),
    ])
      .then(async ([p, t, m]) => {
        const fetchedPermissions = p[1];

        setUserPermissions(fetchedPermissions);
        setTeam(t);
        setMembers(m);

        if (fetchedPermissions?.can_manage_permissions) {
          const r = await fetchTeamRoles(teamId);
          setRoles(r);
        } else {
          setRoles([]);
        }
      })
      .catch(() => {
        toast.error("Erro ao carregar dados do time.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [teamId]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground h-8 w-8" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-[50vh] flex-col gap-4 items-center justify-center text-muted-foreground">
        <span> {t("team_not_found")}</span>
        <Button asChild className="flex">
          <Link href="/docs">
            <Home className="size-4" />
            {t("back_to_home")}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl md:min-w-3xl mx-auto p-2 md:p-6 space-y-6">
      <div className="flex flex-col space-y-2 text-center sm:text-left">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{team.name}</h2>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex justify-start">
          <BackButton />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:flex border-b border-border overflow-x-auto">
        <TabButton
          active={activeTab === "general"}
          onClick={() => setActiveTab("general")}
          icon={<Settings size={16} />}
          label={t("general_tab")}
        />
        <TabButton
          active={activeTab === "members"}
          onClick={() => setActiveTab("members")}
          icon={<Users size={16} />}
          label={t("member_tab")}
        />
        {roles.length > 0 && (
          <TabButton
            active={activeTab === "roles"}
            onClick={() => setActiveTab("roles")}
            icon={<Shield size={16} />}
            label={t("role_tab")}
          />
        )}
      </div>

      <div className="pt-4">
        {activeTab === "general" && (
          <TeamData
            isSaving={isSaving}
            setIsSaving={setIsSaving}
            teamId={teamId}
            setTeam={setTeam}
            team={team}
            userPermissions={userPermissions}
          />
        )}

        {activeTab === "members" && (
          <TeamMembers
            teamId={teamId}
            userPermissions={userPermissions}
            roles={roles}
            members={members}
            onUpdate={reloadTeamMembers}
          />
        )}

        {activeTab === "roles" && roles.length > 0 && (
          <TeamRoles roles={roles} teamId={teamId} onUpdate={reloadTeamRoles} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {icon} {label}
    </button>
  );
}
