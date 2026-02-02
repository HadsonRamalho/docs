"use client";

import { useRef } from "react";
import { Settings, Download, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotebookManager } from "./docs/notebook-manager";

export function SidebarBackup() {
  const { downloadBackup, uploadBackup } = useNotebookManager();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        confirm(
          "Isso substituirá todas as suas notas atuais. Deseja continuar?",
        )
      ) {
        uploadBackup(file);
      }
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Configurações e Backup"
          >
            <Settings size={14} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-56 bg-[#1e1e1e] border-[#333] text-gray-200"
        >
          <DropdownMenuLabel>Gerenciar Dados</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#333]" />

          <DropdownMenuItem
            onClick={() => downloadBackup()}
            className="cursor-pointer hover:bg-[#333] focus:bg-[#333]"
          >
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar Tudo (.json)</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer hover:bg-[#333] focus:bg-[#333] text-emerald-400 focus:text-emerald-400"
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>Importar Backup</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
