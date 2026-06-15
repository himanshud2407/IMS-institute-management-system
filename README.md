# IMS - Institute Management System

Full-stack institute management platform with a Django REST API and a Next.js dashboard.

## Repository Layout

```text
backend/        Django project, REST API apps, migrations, and backend tests
frontend/       Next.js app router UI, services, schemas, shared UI components
Documents/      Product and requirements documentation
docs/           Engineering handoff, structure, and deployment documentation
task.md         Implementation progress tracker
```

## Tech Stack

- Backend: Django, Django REST Framework, Simple JWT, django-filter
- Frontend: Next.js, React, TypeScript, Axios, Zustand, Zod, React Hook Form
- Default database: SQLite for local development
- Scalable database target: PostgreSQL via environment-driven Django settings

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at `http://127.0.0.1:8000/api/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard runs at `http://localhost:3000/`.

## Environment

Use `backend/.env.example` as the reference for shell variables, CI secrets, or deployment-platform environment variables.

Important backend variables:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `DJANGO_CORS_ALLOWED_ORIGINS`
- `DJANGO_DB_ENGINE`
- `DJANGO_DB_NAME`
- `DJANGO_DB_USER`
- `DJANGO_DB_PASSWORD`
- `DJANGO_DB_HOST`
- `DJANGO_DB_PORT`

## Verification

```bash
cd backend
python manage.py check
python manage.py test
```

```bash
cd frontend
npm run lint
npm run build
```

## Documentation

- [Project structure](docs/PROJECT_STRUCTURE.md)
- [Deployment checklist](docs/DEPLOYMENT.md)
- [Biometric attendance](docs/BIOMETRIC_ATTENDANCE.md)
- Product docs are in `Documents/`.
