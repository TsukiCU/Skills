import "./migrate"
import { db } from "./index"
import { tasks, members, settings } from "./schema"

const MEMBERS = [
  { id: "member-1", name: "Alice Chen",   avatar: "AC", color: "bg-teal-500" },
  { id: "member-2", name: "Bob Martinez", avatar: "BM", color: "bg-violet-500" },
  { id: "member-3", name: "Carol Kim",    avatar: "CK", color: "bg-rose-500" },
  { id: "member-4", name: "David Osei",   avatar: "DO", color: "bg-amber-500" },
]

const TASKS = [
  // Backlog
  { id: "task-1",  title: "Implement OAuth2 login flow", description: "Add Google and GitHub OAuth2 providers using the existing auth middleware. Update the login page to show social login buttons and handle callback routes securely.", status: "backlog", priority: "high",   assigneeId: "member-1", dueDate: "2026-04-18", createdAt: "2026-03-20", tags: ["auth", "security"], sortOrder: 0 },
  { id: "task-2",  title: "Design onboarding wizard mockups", description: "Create high-fidelity mockups for the 3-step onboarding flow in Figma. Cover workspace setup, team invite, and first-project creation screens.", status: "backlog", priority: "medium", assigneeId: "member-3", dueDate: "2026-04-22", createdAt: "2026-03-22", tags: ["design", "ux"], sortOrder: 1 },
  { id: "task-3",  title: "Evaluate vector DB options for search", description: "Research Pinecone, Weaviate, and pgvector for full-text + semantic search. Write a comparison doc with latency benchmarks and cost estimates at 10k, 100k, and 1M records.", status: "backlog", priority: "low",    assigneeId: "member-2", dueDate: "2026-04-25", createdAt: "2026-03-25", tags: ["research", "infra"], sortOrder: 2 },
  { id: "task-4",  title: "Set up E2E test suite with Playwright", description: "Configure Playwright in CI and write smoke tests for login, task creation, and drag-and-drop. Target < 2 min run time on the critical path.", status: "backlog", priority: "medium", assigneeId: "member-4", dueDate: "2026-04-20", createdAt: "2026-03-26", tags: ["testing", "ci"], sortOrder: 3 },
  // Todo
  { id: "task-5",  title: "Analytics dashboard charts", description: "Build the analytics page with Recharts: velocity chart (tasks/week), priority breakdown pie, and assignee workload bar chart. Use mock data initially.", status: "todo", priority: "medium", assigneeId: "member-1", dueDate: "2026-04-10", createdAt: "2026-03-12", tags: ["analytics", "charts"], sortOrder: 0 },
  { id: "task-6",  title: "Settings page — user preferences", description: "Build the settings page with theme selector, default view toggle, and notification preferences. Persist all settings via Zustand + localStorage.", status: "todo", priority: "low",    assigneeId: "member-4", dueDate: "2026-04-15", createdAt: "2026-03-14", tags: ["settings", "ux"], sortOrder: 1 },
  { id: "task-7",  title: "Add pagination to task list API", description: "Replace the current unbounded query with cursor-based pagination. Update the frontend to load more on scroll and reflect total count in column headers.", status: "todo", priority: "high",   assigneeId: "member-2", dueDate: "2026-04-05", createdAt: "2026-03-18", tags: ["api", "backend"], sortOrder: 2 },
  { id: "task-8",  title: "Write API documentation in OpenAPI 3.1", description: "Document all REST endpoints using OpenAPI 3.1. Include request/response schemas, error codes, and example payloads. Publish to internal Stoplight.", status: "todo", priority: "low",    assigneeId: "member-3", dueDate: "2026-04-28", createdAt: "2026-03-28", tags: ["docs", "api"], sortOrder: 3 },
  // In Progress
  { id: "task-9",  title: "Kanban board drag-and-drop", description: "Implement cross-column move and within-column reorder using @dnd-kit. Persist new order to the store and add drop placeholder animation.", status: "in-progress", priority: "urgent", assigneeId: "member-1", dueDate: "2026-04-01", createdAt: "2026-03-10", tags: ["feature", "frontend"], sortOrder: 0 },
  { id: "task-10", title: "Fix mobile nav overflow bug", description: "Sidebar and header overlap on viewports < 375px. Root cause is a missing overflow-hidden on the shell container. Also fix touch target sizes for nav links.", status: "in-progress", priority: "high",   assigneeId: "member-4", dueDate: "2026-03-31", createdAt: "2026-03-27", tags: ["bug", "mobile"], sortOrder: 1 },
  { id: "task-11", title: "Migrate to React Query for server state", description: "Replace manual fetch + Zustand patterns with React Query (TanStack). Start with the tasks and members endpoints. Set up stale-time and retry policies.", status: "in-progress", priority: "medium", assigneeId: "member-2", dueDate: "2026-04-08", createdAt: "2026-03-20", tags: ["refactor", "frontend"], sortOrder: 2 },
  { id: "task-12", title: "Implement real-time notifications", description: "Add WebSocket-based push notifications for task assignment and status changes. Show a toast and update the notification bell badge in the header.", status: "in-progress", priority: "high",   assigneeId: "member-3", dueDate: "2026-03-29", createdAt: "2026-03-15", tags: ["feature", "backend"], sortOrder: 3 },
  // Review
  { id: "task-13", title: "Global command palette (⌘K)", description: "Implement a keyboard-accessible command palette using cmdk. Support fuzzy search over tasks, navigation commands, and quick theme toggle.", status: "review", priority: "high",   assigneeId: "member-1", dueDate: "2026-03-28", createdAt: "2026-03-15", tags: ["feature", "accessibility"], sortOrder: 0 },
  { id: "task-14", title: "Add CSV export for task data", description: "Add an export button to the kanban toolbar that downloads all visible tasks as a CSV. Respect active filters. Use the native File API — no server round-trip.", status: "review", priority: "low",    assigneeId: "member-3", dueDate: "2026-04-02", createdAt: "2026-03-22", tags: ["feature", "export"], sortOrder: 1 },
  { id: "task-15", title: "Dark mode polish pass", description: "Audit every page and component in dark mode. Fix 7 known contrast issues in card borders, input placeholders, and the analytics chart axes.", status: "review", priority: "medium", assigneeId: "member-4", dueDate: "2026-04-03", createdAt: "2026-03-24", tags: ["design", "a11y"], sortOrder: 2 },
  // Done
  { id: "task-16", title: "Design system setup", description: "Configure Tailwind CSS v4, shadcn/ui (New York + base-ui), and establish design tokens including teal primary color and Plus Jakarta Sans heading font.", status: "done", priority: "high",   assigneeId: "member-1", dueDate: "2026-03-15", createdAt: "2026-03-01", tags: ["design", "setup"], sortOrder: 0 },
  { id: "task-17", title: "App shell and routing scaffold", description: "Build AppShell with collapsible sidebar, header with theme toggle, and React Router v7 nested routes. Add Framer Motion animation for sidebar collapse.", status: "done", priority: "urgent", assigneeId: "member-2", dueDate: "2026-03-20", createdAt: "2026-03-05", tags: ["feature", "routing"], sortOrder: 1 },
  { id: "task-18", title: "Zustand store architecture", description: "Set up taskStore, uiStore, and themeStore with proper TypeScript types. Add persist middleware for theme. Document store shape in inline JSDoc.", status: "done", priority: "medium", assigneeId: "member-3", dueDate: "2026-03-18", createdAt: "2026-03-08", tags: ["state", "architecture"], sortOrder: 2 },
]

