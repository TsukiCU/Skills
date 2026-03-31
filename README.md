# TaskFlow

A single-page project management dashboard built with React and TypeScript. Features a full Kanban board with drag-and-drop, a detail drawer, real-time filters, and a persistent dark/light theme.

## Current Features

- **Kanban board** — 5 columns (Backlog → Done), cross-column drag-and-drop and within-column reorder via @dnd-kit, drop placeholder, drag overlay
- **Task cards** — priority badge, tag chips, assignee avatar, relative due date ("overdue" in red)
- **Detail drawer** — right-side Sheet; edit title, status, priority, assignee, due date, tags, description; delete with confirmation dialog
- **New task dialog** — form with title, description, status, priority, assignee (select from team), comma-separated tags
- **Real-time toolbar filters** — search by title/description, multi-select priority chips, assignee avatar toggles, clear-all
- **Team members** — 4 members (Alice Chen, Bob Martinez, Carol Kim, David Osei) referenced across all tasks
- **Collapsible sidebar** — animates 240px ↔ 64px with Framer Motion; active nav highlight
- **Dark / light / system theme** — persisted to localStorage, controls `documentElement.classList`
- **Analytics page** — 4 stat cards (total tasks, completed %, overdue count, avg completion time) with staggered Framer Motion entrance; 4 interactive Recharts charts: status distribution donut, weekly completion area chart, priority breakdown horizontal bar, team workload horizontal bar; all charts adapt to dark mode via CSS variables; real data computed from task store
- **Settings page** — 4-section vertical tab nav (Profile, Appearance, Notifications, Integrations); sticky "Unsaved changes" bar with 500ms simulated save and discard; email validation; accent color swatches; theme mode selector; font density picker; grouped notification toggles; integration connection cards for GitHub, Slack, Notion; all settings persisted via Zustand + localStorage
- **Responsive layout** — horizontal scroll for Kanban on small screens

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (New York, base-ui) |
| Animation | Framer Motion |
| Drag & drop | @dnd-kit/core, @dnd-kit/sortable |
| Charts | Recharts |
| State | Zustand |
| Routing | React Router v7 |
| Backend | Hono + @hono/node-server |
| Database | SQLite (better-sqlite3) + Drizzle ORM |
| Utilities | date-fns, Lucide React, nanoid |

## Backend Architecture

```
server/
├── index.ts          — Hono app entry, CORS middleware, port 3001
├── db/
│   ├── schema.ts     — Drizzle table definitions (tasks, members, settings)
│   ├── index.ts      — SQLite connection (taskflow.db)
│   ├── migrate.ts    — Inline CREATE TABLE IF NOT EXISTS migrations
│   └── seed.ts       — Seeds all mock data into the DB
└── routes/
    ├── tasks.ts      — GET/POST /api/tasks, GET/PATCH/DELETE /api/tasks/:id, PATCH /api/tasks/:id/move
    ├── members.ts    — GET /api/members
    └── settings.ts   — GET/PATCH /api/settings
```

Vite dev server proxies `/api` → `http://localhost:3001`. `npm run dev` starts both frontend and backend via `concurrently`.

## Quick Start

```bash
git clone https://github.com/TsukiCU/Skills.git
cd Skills
npm install
npm run server:seed   # seed the SQLite database
npm run dev           # starts both Vite (5173) and Hono server (3001)
# open http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend (5173) + backend (3001) concurrently |
| `npm run server` | Start backend only |
| `npm run server:seed` | Seed SQLite database with mock data |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Open Playwright UI mode |

## E2E Testing

Playwright tests cover the core Kanban CRUD flows. Both servers must be running (or the `webServer` config will start them automatically).

```bash
# Run all E2E tests
npm run test:e2e

# Watch mode with browser visible
npm run test:e2e:ui

# Run a single spec
npx playwright test e2e/kanban.spec.ts
```

**Test coverage in `e2e/kanban.spec.ts`:**
- Create task: opens dialog, fills title + priority, submits, verifies card appears in column
- Validation: empty title shows error, dialog stays open
- Read: seeded task counts per column, search filter, priority filter toggle
- Update priority: opens drawer, changes priority chip, card badge updates
- Update status: moves task to different column via status chip
- Delete: confirms deletion, task removed, count decremented
- Cancel delete: dialog dismissed, task count unchanged

**Test isolation:** each test calls `POST /api/seed-reset` to restore the DB to known seed state before running.

## Project Structure

```
src/
├── components/
│   ├── layout/     AppShell, Sidebar, Header, DetailDrawer
│   ├── common/     TaskCard
│   └── ui/         shadcn/ui primitives
├── pages/
│   ├── KanbanPage/       Board, columns, toolbar, new task dialog, sortable cards
│   ├── AnalyticsPage/    Placeholder
│   └── SettingsPage/     Placeholder
├── stores/         taskStore (tasks + filters), uiStore (drawer), themeStore
├── data/           mockTasks (18 tasks), members (4 team members)
├── lib/            types.ts, constants.ts, utils.ts
└── styles/         Global CSS overrides
```
