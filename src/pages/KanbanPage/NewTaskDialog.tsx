import { useState } from "react"
import { addDays } from "date-fns"
import { Plus } from "lucide-react"
import { useTaskStore } from "@/stores/taskStore"
import { MEMBERS } from "@/data/members"
import { TASK_STATUSES } from "@/lib/constants"
import type { TaskStatus, TaskPriority } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_OPTIONS: TaskStatus[] = ["backlog", "todo", "in-progress", "review", "done"]
const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
]

export function NewTaskDialog() {
  const addTask = useTaskStore((s) => s.addTask)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<TaskStatus>("todo")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [assigneeId, setAssigneeId] = useState(MEMBERS[0].id)
  const [tagsInput, setTagsInput] = useState("")
  const [titleError, setTitleError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError(true)
      return
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    addTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId,
      tags,
      dueDate: addDays(new Date(), 7).toISOString().slice(0, 10),
    }).catch(() => {/* handled in store */})
    resetAndClose()
  }

  function resetAndClose() {
    setTitle("")
    setDescription("")
    setStatus("todo")
    setPriority("medium")
    setAssigneeId(MEMBERS[0].id)
    setTagsInput("")
    setTitleError(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o: boolean) => { if (!o) resetAndClose(); else setOpen(true) }}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5" data-testid="new-task-btn">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(false) }}
              placeholder="Task title"
              aria-invalid={titleError}
              className={titleError ? "border-destructive" : ""}
              data-testid="new-task-title"
            />
            {titleError && (
              <p className="text-xs text-destructive">Title is required</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-desc" className="text-sm font-medium">Description</label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="resize-none"
              data-testid="new-task-description"
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="w-full" aria-label="Status" data-testid="new-task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUSES[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="w-full" aria-label="Priority" data-testid="new-task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Assignee</label>
            <Select value={assigneeId} onValueChange={(v) => { if (v) setAssigneeId(v) }}>
              <SelectTrigger className="w-full" aria-label="Assignee" data-testid="new-task-assignee">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEMBERS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label htmlFor="task-tags" className="text-sm font-medium">Tags</label>
            <Input
              id="task-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="frontend, bug, api (comma-separated)"
              data-testid="new-task-tags"
            />
          </div>

          <DialogFooter className="pt-2 flex-row justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" data-testid="new-task-submit">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
