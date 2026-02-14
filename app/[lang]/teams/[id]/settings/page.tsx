"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Home,
  Loader2,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { use, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { BackButton } from "@/components/interface/back-button";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { handleApiError } from "@/lib/api/handle-api-error";
import {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamRoles,
  inviteTeamMember,
  updateTeam,
} from "@/lib/api/teams-service";
import { cn } from "@/lib/cn";
import type {
  Team,
  TeamMemberWithUserData,
  TeamRole,
} from "@/lib/types/team-types";

const teamFormSchema = z.object({
  name: z.string().min(2, "O nome do time deve ter pelo menos 2 caracteres."),
  description: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TeamManagementPage({ params }: PageProps) {
  const t = useTranslations("api_errors");
  const resolvedParams = use(params);
  const teamId = resolvedParams.id;

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

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchTeam(teamId),
      fetchTeamRoles(teamId),
      fetchTeamMembers(teamId),
    ])
      .then(([t, r, m]) => {
        setTeam(t);
        setRoles(r);
        setMembers(m);

        form.reset({
          name: t.name,
          description: t.description || "",
        });
      })
      .catch(() => {
        toast.error("Erro ao carregar dados do time.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [teamId, form]);

  async function onSubmit(data: TeamFormValues) {
    setIsSaving(true);
    try {
      await updateTeam(teamId, data);

      toast.success("Configurações do time atualizadas com sucesso.");

      setTeam((prev) =>
        prev
          ? { ...prev, name: data.name, description: data.description }
          : null,
      );

      form.reset(data);
    } catch (err) {
      handleApiError({ err, t });
    } finally {
      setIsSaving(false);
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteRoleId) return;

    setIsInviting(true);
    try {
      await inviteTeamMember(teamId, {
        email: inviteEmail,
        roleId: inviteRoleId,
      });

      toast.success("Membro convidado!");

      const updatedMembers = await fetchTeamMembers(teamId);
      setMembers(updatedMembers);

      setInviteEmail("");
      setInviteRoleId("");
      setIsInviteDialogOpen(false);
    } catch (err) {
      handleApiError({ err, t });
    } finally {
      setIsInviting(false);
    }
  };

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
        <span> Time não encontrado.</span>
        <Button asChild className="flex">
          <Link href="/docs">
            <Home className="size-4" />
            Voltar para o início
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl min-w-3xl mx-auto p-2 md:p-6 space-y-6">
      <div className="flex flex-col space-y-2 text-center sm:text-left">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{team.name}</h2>
          <p className="text-muted-foreground">
            Gerencie configurações, membros e permissões do time.
          </p>
        </div>
        <div className="flex justify-start">
          <BackButton />
        </div>
      </div>

      <Separator />

      <div className="flex border-b border-border overflow-x-auto">
        <TabButton
          active={activeTab === "general"}
          onClick={() => setActiveTab("general")}
          icon={<Settings size={16} />}
          label="Geral"
        />
        <TabButton
          active={activeTab === "members"}
          onClick={() => setActiveTab("members")}
          icon={<Users size={16} />}
          label="Membros"
        />
        <TabButton
          active={activeTab === "roles"}
          onClick={() => setActiveTab("roles")}
          icon={<Shield size={16} />}
          label="Cargos"
        />
      </div>

      <div className="pt-4">
        {activeTab === "general" && (
          <div className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="size-5" />
                      Configurações Gerais
                    </CardTitle>
                    <CardDescription>
                      Atualize o nome e as informações básicas do seu time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <FormLabel>Nome do Time</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Qual o propósito deste time?"
                              className="min-h-25 resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end border-t px-6 py-4">
                    <Button
                      type="submit"
                      disabled={isSaving || !form.formState.isDirty}
                    >
                      {isSaving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {!isSaving && <Save className="mr-2 h-4 w-4" />}
                      Salvar Alterações
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>

            <Card className="border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="size-5" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription className="text-destructive/80">
                  Ações destrutivas e irreversíveis para este time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">Excluir Time</p>
                    <p className="text-sm text-muted-foreground">
                      A exclusão apagará permanentemente todos os cadernos e
                      removerá todos os membros.
                    </p>
                  </div>
                  <Button variant="destructive" className="gap-2 shrink-0">
                    <Trash2 size={16} /> Excluir Time
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "members" && (
          <Card>
            <CardHeader className="grid grid-cols-1 md:flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Membros da Equipe
                </CardTitle>
                <CardDescription>
                  Gerencie quem tem acesso aos recursos deste time.
                </CardDescription>
              </div>

              <AlertDialog
                open={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus size={16} /> Convidar Membro
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <form onSubmit={handleInviteMember}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Adicionar Membro</AlertDialogTitle>
                      <AlertDialogDescription>
                        Insira o e-mail do usuário que você deseja adicionar a
                        este time e defina o cargo dele.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="flex flex-col gap-4 py-4">
                      <div className="space-y-2">
                        <Label>E-mail do Usuário</Label>
                        <Input
                          type="email"
                          required
                          placeholder="usuario@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo no Time</Label>
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
                            Selecione um cargo...
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
                        Cancelar
                      </AlertDialogCancel>
                      <Button
                        type="submit"
                        disabled={isInviting || !inviteEmail || !inviteRoleId}
                      >
                        {isInviting && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Enviar Convite
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
                      <span className="text-sm font-medium">
                        {member[0].name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member[0].email}
                      </span>
                      <span className="text-xs text-muted-foreground opacity-75">
                        Entrou em{" "}
                        {new Date(member[0].joined_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">
                        {member[1].name}
                      </span>
                      {!member[1].can_manage_team && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Remover Membro"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {members.length === 0 && (
                  <div className="p-8 text-sm text-center text-muted-foreground">
                    Nenhum membro encontrado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "roles" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Cargos e Permissões
                </CardTitle>
                <CardDescription>
                  Configure os níveis de acesso e controle dos membros.
                </CardDescription>
              </div>
              <Button size="sm" className="gap-2">
                <Plus size={16} /> Novo Cargo
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-primary"
                      >
                        Editar
                      </Button>
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <PermissionItem
                        label="Ler Notebook"
                        active={role.can_read}
                      />
                      <PermissionItem
                        label="Escrever/Editar"
                        active={role.can_write}
                      />
                      <PermissionItem
                        label="Gerenciar Privacidade de Notebooks"
                        active={role.can_manage_privacy}
                      />
                      <PermissionItem
                        label="Convidar Novos Membros"
                        active={role.can_invite_users}
                      />
                      <PermissionItem
                        label="Gerenciar Permissões"
                        active={role.can_manage_permissions}
                      />
                      <PermissionItem
                        label="Gerenciar Clones de Notebook"
                        active={role.can_manage_clones}
                      />
                      <PermissionItem
                        label="Gerenciar Todo o Time"
                        active={role.can_manage_team}
                      />
                      <PermissionItem
                        label="Remover Usuários"
                        active={role.can_remove_users}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

function PermissionItem({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          active ? "text-primary font-medium" : "text-muted-foreground/40"
        }
      >
        {active ? "Sim" : "Não"}
      </span>
    </div>
  );
}
