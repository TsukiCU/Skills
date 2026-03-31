import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/lib/types"
import { TaskCard } from "@/components/common/TaskCard"

type SortableTaskCardProps = {
  task: Task
  isDragging: boolean
}

export function SortableTaskCard({ task, isDragging }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} isDragging={isDragging || isSortableDragging} />
    </div>
  )
}
