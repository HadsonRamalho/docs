"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { githubSignIn } = useAuth();
  const token = searchParams.get("token");
  const error = searchParams.get("error") || searchParams.get("auth_error");

  useEffect(() => {
    if (token) {
      githubSignIn(token);
      return;
    }
    if (error) {
      router.push(`/login?auth_error=${error}`);
      return;
    }
    if (!token) {
      router.push("/login?auth_error=auth_failed");
      return;
    }
  }, [token]);

  return (
    <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Autenticando...</p>
    </div>
  );
}
