# TaskFlow

A single-page project management dashboard built with React and TypeScript. Currently features a fully functional app shell with sidebar navigation, theme switching, and placeholder pages for Kanban, Analytics, and Settings — serving as the foundation for a full-featured PM tool.

## Current Features

- **Collapsible sidebar** — animates between 240px (full) and 64px (icon-only) using Framer Motion; shows logo, nav links with active highlight, and user avatar
- **Three pages** — Kanban, Analytics, Settings (placeholder content, routing wired up)
- **Dark / light theme toggle** — persisted to localStorage via Zustand; controls `document.documentElement.classList` for shadcn dark mode
- **Route-based navigation** — `/` redirects to `/kanban`; active nav item highlighted; page title in header updates per route
- **Header** — page title, ⌘K command palette trigger, notification bell, theme dropdown, user avatar menu
- **Responsive layout** — full-bleed app shell, sidebar + main content flex layout

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + Vite + TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (New York style, base-ui) |
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
│   ├── layout/     AppShell, Sidebar, Header
│   ├── common/     Shared app-level components (TBD)
│   └── ui/         shadcn/ui primitives (Button, Avatar, DropdownMenu…)
├── pages/
│   ├── KanbanPage/       Placeholder — drag-and-drop board (upcoming)
│   ├── AnalyticsPage/    Placeholder — Recharts dashboard (upcoming)
│   └── SettingsPage/     Placeholder — user preferences (upcoming)
├── stores/         Zustand stores: taskStore, uiStore, themeStore
├── hooks/          Custom React hooks (TBD)
├── data/           Mock seed data (5 sample tasks)
├── lib/            types.ts, constants.ts, utils.ts
└── styles/         Global CSS overrides
```
