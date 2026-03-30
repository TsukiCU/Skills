import { BrowserRouter, Routes, Route } from "react-router"
import { KanbanPage } from "@/pages/KanbanPage/KanbanPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage/AnalyticsPage"
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage"
import { ROUTES } from "@/lib/constants"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.KANBAN} element={<KanbanPage />} />
        <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
