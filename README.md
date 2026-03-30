# TaskFlow

A single-page project management dashboard with Kanban board, analytics, and settings — built to explore Claude Code's full workflow.

## Tech Stack

- React 19 + Vite + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui (New York, base-ui)
- Framer Motion · @dnd-kit · Recharts · Zustand · React Router v7
- date-fns · Lucide React

## Quick Start

```bash
git clone <repo-url>
cd taskflow
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
| `npm run type-check` | TypeScript check (tsc --noEmit) |

## Project Structure

```
src/
├── components/
│   ├── layout/     AppShell, Sidebar, Header
│   ├── common/     Shared app-level components
│   └── ui/         shadcn/ui primitives
├── pages/
│   ├── KanbanPage/
│   ├── AnalyticsPage/
│   └── SettingsPage/
├── stores/         Zustand stores (tasks, UI, theme)
├── hooks/          Custom React hooks
├── data/           Mock/seed data
├── lib/            Types, constants, utilities
└── styles/         Global CSS overrides
```
