"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function BackButton({ showText = true }: { showText?: boolean }) {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} className="hover:cursor-pointer">
      <ArrowLeft />
      {showText && "Voltar"}
    </Button>
  );
}
