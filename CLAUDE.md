# TaskFlow — Project Management Dashboard

## Overview
A single-page project management dashboard built for learning Claude Code's full workflow (skills + MCP). Features: Kanban board, analytics dashboard, complex settings page, global command palette, detail drawer, dark/light theme.

## Tech Stack
- React 19 + Vite + TypeScript (strict mode)
- Tailwind CSS v4 + shadcn/ui
- Framer Motion (animations)
- @dnd-kit (drag-and-drop)
- Recharts (charts)
- Zustand (state management)
- React Router v7 (routing)
- date-fns (date formatting)
- Lucide React (icons)

## Architecture
```
src/
├── components/       # Shared UI components
│   ├── ui/           # shadcn/ui primitives (Button, Dialog, etc.)
│   ├── layout/       # Shell, Sidebar, Header, Drawer
│   └── common/       # App-level reusable (TaskCard, StatusBadge, etc.)
├── pages/            # Route-level page components
│   ├── KanbanPage/
│   ├── AnalyticsPage/
│   └── SettingsPage/
├── stores/           # Zustand stores
├── hooks/            # Custom React hooks
├── lib/              # Utilities, constants, types
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
├── styles/           # Global CSS, Tailwind config
├── data/             # Mock data / seed data
├── App.tsx
└── main.tsx
```

## Coding Conventions
- Functional components only, named exports (no default exports)
- Props type defined as `type XxxProps = { ... }` colocated above component
- One component per file, filename = component name in PascalCase
- Use `cn()` helper (from lib/utils.ts) for conditional classNames
- Tailwind utility-first; extract to component only when reused 3+ times
- All interactive elements must have accessible labels
- Colors via CSS variables (HSL) defined in globals.css for theme support
- Use path alias `@/` mapped to `src/`

## State Management
- Zustand for global state (tasks, user preferences, theme)
- React state for component-local UI state (open/close, form inputs)
- No prop drilling deeper than 2 levels — lift to store

## Commands
```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check (tsc --noEmit)
npm run preview      # Preview production build
```

## File Modification Rules
- IMPORTANT: Only modify files within this project directory
- Never touch files outside the project root without explicit user approval
- When adding a new shadcn/ui component, use `npx shadcn@latest add <component>`

## GitHub Operations
- Use `gh` CLI for all GitHub operations (repo create, PR, issues, etc.)
- No GitHub MCP needed — `gh` is authenticated via OAuth, run `gh auth status` to verify
- Example: `gh repo create taskflow --public --source=. --remote=origin --push`
- Example: `gh pr create --title "feat: add kanban page" --body "..." --base main`

## Git Workflow
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `chore:`
- Branch naming: `feat/xxx`, `fix/xxx`, `refactor/xxx`
- Commit often, each commit = one logical change
- Never commit `.env`, `node_modules`, `dist`

## Design System
- Border radius: `rounded-lg` (8px) for cards, `rounded-md` (6px) for buttons/inputs
- Spacing scale: 4px base (Tailwind default)
- Shadow: `shadow-sm` for cards, `shadow-lg` for modals/dropdowns
- Transition: `transition-all duration-200 ease-out` as default
- Font: Use a distinctive display font (not Inter/Arial) — see skills for guidance

## Skills
Read `.claude/skills/` for specialized workflows:
- `ui-implement` — building new pages/components from requirements
- `ui-polish` — diagnosing and fixing UI issues in existing pages
- `component-gen` — generating atomic components following design system
- `git-workflow` — standardized git operations

## Important Rules
- NEVER use `any` type — always define proper types
- NEVER leave `console.log` in committed code (use only for debugging, remove before commit)
- All mock data goes in `src/data/` — no inline hardcoded data in components
- Theme must work in both light and dark mode from the start
- Every page must be responsive (mobile-first: sm → md → lg breakpoints)
