# IMS Frontend

Next.js dashboard for the Institute Management System.

## Main Folders

```text
app/              App router pages and route groups
components/ui/    Shared UI components
services/         Typed API access modules
schemas/          Zod validation schemas
store/            Zustand auth/session state
types/            Shared TypeScript types
utils/            Constants and route metadata
```

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Development

Run the Django API first, then start the frontend:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Architecture Notes

- `services/api.ts` owns the Axios client, JWT attachment, and refresh-token queue.
- Route protection lives in `middleware.ts`.
- Forms should use React Hook Form with Zod schemas from `schemas/`.
- Shared UI belongs in `components/ui/`; page-specific state should stay near the page.
