# Software Requirements Specification (SRS)

# Institute Management System (IMS)

**Version:** 1.0
**Prepared By:** Himanshu Desale
**Technology Stack:** Django, Django REST Framework, PostgreSQL, Next.js

---

# 1. Introduction

## 1.1 Purpose

The purpose of the Institute Management System (IMS) is to digitize and automate the management of educational institutions. The system provides a centralized platform for administrators, teachers, and students to manage academic and administrative activities efficiently.

---

## 1.2 Scope

The Institute Management System (IMS) will provide:

* User Authentication and Authorization
* Role-Based Access Control (RBAC)
* Student Management
* Teacher Management
* Course Management
* Subject Management
* Attendance Management
* Timetable Management
* Assignment Management
* Examination and Result Management
* Fee Management
* Notification System
* Reports and Analytics

---

## 1.3 Definitions and Acronyms

| Acronym | Description                       |
| ------- | --------------------------------- |
| IMS     | Institute Management System       |
| RBAC    | Role-Based Access Control         |
| JWT     | JSON Web Token                    |
| API     | Application Programming Interface |
| DRF     | Django REST Framework             |
| CRUD    | Create, Read, Update, Delete      |

---

# 2. Overall Description

## 2.1 Product Perspective

IMS is a web-based client-server application consisting of:

### Frontend

* Next.js
* Tailwind CSS

### Backend

* Django
* Django REST Framework

### Database

* PostgreSQL

### Authentication

* JWT Authentication

---

## 2.2 User Classes

### Administrator

Responsibilities:

* Manage users
* Manage courses and subjects
* Manage fees
* Generate reports
* Configure system settings

Permissions:

* Full access to the system

---

### Teacher

Responsibilities:

* Mark attendance
* Upload assignments
* Enter marks
* View student information

Permissions:

* Access limited to assigned subjects and classes

---

### Student

Responsibilities:

* View attendance
* Submit assignments
* View timetable
* View examination results
* View fee details

Permissions:

* Read-only access to personal academic information

---

# 3. Functional Requirements

## FR-1 User Authentication

### Description

The system shall provide secure authentication for all users.

### Features

* User registration
* Login
* Logout
* Password reset
* JWT token generation
* Email verification

### Actors

* Admin
* Teacher
* Student

---

## FR-2 Role-Based Access Control (RBAC)

The system shall provide:

* Admin Dashboard
* Teacher Dashboard
* Student Dashboard

Unauthorized users shall not access restricted resources.

---

## FR-3 Student Management Module

Admin shall be able to:

* Add students
* Update student information
* Delete students
* Search students
* View student profiles

---

## FR-4 Teacher Management Module

Admin shall be able to:

* Add teachers
* Update teachers
* Delete teachers
* Assign subjects

---

## FR-5 Course Management Module

Admin shall be able to:

* Create courses
* Edit courses
* Delete courses

---

## FR-6 Subject Management Module

Admin shall be able to:

* Create subjects
* Assign subjects to courses
* Assign teachers to subjects

---

## FR-7 Attendance Management Module

Teacher shall:

* Mark attendance
* Update attendance

Student shall:

* View attendance records

Admin shall:

* Generate attendance reports

---

## FR-8 Timetable Management Module

Admin shall:

* Create timetable
* Update timetable

Teacher and Student shall:

* View timetable

---

## FR-9 Assignment Management Module

Teacher shall:

* Create assignments
* Set deadlines

Student shall:

* Submit assignments

Teacher shall:

* Evaluate assignments

---

## FR-10 Examination Management Module

Admin shall:

* Create examinations

Teacher shall:

* Enter marks

Student shall:

* View examination results

---

## FR-11 Fee Management Module

Admin shall:

* Create fee structure
* Record payments
* Track pending fees

Student shall:

* View payment history

---

## FR-12 Notification Module

Admin and teachers shall:

* Publish announcements
* Send notices

Students shall:

* Receive notifications

---

## FR-13 Reports Module

The system shall generate:

* Student reports
* Attendance reports
* Fee reports
* Examination reports
* Performance analytics

---

# 4. Non-Functional Requirements

## Performance

* Response time shall be less than 2 seconds.
* Support at least 1000 concurrent users.

---

## Security

* Password hashing
* JWT authentication
* Role-based authorization
* Input validation
* HTTPS communication

---

## Reliability

* System availability of 99.9%

---

## Scalability

* Modular architecture
* Easy addition of new modules

---

## Maintainability

* Clean code structure
* Reusable APIs
* Modular Django apps

---

## Usability

* Responsive design
* User-friendly interface
* Mobile compatible

---

# 5. External Interface Requirements

## User Interface

### Admin Dashboard

Features:

* User Management
* Student Management
* Teacher Management
* Course Management
* Fee Management
* Reports

---

### Teacher Dashboard

Features:

* Attendance Management
* Assignments
* Marks Entry
* Student List

---

### Student Dashboard

Features:

* Attendance
* Timetable
* Assignments
* Results
* Fee Details

---

## Software Requirements

### Backend

* Python 3.12+
* Django 5+
* Django REST Framework
* SimpleJWT

### Frontend

* Next.js
* Tailwind CSS

### Database

* PostgreSQL

---

# 6. Database Entities

## User

* id
* full_name
* email
* password
* role

---

## Student

* student_id
* roll_number
* date_of_birth
* phone_number
* address
* course

---

## Teacher

* teacher_id
* department
* qualification
* specialization

---

## Course

* course_id
* course_name
* duration

---

## Subject

* subject_id
* subject_name
* course
* teacher

---

## Attendance

* attendance_id
* student
* subject
* date
* status

---

## Assignment

* assignment_id
* title
* description
* deadline

---

## Examination

* exam_id
* exam_name
* exam_date

---

## Result

* result_id
* student
* subject
* marks

---

## Fee

* fee_id
* amount
* payment_status

---

# 7. System Architecture

```text
Users
│
├── Admin
├── Teacher
└── Student
        │
        ▼
Next.js Frontend
        │
        ▼
Django REST API
        │
 ┌────────────────────────┐
 │ Authentication Module  │
 │ Student Module         │
 │ Teacher Module         │
 │ Course Module          │
 │ Attendance Module      │
 │ Examination Module     │
 │ Fee Module             │
 │ Notification Module    │
 └────────────────────────┘
        │
        ▼
PostgreSQL Database
```

---

# 8. Hardware Requirements

## Server

* CPU: Dual Core
* RAM: 4 GB
* Storage: 20 GB SSD

---

# 9. Future Enhancements

* Google OAuth Login
* Microsoft OAuth Login
* GitHub OAuth Login
* Email Verification
* SMS Notifications
* Payment Gateway Integration
* PDF Report Generation
* Excel Export
* Mobile Application
* Library Management Module
* Hostel Management Module
* AI Chatbot Assistant

---

# 10. Conclusion

The Institute Management System (IMS) aims to provide a secure, scalable, and modular platform for managing educational institutions. The system automates academic and administrative activities and supports multiple user roles with role-based access control.

The SRS document follows IEEE 830 standards and can serve as the foundation for design, development, testing, and deployment of the IMS project.
