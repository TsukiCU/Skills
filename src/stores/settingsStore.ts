import { create } from "zustand"
import { api } from "@/lib/api"

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
  // Loading
  loaded: boolean
  // Actions
  fetchSettings: () => Promise<void>
  saveProfile: (data: { name: string; email: string; bio: string }) => Promise<void>
  saveAppearance: (data: { accentColor: string; fontSize: "sm" | "md" | "lg" }) => Promise<void>
  saveNotifications: (data: NotificationSettings) => Promise<void>
  toggleIntegration: (id: IntegrationId) => Promise<void>
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  emailTaskAssigned: true,
  emailDeadlineReminders: true,
  emailProjectUpdates: false,
  pushNewComments: true,
  pushStatusChanges: false,
  desktopAll: true,
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  name: "Alice Chen",
  email: "alice@taskflow.app",
  bio: "Product manager & team lead. Building great products one task at a time.",
  accentColor: "#14b8a6",
  fontSize: "md",
  notifications: DEFAULT_NOTIFICATIONS,
  integrations: {
    github: "connected",
    slack: "disconnected",
    notion: "disconnected",
  },
  loaded: false,

  fetchSettings: async () => {
    try {
      const data = await api.settings.get()
      set({
        name: data.name,
        email: data.email,
        bio: data.bio,
        accentColor: data.accentColor,
        fontSize: data.fontSize as "sm" | "md" | "lg",
        notifications: data.notifications as NotificationSettings,
        integrations: data.integrations as Record<IntegrationId, IntegrationStatus>,
        loaded: true,
      })
    } catch {
      // Fallback to defaults if API unavailable
      set({ loaded: true })
    }
  },

  saveProfile: async (data) => {
    set(data)
    await api.settings.update(data)
  },

  saveAppearance: async (data) => {
    set(data)
    await api.settings.update(data)
  },

  saveNotifications: async (data) => {
    set({ notifications: data })
    await api.settings.update({ notifications: data })
  },

  toggleIntegration: async (id) => {
    const current = get().integrations
    const next: Record<IntegrationId, IntegrationStatus> = {
      ...current,
      [id]: current[id] === "connected" ? "disconnected" : "connected",
    }
    set({ integrations: next })
    await api.settings.update({ integrations: next })
  },
}))
