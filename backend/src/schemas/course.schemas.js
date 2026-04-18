import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(2, "Курс атауы тым қысқа"),
  description: z.string().min(5, "Сипаттама тым қысқа"),
  category: z.string().optional().or(z.literal("")),
  thumbnailUrl: z.string().optional().or(z.literal("")),
  grade: z.coerce.number().min(1).max(11).optional(),
  section: z.string().optional().or(z.literal("")),
  teacherId: z.coerce.number().optional(),
});

export const createLessonSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(2),
  videoUrl: z.string().optional().or(z.literal("")),
  order: z.coerce.number().optional(),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  dueDate: z.string().optional().or(z.literal("")),
});