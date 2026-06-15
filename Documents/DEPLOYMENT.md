# Deployment Checklist

Use this checklist before moving IMS out of local development.

## Backend

- Set `DJANGO_DEBUG=False`.
- Set a strong `DJANGO_SECRET_KEY` outside source control.
- Set `DJANGO_ALLOWED_HOSTS` to the deployed API host names.
- Set `DJANGO_CORS_ALLOWED_ORIGINS` to the deployed frontend origins.
- Use PostgreSQL for shared environments:

```text
DJANGO_DB_ENGINE=django.db.backends.postgresql
DJANGO_DB_NAME=ims
DJANGO_DB_USER=ims_user
DJANGO_DB_PASSWORD=...
DJANGO_DB_HOST=...
DJANGO_DB_PORT=5432
DJANGO_DB_CONN_MAX_AGE=60
```

- Run migrations during release:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py check --deploy
```

## Frontend

- Set the API base URL used by `frontend/utils/constants.ts`.
- Run `npm run build` before deployment.
- Serve with `npm run start` or the hosting platform's Next.js runtime.

## Performance Notes

- DRF pagination is enabled globally with a default page size of 10 and max page size of 100.
- High-cardinality list endpoints should keep using `select_related` and `prefetch_related`.
- Fee and report totals should be calculated with database aggregates, not invoice-by-invoice loops.
- Prefer PostgreSQL in staging/production; SQLite is only intended for local development.

## Documentation Handoff

- Keep API behavior documented in each app's serializers/views.
- Update `docs/PROJECT_STRUCTURE.md` when adding or moving major folders.
- Keep product docs in `Documents/` and engineering docs in `docs/`.
