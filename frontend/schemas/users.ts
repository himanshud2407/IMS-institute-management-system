import { z } from 'zod';

export const teacherSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  full_name: z.string().min(2, 'Full name is required'),
  employee_id: z.string().min(2, 'Employee ID is required'),
  department: z.string().min(2, 'Department is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  specialization: z.string().optional(),
  phone_number: z.string().min(5, 'Phone number is required'),
  joining_date: z.string().min(1, 'Joining date is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ON_LEAVE']),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  full_name: z.string().min(2, 'Full name is required'),
  roll_number: z.string().min(2, 'Roll number is required'),
  course: z.string().min(1, 'Course selection is required'),
  phone_number: z.string().min(5, 'Phone number is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  address: z.string().min(5, 'Address is required'),
  admission_date: z.string().min(1, 'Admission date is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED']),
});

export type StudentFormData = z.infer<typeof studentSchema>;
