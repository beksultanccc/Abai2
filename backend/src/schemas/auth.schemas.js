import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Аты кемінде 2 таңба болуы керек"),
  email: z.string().email("Email қате"),
  password: z.string().min(6, "Құпиясөз кемінде 6 таңба болуы керек"),
  role: z.enum(["STUDENT", "TEACHER"]).default("STUDENT"),
});

export const loginSchema = z.object({
  email: z.string().email("Email қате"),
  password: z.string().min(6, "Құпиясөз кемінде 6 таңба болуы керек"),
});
