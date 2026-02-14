import { BookSearch, Calendar, Search, User, Users } from "lucide-react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BackButton } from "@/components/interface/back-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicNotebooks } from "@/lib/api/notebook-service";
import type { PublicNotebookResponse } from "@/lib/types/notebook-types";

export const revalidate = 60;

export default async function PublicNotebooksPage() {
  const t = await getTranslations("public_notebooks");
  const locale = await getLocale();

  let notebooks: PublicNotebookResponse[] = [];
  try {
    notebooks = await fetchPublicNotebooks();
  } catch (error) {
    console.error("Erro ao buscar cadernos públicos:", error);
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookSearch className="h-8 w-8 text-primary" />
            {t("title")}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {t("description")}
          </p>
          <BackButton />
        </div>
      </div>

      {notebooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((notebook) => {
            const isTeam = !!notebook.team_id;

            const formattedDate = new Date(
              notebook.updated_at,
            ).toLocaleDateString(locale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <Link key={notebook.id} href={`/docs/${notebook.id}`}>
                <Card className="h-full flex flex-col hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="line-clamp-2 text-xl group-hover:text-primary transition-colors">
                        {notebook.title}
                      </CardTitle>

                      <Badge
                        variant={isTeam ? "default" : "secondary"}
                        className="shrink-0 flex items-center gap-1"
                      >
                        {isTeam ? <Users size={12} /> : <User size={12} />}
                        {isTeam ? t("badge_team") : t("badge_personal")}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardFooter className="border-t pt-4 text-xs text-muted-foreground flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium truncate">
                      {isTeam ? <Users size={14} /> : <User size={14} />}
                      <span
                        className="truncate max-w-30"
                        title={notebook.owner_name}
                      >
                        {notebook.owner_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Calendar size={14} />
                      {formattedDate}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/10 border-dashed">
          <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold"> {t("empty_state_title")}</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            {t("empty_state_description")}
          </p>
        </div>
      )}
    </div>
  );
}
