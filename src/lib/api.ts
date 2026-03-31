import type { Task, TaskStatus, TaskPriority, TeamMember } from "@/lib/types"

type NotificationSettings = {
  emailTaskAssigned: boolean
  emailDeadlineReminders: boolean
  emailProjectUpdates: boolean
  pushNewComments: boolean
  pushStatusChanges: boolean
  desktopAll: boolean
}

type IntegrationStatus = "connected" | "disconnected"

export type ApiSettings = {
  name: string
  email: string
  bio: string
  accentColor: string
  fontSize: "sm" | "md" | "lg"
  notifications: NotificationSettings
  integrations: Record<string, IntegrationStatus>
  updatedAt: string
}

export type ApiTask = Task & { sortOrder: number; updatedAt: string }

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error((err as { error: string }).error ?? res.statusText)
  }
  const json = await res.json() as { data: T }
  return json.data
}

// Tasks
export const api = {
  tasks: {
    list: () => request<ApiTask[]>("/api/tasks"),
    create: (body: {
      title: string
      description?: string
      status?: TaskStatus
      priority?: TaskPriority
      assigneeId?: string
      dueDate?: string
      tags?: string[]
    }) => request<ApiTask>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{
      title: string
      description: string
      status: TaskStatus
      priority: TaskPriority
      assigneeId: string
      dueDate: string
      tags: string[]
      sortOrder: number
    }>) => request<ApiTask>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    move: (id: string, status: TaskStatus, sortOrder: number) =>
      request<ApiTask>(`/api/tasks/${id}/move`, {
        method: "PATCH",
        body: JSON.stringify({ status, sortOrder }),
      }),
    delete: (id: string) => request<{ id: string }>(`/api/tasks/${id}`, { method: "DELETE" }),
  },

  members: {
    list: () => request<TeamMember[]>("/api/members"),
  },

  settings: {
    get: () => request<ApiSettings>("/api/settings"),
    update: (body: Partial<ApiSettings>) =>
      request<ApiSettings>("/api/settings", { method: "PATCH", body: JSON.stringify(body) }),
  },
}
