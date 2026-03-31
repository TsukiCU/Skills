import { useState, useRef } from "react"
import { X, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useUIStore } from "@/stores/uiStore"
import { useTaskStore } from "@/stores/taskStore"
import { MEMBERS } from "@/data/members"
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_COLORS } from "@/lib/constants"
import type { TaskStatus, TaskPriority } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const STATUS_ORDER: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "done"]
const PRIORITY_ORDER: TaskPriority[] = ["low", "medium", "high", "urgent"]

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low:    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-800/30",
  high:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/30",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/30",
}

export function DetailDrawer() {
  const { drawerOpen, drawerTaskId, closeDrawer } = useUIStore()
  const { tasks, updateTask, deleteTask } = useTaskStore()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const task = tasks.find((t) => t.id === drawerTaskId)

  function handleTitleBlur() {
    if (!task || !titleRef.current) return
    const val = titleRef.current.value.trim()
    if (val && val !== task.title) updateTask(task.id, { title: val })
  }

  function handleDescBlur(e: React.FocusEvent<HTMLTextAreaElement>) {
    if (!task) return
    const val = e.target.value
    if (val !== task.description) updateTask(task.id, { description: val })
  }

  function handleDelete() {
    if (!task) return
    deleteTask(task.id)
    setDeleteOpen(false)
    closeDrawer()
  }

  function removeTag(tag: string) {
    if (!task) return
    updateTask(task.id, { tags: task.tags.filter((t) => t !== tag) })
  }

  return (
    <>
      <Sheet open={drawerOpen} onOpenChange={(open: boolean) => !open && closeDrawer()}>
        <SheetContent
          side="right"
          className="w-full sm:w-[480px] sm:max-w-[480px] flex flex-col gap-0 p-0 overflow-y-auto"
        >
          {!task ? (
            <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm p-8">
              Task not found.
            </div>
          ) : (
            <>
              {/* Header */}
              <SheetHeader className="border-b border-border px-5 py-4 gap-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="sr-only">Edit task</SheetTitle>
                    <Input
                      ref={titleRef}
                      defaultValue={task.title}
                      onBlur={handleTitleBlur}
                      className="border-0 px-0 text-base font-semibold focus-visible:ring-0 h-auto py-0"
                      aria-label="Task title"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeDrawer}
                    aria-label="Close drawer"
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>

              {/* Body */}
              <div className="flex-1 space-y-5 px-5 py-4">
                {/* Status */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateTask(task.id, { status: s })}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-100",
                          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          task.status === s
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_COLORS[s])} />
                        {TASK_STATUSES[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Priority</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITY_ORDER.map((p) => (
                      <button
                        key={p}
                        onClick={() => updateTask(task.id, { priority: p })}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-100",
                          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          task.priority === p
                            ? "border-primary ring-1 ring-primary"
                            : "border-transparent",
                          PRIORITY_COLORS[p]
                        )}
                      >
                        {TASK_PRIORITIES[p]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Assignee</p>
                  <div className="flex flex-wrap gap-2">
                    {MEMBERS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => updateTask(task.id, { assigneeId: m.id })}
                        title={m.name}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-100",
                          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          task.assigneeId === m.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background hover:bg-muted"
                        )}
                      >
                        <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white shrink-0", m.color)}>
                          {m.avatar}
                        </div>
                        <span className="text-xs font-medium text-foreground">{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due date */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Due Date</p>
                  <Input
                    type="date"
                    defaultValue={task.dueDate}
                    onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                    className="w-44"
                    aria-label="Due date"
                  />
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            aria-label={`Remove tag ${tag}`}
                            className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Description</p>
                  <Textarea
                    defaultValue={task.description}
                    onBlur={handleDescBlur}
                    rows={4}
                    placeholder="Add a description…"
                    className="resize-none text-sm"
                    aria-label="Task description"
                  />
                </div>

                {/* Created at */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(task.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-5 py-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete task
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={(open: boolean) => setDeleteOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete task?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The task will be permanently removed.
          </p>
          <DialogFooter className="flex-row justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
