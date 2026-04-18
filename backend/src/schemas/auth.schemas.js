import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Аты-жөні тым қысқа"),
  email: z.string().email("Email дұрыс емес"),
  password: z.string().min(6, "Құпиясөз кемінде 6 таңба болуы керек"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]).default("STUDENT"),
  grade: z.coerce.number().min(1).max(11).optional(),
  section: z.string().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Email дұрыс емес"),
  password: z.string().min(1, "Құпиясөз енгізіңіз"),
});