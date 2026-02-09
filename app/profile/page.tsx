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
          <ProfileForm />
        </div>
      </main>
    </div>
  );
}
