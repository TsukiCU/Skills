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
| State | Zustand (with persist middleware) |
| Routing | React Router v7 |
| Utilities | date-fns, Lucide React |

## Quick Start

```bash
git clone https://github.com/TsukiCU/Skills.git
cd Skills
npm install
npm run dev
# open http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |

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
