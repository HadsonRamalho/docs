import * as z from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z.email("Digite um e-mail válido."),
});
