import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NotificationSettings = {
  emailTaskAssigned: boolean
  emailDeadlineReminders: boolean
  emailProjectUpdates: boolean
  pushNewComments: boolean
  pushStatusChanges: boolean
  desktopAll: boolean
}

export type IntegrationId = "github" | "slack" | "notion"
export type IntegrationStatus = "connected" | "disconnected"

type SettingsState = {
  // Profile
  name: string
  email: string
  bio: string
  // Appearance
  accentColor: string
  fontSize: "sm" | "md" | "lg"
  // Notifications
  notifications: NotificationSettings
  // Integrations
  integrations: Record<IntegrationId, IntegrationStatus>
  // Actions
  saveProfile: (data: { name: string; email: string; bio: string }) => void
  saveAppearance: (data: { accentColor: string; fontSize: "sm" | "md" | "lg" }) => void
  saveNotifications: (data: NotificationSettings) => void
  toggleIntegration: (id: IntegrationId) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      name: "Alice Chen",
      email: "alice@taskflow.app",
      bio: "Product manager & team lead. Building great products one task at a time.",
      accentColor: "#14b8a6",
      fontSize: "md",
      notifications: {
        emailTaskAssigned: true,
        emailDeadlineReminders: true,
        emailProjectUpdates: false,
        pushNewComments: true,
        pushStatusChanges: false,
        desktopAll: true,
      },
      integrations: {
        github: "connected",
        slack: "disconnected",
        notion: "disconnected",
      },
      saveProfile: (data) => set(data),
      saveAppearance: (data) => set(data),
      saveNotifications: (data) => set({ notifications: data }),
      toggleIntegration: (id) =>
        set((s) => ({
          integrations: {
            ...s.integrations,
            [id]: s.integrations[id] === "connected" ? "disconnected" : "connected",
          },
        })),
    }),
    { name: "taskflow-settings" }
  )
)
