import { create } from "zustand"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { mockTasks } from "@/data/tasks"
import { COLUMN_ORDER } from "@/lib/constants"

type KanbanFilters = {
  searchQuery: string
  priorityFilter: TaskPriority[]
  assigneeFilter: string[]
}

type TaskStore = KanbanFilters & {
  tasks: Task[]

  // Mutations
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, newStatus: TaskStatus, newIndex?: number) => void

  // Filter setters
  setSearchQuery: (q: string) => void
  setPriorityFilter: (priorities: TaskPriority[]) => void
  setAssigneeFilter: (assigneeIds: string[]) => void
  clearFilters: () => void

  // Computed
  getFilteredTasksByStatus: () => Record<TaskStatus, Task[]>
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,
  searchQuery: "",
  priorityFilter: [],
  assigneeFilter: [],

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  moveTask: (taskId, newStatus, newIndex) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId)
      if (!task) return state

      // Remove task from current position
      const rest = state.tasks.filter((t) => t.id !== taskId)
      const updated = { ...task, status: newStatus }

      if (newIndex === undefined) {
        return { tasks: [...rest, updated] }
      }

      // Insert at specific index within the target column
      const before = rest.filter(
        (t) => t.status === newStatus && rest.indexOf(t) < newIndex
      )
      const after = rest.filter(
        (t) => t.status === newStatus && rest.indexOf(t) >= newIndex
      )
      const others = rest.filter((t) => t.status !== newStatus)

      // Rebuild preserving global order: other columns in column order, then insert
      const result: Task[] = []
      for (const col of COLUMN_ORDER) {
        if (col === newStatus) {
          result.push(...before, updated, ...after)
        } else {
          result.push(...others.filter((t) => t.status === col))
        }
      }
      return { tasks: result }
    }),

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
