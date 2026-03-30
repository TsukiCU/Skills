import { create } from "zustand"
import type { UserPreferences } from "@/lib/types"

type UIStore = {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  drawerOpen: boolean
  drawerTaskId: string | null
  openDrawer: (taskId: string) => void
  closeDrawer: () => void
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  preferences: {
    theme: "system",
    sidebarCollapsed: false,
    defaultView: "kanban",
  },
  updatePreferences: (updates) =>
    set((state) => ({ preferences: { ...state.preferences, ...updates } })),
  drawerOpen: false,
  drawerTaskId: null,
  openDrawer: (taskId) => set({ drawerOpen: true, drawerTaskId: taskId }),
  closeDrawer: () => set({ drawerOpen: false, drawerTaskId: null }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}))
