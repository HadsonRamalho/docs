"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, Lock, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { updateProfile } from "@/lib/api/user-service";
import { profileSchema } from "@/lib/schemas/user-schemas";
import type { ProfileFormValues } from "@/lib/types/user-types";
import { GithubIcon } from "./github-info";
import { GoogleIcon } from "./icons/google-icon";
import { BackButton } from "./interface/back-button";

export function ProfileForm() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const canEditEmail = user?.primary_provider === "Email";

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true);
    try {
      await updateProfile(data);

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isAuthLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 text-center sm:text-left">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e preferências.
          </p>
        </div>
        <div className="flex items-start justify-start">
          <BackButton />
        </div>
      </div>

      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus detalhes pessoais aqui.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="relative group cursor-pointer">
                  <Avatar className="h-24 w-24 border-2 border-border group-hover:opacity-75 transition-opacity">
                    <AvatarImage src={user?.avatar_url || ""} />
                    <AvatarFallback className="text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-full transition-opacity text-white">
                    <Camera className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-medium text-lg">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    type="button"
                  >
                    Alterar foto
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Email</FormLabel>
                        {!canEditEmail && (
                          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full flex items-center gap-1">
                            {user?.primary_provider === "Google" && (
                              <GoogleIcon />
                            )}
                            {user?.primary_provider === "Github" && (
                              <GithubIcon />
                            )}
                            Vinculado ao {user?.primary_provider}
                          </span>
                        )}
                      </div>

                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="seu@email.com"
                            {...field}
                            disabled={!canEditEmail}
                            className={
                              !canEditEmail
                                ? "bg-muted text-muted-foreground pr-10"
                                : ""
                            }
                          />
                          {!canEditEmail && (
                            <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button
                type="submit"
                disabled={isSaving || !form.formState.isDirty}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isSaving && <Save className="mr-2 h-4 w-4" />}
                Salvar Alterações
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription className="text-destructive/80">
            Ações irreversíveis relacionadas à sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Deletar Conta</p>
              <p className="text-sm text-muted-foreground">
                Isso excluirá permanentemente sua conta e todos os seus dados.
              </p>
            </div>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Deletar Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
