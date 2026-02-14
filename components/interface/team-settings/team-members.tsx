"use client";

import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { handleApiError } from "@/lib/api/handle-api-error";
import { inviteTeamMember } from "@/lib/api/teams-service";
import { cn } from "@/lib/cn";
import type { TeamMemberWithUserData, TeamRole } from "@/lib/types/team-types";

interface TeamMembersProps {
  teamId: string;
  userPermissions: TeamRole | undefined;
  roles: TeamRole[];
  members: [TeamMemberWithUserData, TeamRole][];
}

export function TeamMembers({
  userPermissions,
  teamId,
  roles,
  members,
}: TeamMembersProps) {
  const a = useTranslations("team_settings.team_member");
  const t = useTranslations("api_errors");

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteRoleId) return;

    setIsInviting(true);
    try {
      await inviteTeamMember(teamId, {
        email: inviteEmail,
        roleId: inviteRoleId,
      });

      toast.success(a("invited_member"));

      setInviteEmail("");
      setInviteRoleId("");
      setIsInviteDialogOpen(false);
    } catch (err) {
      handleApiError({ err, t });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="grid grid-cols-1 md:flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            {a("title")}
          </CardTitle>
          <CardDescription>{a("description")}</CardDescription>
        </div>

        <AlertDialog
          open={isInviteDialogOpen}
          onOpenChange={setIsInviteDialogOpen}
        >
          <AlertDialogTrigger asChild>
            {userPermissions?.can_invite_users && (
              <Button size="sm" className="gap-2">
                <Plus size={16} /> {a("invite_member_button")}
              </Button>
            )}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <form onSubmit={handleInviteMember}>
              <AlertDialogHeader>
                <AlertDialogTitle>{a("add_member_title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {a("add_member_description")}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="flex flex-col gap-4 py-4">
                <div className="space-y-2">
                  <Label>{a("user_email")}</Label>
                  <Input
                    type="email"
                    required
                    placeholder="u123@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{a("user_role")}</Label>
                  <select
                    required
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-background ",
                      "px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent",
                      " file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none",
                      " focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    <option value="" disabled>
                      {a("select_role")}
                    </option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel
                  type="button"
                  onClick={() => {
                    setInviteEmail("");
                    setInviteRoleId("");
                  }}
                >
                  {a("cancel_button")}
                </AlertDialogCancel>
                <Button
                  type="submit"
                  disabled={isInviting || !inviteEmail || !inviteRoleId}
                >
                  {isInviting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {a("send_invite")}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent>
        <div className="divide-y divide-border border rounded-md">
          {members.map((member) => (
            <div
              key={member[0].id}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{member[0].name}</span>
                <span className="text-xs text-muted-foreground">
                  {member[0].email}
                </span>
                <span className="text-xs text-muted-foreground opacity-75">
                  {a("joined_on")}{" "}
                  {new Date(member[0].joined_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">
                  {member[1].name}
                </span>
                {!member[1].can_manage_team &&
                  (userPermissions?.can_manage_team ||
                    userPermissions?.can_remove_users) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title={a("remove_member_button")}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="p-8 text-sm text-center text-muted-foreground">
              {a("no_members_found")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
