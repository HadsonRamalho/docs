"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type React from "react";
import { createContext, useContext, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { handleApiError } from "@/lib/api/handle-api-error";
import {
  deleteNotebook,
  updateNotebookTitle,
  updateNotebookVisibility,
} from "@/lib/api/notebook-service";
import { createTeamPage, fetchTeamPages } from "@/lib/api/teams-service";
import type { NotebookMeta } from "@/lib/types";

interface TeamNotebookManagerType {
  teamPages: Record<string, NotebookMeta[]>;

  refreshTeamPages: (teamId: string) => Promise<void>;
  createTeamPage: (teamId: string) => Promise<void>;
  deleteTeamPage: (teamId: string, pageId: string) => Promise<void>;
  renameTeamPage: (
    teamId: string,
    pageId: string,
    newTitle: string,
  ) => Promise<void>;
  updateTeamPageVisibility: (
    teamId: string,
    pageId: string,
    visible: boolean,
  ) => Promise<void>;
}

const TeamNotebookManagerContext = createContext<
  TeamNotebookManagerType | undefined
>(undefined);

export function TeamNotebookManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("api_errors");
  const { user } = useAuth();
  const router = useRouter();

  const [teamPages, setTeamPages] = useState<Record<string, NotebookMeta[]>>(
    {},
  );

  const refreshTeamPages = async (teamId: string) => {
    if (!user) return;
    try {
      const data = await fetchTeamPages(teamId);

      setTeamPages((prev) => ({
        ...prev,
        [teamId]: data,
      }));
    } catch (err) {
      console.error(`Erro ao buscar páginas do time ${teamId}:`, err);
    }
  };

  const createPageForTeam = async (teamId: string) => {
    if (!user) return;

    try {
      const newId = await createTeamPage(teamId);

      await refreshTeamPages(teamId);

      router.push(`/docs/${newId}`);
    } catch (err) {
      handleApiError({ err, t });
    }
  };

  const renameTeamPage = async (
    teamId: string,
    pageId: string,
    newTitle: string,
  ) => {
    if (!user || !newTitle.trim()) return;

    try {
      await updateNotebookTitle(pageId, newTitle);

      window.dispatchEvent(
        new CustomEvent("notebook-title-updated", {
          detail: { id: pageId, title: newTitle },
        }),
      );

      await refreshTeamPages(teamId);
    } catch (err) {
      handleApiError({ err, t });
    }
  };

  const updateTeamPageVisibility = async (
    teamId: string,
    pageId: string,
    isVisible: boolean,
  ) => {
    if (!user) return;

    try {
      await updateNotebookVisibility(pageId, isVisible);
      await refreshTeamPages(teamId);
    } catch (err) {
      handleApiError({ err, t });
    }
  };

  const deletePageForTeam = async (teamId: string, pageId: string) => {
    if (!user) return;

    try {
      await deleteNotebook(pageId);
      await refreshTeamPages(teamId);
      router.push("/docs");
    } catch (err) {
      handleApiError({ err, t });
    }
  };

  return (
    <TeamNotebookManagerContext.Provider
      value={{
        teamPages,
        refreshTeamPages,
        createTeamPage: createPageForTeam,
        renameTeamPage,
        updateTeamPageVisibility,
        deleteTeamPage: deletePageForTeam,
      }}
    >
      {children}
    </TeamNotebookManagerContext.Provider>
  );
}

export const useTeamNotebookManager = () => {
  const context = useContext(TeamNotebookManagerContext);
  if (!context)
    throw new Error("useTeamNotebookManager must be used within Provider");
  return context;
};
