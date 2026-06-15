import { z } from 'zod';

export const courseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  description: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 semester').max(20, 'Duration maximum is 20'),
  is_active: z.boolean(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export const subjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  course: z.string().min(1, 'Course selection is required'),
  teacher: z.string().nullable().optional(),
  description: z.string().optional(),
  credits: z.number().min(1, 'Credits must be at least 1').max(10, 'Credits maximum is 10'),
  is_active: z.boolean(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
