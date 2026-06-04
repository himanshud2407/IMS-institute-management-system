# IMS Backend Schema

**Project:** Institute Management System (IMS)  
**Version:** 1.0  
**Backend:** Django + Django REST Framework  
**Database:** PostgreSQL  
**Prepared By:** Himanshu Desale

---

# 1. Backend Apps Structure

```text
backend/
│
├── accounts/
├── students/
├── teachers/
├── courses/
├── subjects/
├── attendance/
├── assignments/
├── examinations/
├── fees/
├── notifications/
├── reports/
└── common/
```

---

# 2. Database Entity Overview

```text
User
│
├── Student
├── Teacher
└── Admin

Course
│
└── Subject
      │
      └── Teacher

Student
│
├── Attendance
├── AssignmentSubmission
├── Result
└── FeePayment
```

---

# 3. Accounts App Schema

## User Model

Used for authentication and role-based access control.

| Field | Type | Description |
|------|------|-------------|
| id | UUID / AutoField | Primary key |
| full_name | CharField | User full name |
| email | EmailField | Unique email |
| password | CharField | Hashed password |
| role | CharField | ADMIN / TEACHER / STUDENT |
| is_active | BooleanField | Account active status |
| is_staff | BooleanField | Django admin access |
| is_superuser | BooleanField | Superuser access |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Role Choices

```python
ADMIN = "ADMIN"
TEACHER = "TEACHER"
STUDENT = "STUDENT"
```

---

# 4. Students App Schema

## Student Model

Stores academic and personal information of students.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| user | OneToOneField(User) | Linked user account |
| roll_number | CharField | Unique roll number |
| course | ForeignKey(Course) | Student course |
| date_of_birth | DateField | Date of birth |
| gender | CharField | Male / Female / Other |
| phone_number | CharField | Contact number |
| address | TextField | Student address |
| admission_date | DateField | Date of admission |
| status | CharField | ACTIVE / INACTIVE |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Relationship

```text
User 1 ─── 1 Student
Course 1 ─── many Students
```

---

# 5. Teachers App Schema

## Teacher Model

Stores teacher profile and professional information.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| user | OneToOneField(User) | Linked user account |
| employee_id | CharField | Unique employee ID |
| department | CharField | Department name |
| qualification | CharField | Teacher qualification |
| specialization | CharField | Subject specialization |
| phone_number | CharField | Contact number |
| joining_date | DateField | Joining date |
| status | CharField | ACTIVE / INACTIVE |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Relationship

```text
User 1 ─── 1 Teacher
Teacher 1 ─── many Subjects
```

---

# 6. Courses App Schema

## Course Model

Stores course or class details.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| name | CharField | Course name |
| code | CharField | Unique course code |
| description | TextField | Course details |
| duration | CharField | Course duration |
| is_active | BooleanField | Active status |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Relationship

```text
Course 1 ─── many Students
Course 1 ─── many Subjects
```

---

# 7. Subjects App Schema

## Subject Model

Stores subject details and assigned teacher.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| name | CharField | Subject name |
| code | CharField | Unique subject code |
| course | ForeignKey(Course) | Related course |
| teacher | ForeignKey(Teacher) | Assigned teacher |
| description | TextField | Subject description |
| is_active | BooleanField | Active status |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Relationship

```text
Course 1 ─── many Subjects
Teacher 1 ─── many Subjects
```

---

# 8. Attendance App Schema

## Attendance Model

Stores daily attendance records.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| student | ForeignKey(Student) | Student reference |
| subject | ForeignKey(Subject) | Subject reference |
| teacher | ForeignKey(Teacher) | Teacher who marked attendance |
| date | DateField | Attendance date |
| status | CharField | PRESENT / ABSENT / LATE |
| remarks | TextField | Optional notes |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Unique Constraint

```text
student + subject + date should be unique
```

## Relationship

```text
Student 1 ─── many Attendance Records
Subject 1 ─── many Attendance Records
Teacher 1 ─── many Attendance Records
```

---

# 9. Assignments App Schema

## Assignment Model

