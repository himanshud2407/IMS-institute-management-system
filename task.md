# IMS Implementation — Task Tracker

## Phase 1: Authentication & Project Foundation

### Backend Foundation
- [x] Install backend dependencies (simplejwt, etc.)
- [x] Create `common` app (TimeStampedModel, renderers, pagination)
- [x] Rewrite `accounts/models.py` (AbstractBaseUser + UUID + email login)
- [x] Update `settings.py` (AUTH_USER_MODEL, REST_FRAMEWORK, JWT, CORS)
- [x] Create `accounts/permissions.py` (IsAdmin, IsTeacher, IsStudent)
- [x] Create `accounts/serializers.py`
- [x] Rewrite `accounts/views.py`
- [x] Create `accounts/urls.py`
- [x] Update `backend/urls.py`
- [x] Update `accounts/admin.py`
- [x] Delete old db.sqlite3 and run fresh migrations
- [x] Create `accounts/tests.py`
- [x] Verify backend starts and tests pass

### Frontend Foundation
- [x] Install frontend packages (axios, zustand, react-hook-form, zod, etc.)
- [x] Create `types/index.ts`
- [x] Create `services/api.ts` (Axios instance with interceptors)
- [x] Create `services/auth.ts`
- [x] Create `store/auth-store.ts` (Zustand)
- [x] Create `schemas/auth.ts` (Zod)
- [x] Create `middleware.ts` (route protection)
- [x] Create `utils/constants.ts`

### Frontend UI Components
- [x] Update `globals.css` (design system tokens)
- [x] Create `components/ui/Button.tsx`
- [x] Create `components/ui/Input.tsx`
- [x] Create `components/ui/Card.tsx`
- [x] Create `components/ui/Badge.tsx`
- [x] Create `components/ui/Modal.tsx`
- [x] Create `components/ui/LoadingSpinner.tsx`
- [x] Create `components/ui/Sidebar.tsx`
- [x] Create `components/ui/Header.tsx`

### Frontend Auth Pages
- [x] Create `app/(auth)/layout.tsx`
- [x] Create `app/(auth)/login/page.tsx`
- [x] Create `app/(auth)/signup/page.tsx`
- [x] Replace `app/page.tsx` with redirect

### Frontend Dashboard
- [x] Create `app/(dashboard)/layout.tsx` (sidebar + header)
- [x] Create `app/(dashboard)/admin/dashboard/page.tsx`
- [x] Create `app/(dashboard)/teacher/dashboard/page.tsx`
- [x] Create `app/(dashboard)/student/dashboard/page.tsx`
- [x] Update `app/layout.tsx` (metadata, providers)
- [x] Verify frontend builds

## Phase 2: Core Modules (Students, Teachers, Courses, Subjects)
- [x] Backend for each module (Models, Serializers, Views, URLs)
- [x] Frontend List Pages for all 4 modules
- [x] Frontend Add/Edit Modals (React Hook Form + Zod)

## Phase 3: Attendance
- [x] Backend Attendance Models & Logic (Sessions, Records)
- [x] Backend API Endpoints (Creation, Batching, Summary)
- [x] Frontend Role-based UI (Admin, Teacher, Student Views)

## Phase 4: Assignments
- [ ] Backend + Frontend

## Phase 5: Examinations & Results
- [ ] Backend + Frontend

## Phase 6: Fees
- [ ] Backend + Frontend

## Phase 7: Notifications
- [ ] Backend + Frontend

## Phase 8: Reports & Dashboard Stats
- [ ] Backend + Frontend
