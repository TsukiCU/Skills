import { create } from "zustand"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { COLUMN_ORDER } from "@/lib/constants"
import { api } from "@/lib/api"

type KanbanFilters = {
  searchQuery: string
  priorityFilter: TaskPriority[]
  assigneeFilter: string[]
}

type TaskStore = KanbanFilters & {
  tasks: Task[]
  loading: boolean
  error: string | null

  // Bootstrap
  fetchTasks: () => Promise<void>

  // Mutations
  addTask: (task: Omit<Task, "id" | "createdAt"> & { id?: string; createdAt?: string }) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex?: number) => Promise<void>

  // Filter setters
  setSearchQuery: (q: string) => void
  setPriorityFilter: (priorities: TaskPriority[]) => void
  setAssigneeFilter: (assigneeIds: string[]) => void
  clearFilters: () => void

  // Computed
  getFilteredTasksByStatus: () => Record<TaskStatus, Task[]>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  searchQuery: "",
  priorityFilter: [],
  assigneeFilter: [],

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const apiTasks = await api.tasks.list()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tasks: Task[] = apiTasks.map(({ sortOrder: _so, updatedAt: _ua, ...t }) => t)
      set({ tasks, loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  addTask: async (taskInput) => {
    const created = await api.tasks.create({
      title: taskInput.title,
      description: taskInput.description,
      status: taskInput.status,
      priority: taskInput.priority,
      assigneeId: taskInput.assigneeId,
      dueDate: taskInput.dueDate,
      tags: taskInput.tags,
    })
    const task: Task = {
      id: created.id,
      title: created.title,
      description: created.description,
      status: created.status as TaskStatus,
      priority: created.priority as TaskPriority,
      assigneeId: created.assigneeId,
      dueDate: created.dueDate,
      tags: created.tags,
      createdAt: created.createdAt,
    }
    set((state) => ({ tasks: [...state.tasks, task] }))
  },

  updateTask: async (id, updates) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
    try {
      await api.tasks.update(id, {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.assigneeId !== undefined && { assigneeId: updates.assigneeId }),
        ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
        ...(updates.tags !== undefined && { tags: updates.tags }),
      })
    } catch {
      // Rollback — refetch
      get().fetchTasks()
    }
  },

  deleteTask: async (id) => {
    // Optimistic delete
    const prev = get().tasks
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
    try {
      await api.tasks.delete(id)
    } catch {
      set({ tasks: prev })
    }
  },

  moveTask: async (taskId, newStatus, newIndex) => {
    const state = get()
    const task = state.tasks.find((t) => t.id === taskId)
    if (!task) return

    // Build new task list (optimistic)
    const rest = state.tasks.filter((t) => t.id !== taskId)
    const updated = { ...task, status: newStatus }

    let newTasks: Task[]
    if (newIndex === undefined) {
      newTasks = [...rest, updated]
    } else {
      const before = rest.filter(
        (t) => t.status === newStatus && rest.indexOf(t) < newIndex
      )
      const after = rest.filter(
        (t) => t.status === newStatus && rest.indexOf(t) >= newIndex
      )
      const others = rest.filter((t) => t.status !== newStatus)
      newTasks = []
      for (const col of COLUMN_ORDER) {
        if (col === newStatus) {
          newTasks.push(...before, updated, ...after)
        } else {
          newTasks.push(...others.filter((t) => t.status === col))
        }
      }
    }

    set({ tasks: newTasks })

    // Persist to API in background (fire-and-forget with rollback)
    const colTasks = newTasks.filter((t) => t.status === newStatus)
    const sortOrder = colTasks.findIndex((t) => t.id === taskId)
    try {
      await api.tasks.move(taskId, newStatus, sortOrder)
    } catch {
      set({ tasks: state.tasks })
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setPriorityFilter: (priorities) => set({ priorityFilter: priorities }),
  setAssigneeFilter: (assigneeIds) => set({ assigneeFilter: assigneeIds }),
  clearFilters: () => set({ searchQuery: "", priorityFilter: [], assigneeFilter: [] }),

  getFilteredTasksByStatus: () => {
    const { tasks, searchQuery, priorityFilter, assigneeFilter } = get()

    const q = searchQuery.toLowerCase().trim()
    const filtered = tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false
      if (priorityFilter.length > 0 && !priorityFilter.includes(t.priority)) return false
      if (assigneeFilter.length > 0 && !assigneeFilter.includes(t.assigneeId)) return false
      return true
    })

    const grouped = Object.fromEntries(
      COLUMN_ORDER.map((status) => [status, [] as Task[]])
    ) as Record<TaskStatus, Task[]>

    for (const task of filtered) {
      grouped[task.status].push(task)
    }
    return grouped
  },
}))
