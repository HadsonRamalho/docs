import z from "zod";

export const loginSchema = z.object({
  email: z.email("Digite um e-mail válido"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.email("Digite um e-mail válido"),
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
