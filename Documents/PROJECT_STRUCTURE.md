# Project Structure

The repository is split by runtime boundary: Django backend, Next.js frontend, product documents, and engineering documentation.

## Backend

```text
backend/
  backend/          Django project settings, URL routing, ASGI/WSGI entry points
  accounts/         Custom user model, JWT auth, role permissions
  common/           Shared models, pagination, renderers
  courses/          Course catalog API
  subjects/         Subject catalog API
  teachers/         Teacher profiles and admin APIs
  students/         Student profiles and admin APIs
  attendance/       Attendance sessions, records, and student summaries
  assignments/      Assignment publishing, submissions, grading
  examinations/     Exams, results, publishing
  fees/             Fee invoices, payments, summaries
  notifications/    Notifications and read tracking
  reports/          Dashboard stats and admin reports
```

Each Django app keeps the same structure:

- `models.py` for database shape and domain behavior
- `serializers.py` for API validation and output
- `views.py` for role-aware API behavior
- `urls.py` for app-local routes
- `tests.py` for regression coverage
- `admin.py` for Django admin registration

## Frontend

```text
frontend/
  app/              Next.js app router pages grouped by auth/dashboard
  components/ui/    Shared reusable UI primitives
  services/         API clients by module
  schemas/          Zod validation schemas
  store/            Client state stores
  types/            Shared TypeScript domain types
  utils/            Constants and local helpers
```

The frontend follows a module-service pattern: pages call the matching service file, services use the shared Axios client in `services/api.ts`, and form validation is kept in `schemas/`.

## Documentation

```text
Documents/         Product requirements, app flow, schema, and UI/UX notes
docs/              Engineering handoff and operations guides
task.md           Phase tracker for implementation progress
```

Keep product-facing decisions in `Documents/` and developer handoff material in `docs/`.
