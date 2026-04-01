import { useLocation } from "react-router"
import { Bell, Search, Sun, Moon, Monitor } from "lucide-react"
import { useThemeStore } from "@/stores/themeStore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const PAGE_TITLES: Record<string, string> = {
  "/kanban": "Kanban Board",
  [ROUTES.ANALYTICS]: "Analytics",
  [ROUTES.SETTINGS]: "Settings",
}

export function Header() {
  const location = useLocation()
  const { theme, setTheme, resolvedTheme } = useThemeStore()

  const title = PAGE_TITLES[location.pathname] ?? "TaskFlow"

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      {/* Page title */}
      <h1 className="font-heading text-base font-semibold text-foreground">
        {title}
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search / Command palette trigger */}
        <Button
          variant="ghost"
          size="sm"
          aria-label="Open command palette (⌘K)"
          className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">⌘K</span>
        </Button>

        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-muted-foreground hover:text-foreground relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="theme-toggle"
            aria-label="Toggle theme"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "transition-colors duration-150"
            )}
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              data-testid="theme-option-light"
              onClick={() => setTheme("light")}
              className={theme === "light" ? "text-primary font-medium" : ""}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid="theme-option-dark"
              onClick={() => setTheme("dark")}
              className={theme === "dark" ? "text-primary font-medium" : ""}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem
              data-testid="theme-option-system"
              onClick={() => setTheme("system")}
              className={theme === "system" ? "text-primary font-medium" : ""}
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="User menu"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full",
              "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "transition-colors duration-150"
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
              AC
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">Alice Chen</p>
              <p className="text-xs text-muted-foreground">alice@example.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
