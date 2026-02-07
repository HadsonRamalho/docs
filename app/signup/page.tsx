import Image from "next/image";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex mx-auto items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <h1 className="text-xl font-bold">Docs</h1>
          </div>
        </a>
        <SignupForm />
      </div>
    </div>
  );
}
