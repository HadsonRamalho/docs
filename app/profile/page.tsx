import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile-form";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Perfil",
  description: "Gerencie as configurações da sua conta.",
};

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex flex-1 flex-col items-center mt-6 p-4">
        <div className="w-full max-w-6xl space-y-6">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e preferências.
            </p>
          </div>

          <Separator />

          <ProfileForm />
        </div>
      </main>
    </div>
  );
}
