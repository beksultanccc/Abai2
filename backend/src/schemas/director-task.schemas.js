import { z } from "zod";

export const createDirectorTaskSchema = z.object({
  title: z.string().min(3, "Тапсырма атауы қажет"),
  description: z.string().min(5, "Сипаттама қажет"),
  priority: z.string().default("Орташа"),
  status: z.string().default("Жаңа"),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.coerce.number().int().positive(),
});

export const updateDirectorTaskSchema = z.object({
  status: z.string().min(2, "Күйі қажет"),
});
