export type TaskStatus = "todo" | "in-progress" | "review" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export type Task = {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  dueDate: string
  createdAt: string
  tags: string[]
}

export type Column = {
  id: TaskStatus
  title: string
  tasks: Task[]
}

export type UserPreferences = {
  theme: "light" | "dark" | "system"
  sidebarCollapsed: boolean
  defaultView: "kanban" | "analytics"
}