export function runSeed() {
  const now = new Date().toISOString()

  // Clear existing data
  db.delete(tasks).run()
  db.delete(members).run()
  db.delete(settings).run()

  // Seed members
  for (const m of MEMBERS) {
    db.insert(members).values({ ...m, createdAt: now, updatedAt: now }).run()
  }

  // Seed tasks
  for (const t of TASKS) {
    db.insert(tasks).values({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assigneeId: t.assigneeId,
      dueDate: t.dueDate,
      tags: JSON.stringify(t.tags),
      sortOrder: t.sortOrder,
      createdAt: t.createdAt,
      updatedAt: now,
    }).run()
  }

  // Seed default settings
  db.insert(settings).values({
    id: "user",
    name: "Alice Chen",
    email: "alice@taskflow.app",
    bio: "Product manager & team lead. Building great products one task at a time.",
    accentColor: "#14b8a6",
    fontSize: "md",
    notifications: JSON.stringify({
      emailTaskAssigned: true,
      emailDeadlineReminders: true,
      emailProjectUpdates: false,
      pushNewComments: true,
      pushStatusChanges: false,
      desktopAll: true,
    }),
    integrations: JSON.stringify({
      github: "connected",
      slack: "disconnected",
      notion: "disconnected",
    }),
    updatedAt: now,
  }).run()

  console.log(`Seeded: ${MEMBERS.length} members, ${TASKS.length} tasks, 1 settings record`)
}

// Allow running directly: tsx server/db/seed.ts
runSeed()
