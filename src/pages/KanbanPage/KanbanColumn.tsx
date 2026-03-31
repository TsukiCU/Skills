import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import type { Task, TaskStatus } from "@/lib/types"
import { TASK_STATUSES, STATUS_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { SortableTaskCard } from "./SortableTaskCard"

type KanbanColumnProps = {
  status: TaskStatus
  tasks: Task[]
  activeId: string | null
}

export function KanbanColumn({ status, tasks, activeId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div data-testid={`column-${status}`} className="flex flex-col w-[300px] shrink-0 rounded-xl bg-gray-50 dark:bg-zinc-950 border border-border">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", STATUS_COLORS[status])} />
          <span className="text-sm font-semibold text-foreground">
            {TASK_STATUSES[status]}
          </span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <button
          aria-label={`Add task to ${TASK_STATUSES[status]}`}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-col gap-2 p-2 flex-1 min-h-[120px] rounded-b-xl transition-colors duration-150",
          isOver && "bg-primary/5"
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              isDragging={activeId === task.id}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !isOver && (
          <div className="flex flex-1 items-center justify-center py-6">
            <p className="text-xs text-muted-foreground">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}
