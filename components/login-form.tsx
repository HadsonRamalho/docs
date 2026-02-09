"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useAuth } from "@/context/auth-context";
import { BASE_URL } from "@/lib/api/base";
import { loginSchema } from "@/lib/schemas/auth-schemas";
import type { LoginFormValues } from "@/lib/types/auth-types";
import { cn } from "@/lib/utils";
import { GithubIcon } from "./github-info";
import { GoogleIcon } from "./icons/google-icon";
import { BackButton } from "./interface/back-button";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const authError = searchParams.get("auth_error");

  const handleGithubLogin = () => {
    const redirectUrl = `${BASE_URL}/user/login/github`;
    window.location.href = redirectUrl;
  };

  const handleAuthError = (e: string) => {
    switch (e) {
      case "token_failed":
        setError("Falha ao validar seu token do GitHub. Tente novamente.");
        break;
      case "github_response_failed":
        setError("Falha ao se comunicar com o GitHub. Tente novamente.");
        break;
      case "github_response_error":
        setError("Erro ao validar resposta do GitHub. Tente novamente.");
        break;
      case "github_data_error":
        setError(
          "Erro ao validar dados enviados pelo GitHub. Tente novamente.",
        );
        break;
      case "github_emails_not_found":
        setError(
          "Não encontramos seus e-mails vinculados ao GitHub. Tente novamente ou cadastre-se por outro meio.",
        );
        break;
      case "wrong_login_method":
        setError(
          "Erro ao realizar login. Tente novamente com outro método de autenticação.",
        );
        break;
      default:
        setError(
          "Não conseguimos nos comunicar com o GitHub. Tente novamente.",
        );
        break;
    }
    toast.error(error);
  };

  useEffect(() => {
    if (authError) {
      handleAuthError(authError);
    }
  }, [authError]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError("");

    try {
      await signIn(data);
    } catch (err: any) {
      setError(
        err.message || "Falha ao realizar login. Verifique suas credenciais.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="relative flex items-center justify-center w-full mb-2">
            <div className="absolute left-0">
              <BackButton showText={false} />
            </div>
            <CardTitle className="text-xl">Bem-vindo</CardTitle>
          </div>
          <CardDescription>
            Faça login com sua conta GitHub ou Google
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={handleGithubLogin}
              >
                <GithubIcon />
                Login com GitHub
              </Button>
              {/*
                <Button variant="outline" type="button" disabled={isLoading}>
                  <GoogleIcon />
                  Login com Google
                </Button> */}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Ou continue com
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid gap-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Seu e-mail"
                          type="email"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Senha</FormLabel>
                        <a
                          href="/"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Esqueceu a senha?
                        </a>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Sua senha"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-secondary text-foreground"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Login
                </Button>
              </form>
            </Form>

            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <a href="/signup" className="underline underline-offset-4">
                Cadastre-se
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="/">Termos de Serviço</a> e{" "}
        <a href="/">Política de Privacidade</a>.
      </div>
    </div>
  );
}
