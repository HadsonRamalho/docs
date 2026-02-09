import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

function LoginContent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
