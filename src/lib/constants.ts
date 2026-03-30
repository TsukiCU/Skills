import type { TaskStatus, TaskPriority } from "./types"

export const TASK_STATUSES: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "review": "Review",
  "done": "Done",
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
