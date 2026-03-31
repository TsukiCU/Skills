import type { TaskStatus, TaskPriority } from "./types"

export const TASK_STATUSES: Record<TaskStatus, string> = {
  "backlog": "Backlog",
  "todo": "To Do",
  "in-progress": "In Progress",
  "review": "Review",
  "done": "Done",
}

export const COLUMN_ORDER: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "done"]

export const STATUS_COLORS: Record<TaskStatus, string> = {
  "backlog": "bg-zinc-400",
  "todo": "bg-sky-400",
  "in-progress": "bg-amber-400",
  "review": "bg-violet-400",
  "done": "bg-emerald-400",
}

export const TASK_PRIORITIES: Record<TaskPriority, string> = {
  "low": "Low",
  "medium": "Medium",
  "high": "High",
  "urgent": "Urgent",
}

export const ROUTES = {
  KANBAN: "/",
  ANALYTICS: "/analytics",
  SETTINGS: "/settings",
} as const
