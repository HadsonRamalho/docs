import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

function LoginContent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm space-y-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex mx-auto items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="text-xl font-bold">Docs</h1>
          </div>
        </a>
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
