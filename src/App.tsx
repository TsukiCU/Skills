import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AppShell } from "@/components/layout/AppShell"
import { KanbanPage } from "@/pages/KanbanPage/KanbanPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage/AnalyticsPage"
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage"
import { ROUTES } from "@/lib/constants"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/kanban" replace />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
