"use client";

import {
  ChevronDown,
  ChevronRight,
  FileText,
  Plus,
  RotateCw,
  Settings,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Button } from "../ui/button";
import { useTeamNotebookManager } from "./team/team-notebook-manager";

interface TeamSidebarProps {
  team: { id: string; name: string };
}

export function TeamSidebar({ team }: TeamSidebarProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { teamPages, createTeamPage, refreshTeamPages } =
    useTeamNotebookManager();

  if (!user) {
    return null;
  }

  const pages = teamPages[team.id] || [];

  const handleCreatePage = (e: React.MouseEvent) => {
    e.stopPropagation();
    createTeamPage(team.id);
    setIsOpen(true);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex bg-card  items-center justify-between p-2 w-full hover:bg-muted rounded-md group text-sm text-muted-foreground hover:text-foreground transition-colors">
        <div
          className="flex items-center gap-2 overflow-hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronDown size={14} className="shrink-0" />
          ) : (
            <ChevronRight size={14} className="shrink-0" />
          )}
          <Users size={14} className="shrink-0" />
          <span className="font-medium truncate">{team.name}</span>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            className="rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity size-5"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`teams/${team.id}/settings`);
            }}
          >
            <Settings className="size-4" />
          </Button>

          <Button
            onClick={() => {
              refreshTeamPages(team.id);
            }}
            className="rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity size-5"
          >
            <RotateCw className="size-4" />
          </Button>

          <Button
            onClick={handleCreatePage}
            className="rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity size-5"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-1 pl-6 pr-1 mt-1">
          {pages.length === 0 ? (
            <span className="p-2 text-xs text-muted-foreground italic">
              Vazio
            </span>
          ) : (
            pages.map((page) => {
              const pageRoute = `/docs/${page.id}`;
              const isActive = pathname === pageRoute;

              return (
                <Button
                  key={page.id}
                  onClick={() => router.push(pageRoute)}
                  variant="ghost"
                  className={`flex items-center justify-start gap-2 p-2 h-8 w-full ${
                    isActive
                      ? "bg-muted text-sidebar-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileText className="shrink-0 size-4" />
                  <span className="truncate max-w-35 text-xs">
                    {page.title}
                  </span>
                </Button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
