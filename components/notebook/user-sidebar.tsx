"use client";

import { Plus, FileText, Trash } from "lucide-react";
import { useNotebookManager } from "./notebook-manager";
import { usePathname, useRouter } from "next/navigation";
import { DeletePageDialog } from "../delete-page-dialog";
import { SidebarBackup } from "../sidebar-backup";
import { Button } from "../ui/button";

export function UserSidebar() {
  const { pages, createPage } = useNotebookManager();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-white/10">
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-bold uppercase">Meu Caderno</span>
        <div className="flex items-center gap-1">
          <SidebarBackup />

          <div className="w-px h-3 bg-white/10 mx-1" />

          <button
            onClick={createPage}
            className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
            title="Nova Página"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-2">
        {pages.length === 0 && (
          <span className="px-2 text-xs text-muted-foreground italic">
            Nenhuma página criada
          </span>
        )}

        {pages.map((page) => {
          return (
            <div
              key={page.id}
              className="group flex items-center justify-between pr-2 rounded-md hover:bg-white/5"
            >
              <Button
                onClick={() => {
                  router.push(`/docs/${page.id}`);
                }}
                className={`... ${pathname === `/docs/${page.id}` ? "text-emerald-400 underline" : "text-emerald-700 ..."} flex items-center hover:cursor-pointer justify-center gap-2 p-2`}
              >
                <FileText size={14} />
                <span className="truncate">{page.title}</span>
              </Button>
              <DeletePageDialog pageId={page.id} pageTitle={page.title} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
