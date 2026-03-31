---
name: api-backend
description: "Build and modify backend API routes, database schemas, and server logic. Use this skill when the user asks to create an API endpoint, add a database table, write a migration, connect frontend to backend, set up server middleware, or debug API issues. Trigger keywords: 'add an endpoint', 'create a route', 'database', 'migration', 'API', 'backend', 'server', 'fetch data', 'persist', 'CRUD', 'REST'. Use this skill for any backend or data persistence work."
---

# API Backend Skill

Build and maintain the Node.js + Hono + SQLite backend.

## Architecture
```
server/
├── index.ts          — Hono app entry, middleware, listen
├── db/
│   ├── schema.ts     — Drizzle ORM table definitions
│   ├── index.ts      — DB connection (better-sqlite3)
│   └── seed.ts       — Seed script for dev data
├── routes/
│   ├── tasks.ts      — /api/tasks CRUD
│   ├── members.ts    — /api/members
│   └── settings.ts   — /api/settings
└── lib/
    └── types.ts      — Shared types (import from frontend types when possible)
```

## Conventions
- All routes prefixed with `/api/`
- RESTful: GET (list/detail), POST (create), PATCH (update), DELETE (delete)
- Return consistent JSON: `{ data: T }` on success, `{ error: string }` on failure
- HTTP status codes: 200 (ok), 201 (created), 400 (bad request), 404 (not found), 500 (server error)
- Validate request body before DB operations — return 400 with message on invalid input
- Use Drizzle ORM for all DB operations — no raw SQL unless absolutely necessary
- Keep route handlers thin: extract business logic to service functions if > 20 lines

## Database Rules
- Use Drizzle ORM with better-sqlite3 driver
- All tables have: `id` (text, primary key, nanoid), `createdAt` (integer, unix timestamp), `updatedAt` (integer)
- Foreign keys enforced via schema relations
- Schema changes = new migration: `npx drizzle-kit generate` then `npx drizzle-kit migrate`

## Frontend Integration
- Replace Zustand store's mock data with API calls
- Use a thin fetch wrapper in `src/lib/api.ts`
- Keep Zustand as client cache — fetch on mount, update store on API response
- Optimistic updates for drag-and-drop: update store immediately, sync to API in background, rollback on failure

## Dev Setup
- Backend runs on port 3001
- Vite dev server proxied: `/api` → `http://localhost:3001`
- Single `npm run dev` should start both (use concurrently)
```