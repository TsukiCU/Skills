import { motion } from "framer-motion"
import { NavLink, useLocation } from "react-router"
import {
  LayoutGrid,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/constants"

type SidebarProps = {
  collapsed: boolean
  onToggle: () => void
}

const NAV_ITEMS = [
  { label: "Kanban", to: ROUTES.KANBAN, icon: LayoutGrid },
  { label: "Analytics", to: ROUTES.ANALYTICS, icon: BarChart2 },
  { label: "Settings", to: ROUTES.SETTINGS, icon: Settings },
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative flex h-full flex-col border-r border-border bg-sidebar overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0">
            <Zap className="h-4 w-4" />
          </div>
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            transition={{ duration: 0.15 }}
            className="font-heading font-bold text-base text-foreground overflow-hidden whitespace-nowrap"
          >
            TaskFlow
          </motion.span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => {
          const isActive =
            to === ROUTES.KANBAN
              ? location.pathname === "/" || location.pathname === "/kanban"
              : location.pathname.startsWith(to)

          return (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-all duration-150",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-sidebar-foreground/70"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <motion.span
                animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            </NavLink>
          )
        })}
      </nav>

      {/* User area */}
      <div className="border-t border-border p-2 shrink-0">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md px-2 py-2",
            collapsed && "justify-center"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
            AC
          </div>
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden whitespace-nowrap min-w-0"
          >
            <p className="text-sm font-medium text-sidebar-foreground leading-none">
              Tsuki
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
          </motion.div>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute -right-3 top-[3.25rem] z-10 flex h-6 w-6 items-center justify-center",
          "rounded-full border border-border bg-background shadow-sm",
          "text-muted-foreground hover:text-foreground hover:bg-accent",
          "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>
    </motion.aside>
  )
}
