---
name: ui-implement
description: "Implement new pages, views, or complex component groups from requirements or verbal descriptions. Use this skill whenever the user asks to add a new page, build a new feature view, create a layout with multiple interacting parts (e.g., list + filter + drawer), scaffold a dashboard or settings page, or implement any UI that doesn't exist yet. Trigger keywords: 'add a page', 'build a view', 'create a form', 'new dashboard', 'implement', 'scaffold', 'make a settings page', 'add a kanban', 'add a sidebar'. Always use this skill for any net-new UI work — even simple pages."
---

# UI Implement Skill

Build new pages and complex component groups from scratch, following the project's design system and architecture.

## Workflow

### 1. Clarify Requirements (before writing code)
- What data does this page display or manipulate?
- What interactive elements exist (filters, drawers, modals, drag-drop)?
- What states must be handled (empty, loading, error, populated)?
- Does it need to connect to a store, or is local state enough?
- Mobile layout: stack, hide, or collapse?

If the user's description is vague, ask ONE clarifying question — then proceed with sensible defaults.

### 2. Plan File Structure
Before coding, output a brief file plan:
```
Creating:
  src/pages/KanbanPage/KanbanPage.tsx    — main page component
  src/pages/KanbanPage/KanbanColumn.tsx  — column component
  src/pages/KanbanPage/index.ts          — barrel export
  src/components/common/TaskCard.tsx     — shared task card
Modifying:
  src/App.tsx                            — add route
  src/components/layout/Sidebar.tsx      — add nav item
```
Get user confirmation before proceeding. Then implement all files.

### 3. Implementation Checklist
For every page/component you create, ensure:

**Structure**
- [ ] Page component in `src/pages/PageName/PageName.tsx`
- [ ] Barrel export `index.ts` in page folder
- [ ] Route added in `App.tsx`
- [ ] Navigation entry added in Sidebar
- [ ] Page title set

**Design**
- [ ] Uses design tokens from globals.css (colors, radius, shadows)
- [ ] Typography hierarchy clear (h1 > h2 > body > caption)
- [ ] Spacing consistent with 4px grid
- [ ] Dark mode works — check all custom colors
- [ ] Responsive: test mental model at 375px, 768px, 1280px
- [ ] Animations on mount, hover, state change (Framer Motion)
- [ ] Empty state designed (not just "No data")

**Code Quality**
- [ ] All props typed, no `any`
- [ ] Mock data in `src/data/`, not inline
- [ ] Interactive elements have aria labels
- [ ] `cn()` used for conditional classes
- [ ] Named exports only

### 4. Component Composition Pattern
Follow this layering:
```
Page (layout + data orchestration)
  └── Section (semantic grouping)
        └── Card / Panel (visual container)
              └── UI Primitives (shadcn Button, Input, etc.)
```

### 5. Styling Approach
- Start with Tailwind utilities
- Use shadcn/ui components for all standard controls
- Custom components: build on top of shadcn primitives, don't reinvent
- Motion: use Framer Motion `motion.div` with `initial/animate/exit`
- Prefer `grid` for page-level layout, `flex` for component internals

### 6. After Implementation
- Run `npm run type-check` to verify no TS errors
- Run `npm run lint` to verify lint passes
- Briefly describe what was built and what the user should check visually