Stores assignment details created by teachers.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| title | CharField | Assignment title |
| description | TextField | Assignment description |
| subject | ForeignKey(Subject) | Related subject |
| teacher | ForeignKey(Teacher) | Assigned teacher |
| due_date | DateTimeField | Submission deadline |
| total_marks | IntegerField | Total marks |
| file | FileField | Optional assignment file |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Assignment Submission Model

Stores student assignment submissions.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| assignment | ForeignKey(Assignment) | Related assignment |
| student | ForeignKey(Student) | Student reference |
| submitted_file | FileField | Submitted file |
| answer_text | TextField | Optional text answer |
| submitted_at | DateTimeField | Submission timestamp |
| marks_obtained | IntegerField | Marks given by teacher |
| feedback | TextField | Teacher feedback |
| status | CharField | SUBMITTED / LATE / GRADED |

## Relationship

```text
Assignment 1 ─── many AssignmentSubmissions
Student 1 ─── many AssignmentSubmissions
```

---

# 10. Examinations App Schema

## Exam Model

Stores examination details.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| name | CharField | Exam name |
| course | ForeignKey(Course) | Related course |
| start_date | DateField | Exam start date |
| end_date | DateField | Exam end date |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Result Model

Stores student marks and grades.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| exam | ForeignKey(Exam) | Related exam |
| student | ForeignKey(Student) | Student reference |
| subject | ForeignKey(Subject) | Subject reference |
| marks_obtained | DecimalField | Obtained marks |
| total_marks | DecimalField | Total marks |
| grade | CharField | Grade |
| remarks | TextField | Optional remarks |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Unique Constraint

```text
exam + student + subject should be unique
```

---

# 11. Fees App Schema

## FeeStructure Model

Stores fee structure for courses.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| course | ForeignKey(Course) | Related course |
| title | CharField | Fee title |
| amount | DecimalField | Fee amount |
| due_date | DateField | Payment deadline |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## FeePayment Model

Stores student payment records.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| student | ForeignKey(Student) | Student reference |
| fee_structure | ForeignKey(FeeStructure) | Related fee structure |
| amount_paid | DecimalField | Paid amount |
| payment_status | CharField | PAID / PENDING / PARTIAL |
| payment_method | CharField | CASH / UPI / CARD / BANK |
| transaction_id | CharField | Optional transaction ID |
| payment_date | DateTimeField | Payment timestamp |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

---

# 12. Notifications App Schema

## Notification Model

Stores announcements and notices.

| Field | Type | Description |
|------|------|-------------|
| id | AutoField / UUID | Primary key |
| title | CharField | Notification title |
| message | TextField | Notification message |
| sender | ForeignKey(User) | Notification sender |
| target_role | CharField | ADMIN / TEACHER / STUDENT / ALL |
| is_active | BooleanField | Active status |
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

---

# 13. Reports App Schema

The reports app may not require separate database tables initially.

It can generate reports from:

- Students
- Teachers
- Attendance
- Results
- Fees

Suggested reports:

- Student list report
- Attendance percentage report
- Exam result report
- Pending fees report
- Teacher subject allocation report

---

# 14. Common App Schema

## TimeStampedModel

Reusable abstract model.

| Field | Type | Description |
|------|------|-------------|
| created_at | DateTimeField | Created timestamp |
| updated_at | DateTimeField | Updated timestamp |

## Status Choices

```python
ACTIVE = "ACTIVE"
INACTIVE = "INACTIVE"
```

---

# 15. Main Relationships Summary

```text
User 1 ─── 1 Student
User 1 ─── 1 Teacher

Course 1 ─── many Students
Course 1 ─── many Subjects

Teacher 1 ─── many Subjects
Teacher 1 ─── many Attendance Records
Teacher 1 ─── many Assignments

Student 1 ─── many Attendance Records
Student 1 ─── many Assignment Submissions
Student 1 ─── many Results
Student 1 ─── many Fee Payments

Subject 1 ─── many Attendance Records
Subject 1 ─── many Assignments
Subject 1 ─── many Results

Exam 1 ─── many Results
FeeStructure 1 ─── many FeePayments
```

