import { z } from "zod";

export const submitAssignmentSchema = z.object({
  answer: z.string().min(1, "Жауап бос болмауы керек"),
});

export const gradeSubmissionSchema = z.object({
  score: z.coerce.number().int().min(0).max(100),
  feedback: z.string().optional().default(""),
});
