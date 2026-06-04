# IMS App Flow

**Project:** Institute Management System (IMS)  
**Version:** 1.0  
**Prepared By:** Himanshu Desale  
**Tech Stack:** Django, Django REST Framework, PostgreSQL, Next.js

---

# 1. Overall Application Flow

```text
User Opens IMS
        ↓
Login / Signup
        ↓
JWT Token Generated
        ↓
Check User Role
        ↓
Redirect Based on Role
        ↓
Admin / Teacher / Student Dashboard
```

---

# 2. Authentication Flow

```text
Start
 ↓
User enters email and password
 ↓
Frontend sends login request
POST /api/auth/login/
 ↓
Backend validates credentials
 ↓
If credentials are valid:
    Generate access token and refresh token
 ↓
Frontend stores token
 ↓
Fetch logged-in user profile
GET /api/auth/me/
 ↓
Redirect user based on role
```

## Role-Based Redirect

```text
Admin   → /admin/dashboard
Teacher → /teacher/dashboard
Student → /student/dashboard
```

---

# 3. Admin Flow

```text
Admin Login
   ↓
Admin Dashboard
   ↓
Manage Institute Data
```

## Admin Dashboard Modules

```text
Admin Dashboard
 ├── Student Management
 │    ├── Add Student
 │    ├── View Students
 │    ├── Update Student
 │    └── Delete Student
 │
 ├── Teacher Management
 │    ├── Add Teacher
 │    ├── View Teachers
 │    ├── Update Teacher
 │    └── Delete Teacher
 │
 ├── Course Management
 │    ├── Add Course
 │    ├── View Courses
 │    ├── Update Course
 │    └── Delete Course
 │
 ├── Subject Management
 │    ├── Add Subject
 │    ├── Assign Teacher
 │    └── Assign Course
 │
 ├── Attendance Reports
 ├── Exam Management
 ├── Fee Management
 ├── Notifications
 └── Reports
```

---

# 4. Teacher Flow

```text
Teacher Login
   ↓
Teacher Dashboard
   ↓
View Assigned Subjects / Classes
   ↓
Perform Academic Actions
```

## Teacher Dashboard Modules

```text
Teacher Dashboard
 ├── My Subjects
 ├── My Students
 ├── Attendance
 │    ├── Select Class
 │    ├── Select Subject
 │    ├── Mark Present / Absent
 │    └── Submit Attendance
 │
 ├── Assignments
 │    ├── Create Assignment
 │    ├── View Submissions
 │    └── Grade Assignment
 │
 ├── Exams
 │    ├── Enter Marks
 │    └── View Results
 │
 └── Profile
```

---

# 5. Student Flow

```text
Student Login
   ↓
Student Dashboard
   ↓
View Personal Academic Data
```

## Student Dashboard Modules

```text
Student Dashboard
 ├── My Profile
 ├── My Course
 ├── My Subjects
 ├── Attendance
 │    └── View Attendance Percentage
 │
 ├── Timetable
 ├── Assignments
 │    ├── View Assignment
 │    └── Submit Assignment
 │
 ├── Exams / Results
 ├── Fees
 │    ├── View Paid Fees
 │    └── View Pending Fees
 │
 └── Notifications
```

---

# 6. Student Management Flow

```text
Admin Dashboard
        ↓
Student Management
        ↓
Add Student
        ↓
Create User Account with role = Student
        ↓
Create Student Profile
        ↓
Assign Course / Class
        ↓
Student can login
```

---

# 7. Teacher Management Flow

```text
Admin Dashboard
        ↓
Teacher Management
        ↓
Add Teacher
        ↓
Create User Account with role = Teacher
        ↓
Create Teacher Profile
        ↓
Assign Subject / Class
        ↓
Teacher can login
```

---

# 8. Attendance Flow

```text
Teacher Dashboard
        ↓
Attendance
        ↓
Select Course / Class
        ↓
Select Subject
        ↓
Select Date
        ↓
Student List Appears
        ↓
Mark Present / Absent
        ↓
Submit Attendance
        ↓
Students can view attendance
        ↓
Admin can generate report
```

---

# 9. Assignment Flow

```text
Teacher Dashboard
        ↓
Create Assignment
        ↓
Select Course / Subject
        ↓
Enter Title, Description, Deadline
        ↓
Publish Assignment
        ↓
Student Receives Assignment
        ↓
Student Submits File / Text
        ↓
Teacher Reviews Submission
        ↓
Teacher Adds Marks / Feedback
```

---

# 10. Exam and Result Flow

```text
Admin Creates Exam
        ↓
Teacher Selects Exam + Subject
        ↓
Teacher Enters Marks
        ↓
System Calculates Grade
        ↓
Admin Publishes Result
        ↓
Student Views Result
```

---

# 11. Fee Management Flow

```text
Admin Creates Fee Structure
        ↓
Assign Fee to Student / Course
        ↓
Student Views Fee Status
        ↓
Admin Records Payment
        ↓
System Updates Status
        ↓
Receipt Generated
```

---

# 12. Notification Flow

```text
Admin / Teacher Creates Notice
        ↓
Select Target Audience
        ↓
Publish Notice
        ↓
Users Receive Notification
```

---

# 13. Logout Flow

```text
User Clicks Logout
        ↓
Frontend Clears Token
        ↓
Redirect to Login Page
```

---

# 14. Recommended MVP App Flow

Start with this flow first:

```text
Login / Signup / Logout
        ↓
Role-Based Dashboard
        ↓
Admin Adds Teacher
        ↓
Admin Adds Student
        ↓
Admin Adds Course
        ↓
Admin Adds Subject
        ↓
Admin Assigns Teacher to Subject
        ↓
Teacher Marks Attendance
        ↓
Student Views Attendance
```

---

# 15. Recommended Development Order

## Phase 1: Authentication

- Signup
- Login
- Logout
- JWT token handling
- Role-based redirect
- Protected frontend routes

## Phase 2: Core Admin Modules

- Student CRUD
- Teacher CRUD
- Course CRUD
- Subject CRUD

## Phase 3: Academic Operations

- Teacher-subject assignment
- Attendance marking
- Student attendance view

## Phase 4: Extended Features

- Assignments
- Exams
- Results
- Fees
- Notifications
- Reports

---

# 16. Conclusion

This app flow defines how users move through the Institute Management System.  
The first MVP should focus on authentication, role-based dashboards, student management, teacher management, course management, subject management, and attendance.
