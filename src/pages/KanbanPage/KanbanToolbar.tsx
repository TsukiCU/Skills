import { Search, X } from "lucide-react"
import { useTaskStore } from "@/stores/taskStore"
import { MEMBERS } from "@/data/members"
import type { TaskPriority } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NewTaskDialog } from "./NewTaskDialog"

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export function KanbanToolbar() {
  const {
    searchQuery,
    priorityFilter,
    assigneeFilter,
    setSearchQuery,
    setPriorityFilter,
    setAssigneeFilter,
    clearFilters,
  } = useTaskStore()

  const hasFilters = searchQuery || priorityFilter.length > 0 || assigneeFilter.length > 0

  function togglePriority(p: TaskPriority) {
    if (priorityFilter.includes(p)) {
      setPriorityFilter(priorityFilter.filter((x) => x !== p))
    } else {
      setPriorityFilter([...priorityFilter, p])
    }
  }

  function toggleAssignee(id: string) {
    if (assigneeFilter.includes(id)) {
      setAssigneeFilter(assigneeFilter.filter((x) => x !== id))
    } else {
      setAssigneeFilter([...assigneeFilter, id])
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border bg-background">
      {/* Search */}
      <div className="relative w-52 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks…"
          className="pl-8 h-8 text-sm"
          aria-label="Search tasks"
          data-testid="search-input"
        />
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-1">
        {PRIORITIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => togglePriority(value)}
            aria-pressed={priorityFilter.includes(value)}
            data-testid={`priority-filter-${value}`}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium border transition-all duration-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              priorityFilter.includes(value)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Assignee filter */}
      <div className="flex items-center gap-1">
        {MEMBERS.map((m) => (
          <button
            key={m.id}
            onClick={() => toggleAssignee(m.id)}
            title={m.name}
            aria-pressed={assigneeFilter.includes(m.id)}
            aria-label={`Filter by ${m.name}`}
            data-testid={`assignee-filter-${m.id}`}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-white transition-all duration-100",
              m.color,
              assigneeFilter.includes(m.id)
                ? "ring-2 ring-offset-1 ring-primary scale-110"
                : "opacity-60 hover:opacity-100"
            )}
          >
            {m.avatar}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1 text-muted-foreground hover:text-foreground h-8"
          aria-label="Clear all filters"
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}

      {/* Spacer + New Task */}
      <div className="ml-auto">
        <NewTaskDialog />
      </div>
    </div>
  )
}
