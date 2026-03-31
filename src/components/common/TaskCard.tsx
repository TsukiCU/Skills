import { formatDistanceToNow, isPast, isToday, parseISO } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"
import { getMember } from "@/data/members"
import { useUIStore } from "@/stores/uiStore"

type TaskCardProps = {
  task: Task
  isDragging?: boolean
}

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  low:    "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
}

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  urgent: "Urgent",
  high:   "High",
  medium: "Medium",
  low:    "Low",
}

function DueLabel({ dateStr }: { dateStr: string }) {
  const date = parseISO(dateStr)
  const overdue = isPast(date) && !isToday(date)
  const label = overdue
    ? "Overdue"
    : isToday(date)
    ? "Due today"
    : `in ${formatDistanceToNow(date)}`

  return (
    <span
      className={cn(
        "text-xs",
        overdue ? "text-red-500 font-medium" : "text-muted-foreground"
      )}
    >
      {label}
    </span>
  )
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const openDrawer = useUIStore((s) => s.openDrawer)
  const member = getMember(task.assigneeId)
  const visibleTags = task.tags.slice(0, 2)
  const extraTags = task.tags.length - 2

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open task: ${task.title}`}
      data-testid={`task-card-${task.id}`}
      onClick={() => openDrawer(task.id)}
      onKeyDown={(e) => e.key === "Enter" && openDrawer(task.id)}
      className={cn(
        "group rounded-lg border border-border bg-white dark:bg-zinc-900 p-3 cursor-pointer",
        "hover:border-primary/50 hover:-translate-y-px hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "transition-all duration-150 select-none",
        isDragging && "shadow-lg scale-[1.02] rotate-[0.8deg] opacity-90"
      )}
    >
      {/* Priority badge */}
      <div className="mb-2">
        <span
          className={cn(
            "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
            PRIORITY_STYLES[task.priority]
          )}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">
        {task.title}
      </p>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground">
              +{extraTags}
            </span>
          )}
        </div>
      )}

      {/* Footer: assignee + due date */}
      <div className="flex items-center justify-between mt-1">
        {member ? (
          <div
            title={member.name}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0",
              member.color
            )}
          >
            {member.avatar}
          </div>
        ) : (
          <div className="h-6 w-6" />
        )}
        <DueLabel dateStr={task.dueDate} />
      </div>
    </div>
  )
}