---

# 16. Recommended Backend API Routes

## Authentication APIs

```text
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/token/refresh/
GET    /api/auth/me/
```

## Student APIs

```text
GET    /api/students/
POST   /api/students/
GET    /api/students/{id}/
PUT    /api/students/{id}/
PATCH  /api/students/{id}/
DELETE /api/students/{id}/
```

## Teacher APIs

```text
GET    /api/teachers/
POST   /api/teachers/
GET    /api/teachers/{id}/
PUT    /api/teachers/{id}/
PATCH  /api/teachers/{id}/
DELETE /api/teachers/{id}/
```

## Course APIs

```text
GET    /api/courses/
POST   /api/courses/
GET    /api/courses/{id}/
PUT    /api/courses/{id}/
PATCH  /api/courses/{id}/
DELETE /api/courses/{id}/
```

## Subject APIs

```text
GET    /api/subjects/
POST   /api/subjects/
GET    /api/subjects/{id}/
PUT    /api/subjects/{id}/
PATCH  /api/subjects/{id}/
DELETE /api/subjects/{id}/
```

## Attendance APIs

```text
GET    /api/attendance/
POST   /api/attendance/
GET    /api/attendance/{id}/
PUT    /api/attendance/{id}/
PATCH  /api/attendance/{id}/
DELETE /api/attendance/{id}/
GET    /api/attendance/student/{student_id}/
GET    /api/attendance/report/
```

## Assignment APIs

```text
GET    /api/assignments/
POST   /api/assignments/
GET    /api/assignments/{id}/
PUT    /api/assignments/{id}/
DELETE /api/assignments/{id}/

POST   /api/assignments/{id}/submit/
GET    /api/assignments/{id}/submissions/
PATCH  /api/submissions/{id}/grade/
```

## Exam and Result APIs

```text
GET    /api/exams/
POST   /api/exams/
GET    /api/exams/{id}/
PUT    /api/exams/{id}/
DELETE /api/exams/{id}/

GET    /api/results/
POST   /api/results/
GET    /api/results/student/{student_id}/
PATCH  /api/results/{id}/
```

## Fee APIs

```text
GET    /api/fees/structures/
POST   /api/fees/structures/
GET    /api/fees/payments/
POST   /api/fees/payments/
GET    /api/fees/student/{student_id}/
```

## Notification APIs

```text
GET    /api/notifications/
POST   /api/notifications/
GET    /api/notifications/{id}/
PATCH  /api/notifications/{id}/
DELETE /api/notifications/{id}/
```

---

# 17. Suggested Django Model Implementation Order

Build models in this order:

```text
1. accounts.User
2. courses.Course
3. teachers.Teacher
4. students.Student
5. subjects.Subject
6. attendance.Attendance
7. assignments.Assignment
8. assignments.AssignmentSubmission
9. examinations.Exam
10. examinations.Result
11. fees.FeeStructure
12. fees.FeePayment
13. notifications.Notification
```

---

# 18. MVP Backend Scope

For the first backend version, build only these modules:

```text
accounts
students
teachers
courses
subjects
attendance
```

## MVP Features

- Login
- Logout
- JWT authentication
- Role-based dashboard support
- Student CRUD
- Teacher CRUD
- Course CRUD
- Subject CRUD
- Teacher-subject assignment
- Attendance marking
- Student attendance view

---

# 19. Notes for Development

- Use `CustomUser` model from the beginning.
- Use `AUTH_USER_MODEL = "accounts.User"` in settings.
- Use UUID primary keys if you want production-level security.
- Use `select_related()` for ForeignKey optimization.
- Use `prefetch_related()` for ManyToMany optimization.
- Keep serializers separate from views.
- Use custom permissions for Admin, Teacher, and Student.
- Keep environment variables in `.env`.
- Never commit `.env` to GitHub.

---

# 20. Conclusion

This backend schema defines the main database models, relationships, and API routes for the IMS project.  
Start with the MVP modules first, then add assignments, examinations, fees, notifications, and reports.
