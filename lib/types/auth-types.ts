import type z from "zod";
import type { loginSchema, signupSchema } from "../schemas/auth-schemas";

export type LoginFormValues = z.infer<typeof loginSchema>;

export type SignupFormValues = z.infer<typeof signupSchema>;
