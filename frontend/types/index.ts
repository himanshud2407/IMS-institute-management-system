/**
 * TypeScript Type Definitions
 * ===========================
 * Core type interfaces for the IMS Next.js frontend application.
 */

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password?: string; // Optional for validation, but needed for submission
}

export interface RegisterRequest {
  email: string;
  password?: string;
  confirm_password?: string;
  full_name: string;
  role: UserRole;
}

export interface ChangePasswordRequest {
  old_password?: string;
  new_password?: string;
  confirm_new_password?: string;
}

/**
 * Standardized API Response from CustomJSONRenderer
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standardized API Error Response from CustomJSONRenderer
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: Record<string, string[] | string | unknown>;
}

/**
 * Paginated list response wrapped inside ApiResponse.data
 */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Future components or pages might require other shared types:
export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  duration: number; // Duration in months or semesters
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  course: string; // Course ID
  course_details?: Course;
  teacher?: string | null; // Teacher ID
  teacher_details?: Teacher;
  description: string;
  credits: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Teacher {
  id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  };
  employee_id: string;
  department: string;
  qualification: string;
  specialization?: string;
  phone_number: string;
  joining_date: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  subjects_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Student {
  id: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
  };
  roll_number: string;
  course: {
    id: string;
    name: string;
    code: string;
    description: string;
    is_active: boolean;
  };
  date_of_birth: string;
  gender: string;
  address: string;
  phone_number: string;
  admission_date: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED';
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student: string;
  student_name?: string;
  student_roll?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  source?: 'MANUAL' | 'BIOMETRIC';
  confidence?: string | null;
  verified_at?: string | null;
}

export interface AttendanceSession {
  id: string;
  subject: string;
  subject_name?: string;
  subject_code?: string;
  subject_course?: string;
  teacher?: string | null;
  teacher_name?: string;
  date: string;
  topic?: string;
  notes?: string;
  total_students?: number;
  present_count?: number;
  absent_count?: number;
  records?: AttendanceRecord[];
  created_at?: string;
}

export interface AttendanceSummary {
  subject_id: string;
  subject_name: string;
  total_sessions: number;
  present: number;
  absent: number;
  late: number;
  attendance_percentage: number;
}

export interface BiometricProfile {
  id: string;
  student: string;
  student_name?: string;
  student_roll?: string;
  is_enrolled: boolean;
  is_active: boolean;
  sample_size: number;
  consent_given_at: string;
  last_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';

export interface AssignmentSubmission {
  id: string;
  assignment: string;
  assignment_title?: string;
  subject_name?: string;
  student: string;
  student_name?: string;
  student_roll?: string;
  content: string;
  attachment_url?: string;
  submitted_at: string;
  status: SubmissionStatus;
  marks_obtained?: string | null;
  feedback?: string;
  graded_by?: string | null;
  graded_by_name?: string;
  graded_at?: string | null;
  is_late?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Assignment {
  id: string;
  subject: string;
  subject_name?: string;
  subject_code?: string;
  teacher?: string | null;
  teacher_name?: string;
  title: string;
  description: string;
  instructions?: string;
  attachment_url?: string;
  due_date: string;
  max_marks: number;
  status: AssignmentStatus;
  is_overdue?: boolean;
  submissions_count?: number;
  graded_count?: number;
  my_submission?: AssignmentSubmission | null;
  created_at?: string;
  updated_at?: string;
}

export type ExamType = 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICAL' | 'ASSIGNMENT';
export type ExamStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type ResultStatus = 'PASS' | 'FAIL' | 'ABSENT' | 'WITHHELD';

export interface Exam {
  id: string;
  subject: string;
  subject_name?: string;
  subject_code?: string;
  subject_course?: string;
  teacher?: string | null;
  teacher_name?: string;
  title: string;
  exam_type: ExamType;
  exam_date: string;
  start_time: string;
  end_time: string;
  total_marks: number;
  passing_marks: number;
  status: ExamStatus;
  description?: string;
  results_published: boolean;
  results_count?: number;
  pass_count?: number;
  is_past?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ExamResult {
  id: string;
  exam: string;
  exam_title?: string;
  subject_name?: string;
  subject_code?: string;
  total_marks?: number;
  student: string;
  student_name?: string;
  student_roll?: string;
  marks_obtained?: string | null;
  grade?: string;
  status: ResultStatus;
  remarks?: string;
  entered_by?: string | null;
  entered_by_name?: string;
  published_at?: string | null;
  percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export type FeeType = 'TUITION' | 'EXAM' | 'LIBRARY' | 'HOSTEL' | 'TRANSPORT' | 'OTHER';
export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'CHEQUE';

export interface FeePayment {
  id: string;
  invoice: string;
  invoice_title?: string;
  student_name?: string;
  amount: string;
  payment_date: string;
  method: PaymentMethod;
  reference_number?: string;
  notes?: string;
  recorded_by?: string | null;
  recorded_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeeInvoice {
  id: string;
  student: string;
  student_name?: string;
  student_roll?: string;
  course_name?: string;
  title: string;
  fee_type: FeeType;
  academic_year: string;
  amount: string;
  due_date: string;
  status: FeeStatus;
  description?: string;
  paid_amount?: string;
  balance_amount?: string;
  is_overdue?: boolean;
  payments?: FeePayment[];
  created_at?: string;
  updated_at?: string;
}

export interface FeeSummary {
  total_invoiced: string;
  total_paid: string;
  total_balance: string;
  pending_count: number;
  overdue_count: number;
}

export type NotificationAudience = 'ALL' | 'ADMINS' | 'TEACHERS' | 'STUDENTS' | 'USER';
export type NotificationCategory = 'GENERAL' | 'ACADEMIC' | 'FEES' | 'EXAMS' | 'ATTENDANCE';
export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Notification {
  id: string;
  title: string;
  message: string;
  audience: NotificationAudience;
  recipient?: string | null;
  recipient_name?: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  is_published: boolean;
  publish_at: string;
  created_by?: string | null;
  created_by_name?: string;
  is_read?: boolean;
  read_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationRecipient {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface DashboardStats {
  role: UserRole;
  stats: Record<string, string | number>;
  recent_activity: Array<{
    label: string;
    count: number;
  }>;
}

export interface AdminReport {
  overview: Record<string, number>;
  academics: Record<string, number>;
  finance: {
    invoiced: string;
    collected: string;
    balance: string;
    overdue_invoices: number;
  };
  courses: Array<{
    id: string;
    name: string;
    code: string;
    students_count: number;
    subjects_count: number;
  }>;
}
