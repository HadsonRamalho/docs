import z from "zod";

type Translator = (key: string) => string;

export const getTeamFormSchema = (t: Translator) =>
  z.object({
    name: z.string().min(2, t("invalid_team_name")),
    description: z.string().optional(),
  });
