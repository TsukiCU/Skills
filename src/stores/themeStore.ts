import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark" | "system"

type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

function getResolved(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  }
  return theme
}

function applyTheme(theme: Theme) {
  const resolved = getResolved(theme)
  document.documentElement.classList.toggle("dark", resolved === "dark")
  return resolved
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",
      setTheme: (theme) => {
        const resolved = applyTheme(theme)
        set({ theme, resolvedTheme: resolved })
      },
    }),
    {
      name: "taskflow-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = applyTheme(state.theme)
          state.resolvedTheme = resolved
        }
      },
    }
  )
)
