import { useState, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  closestCorners,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useTaskStore } from "@/stores/taskStore"
import { COLUMN_ORDER } from "@/lib/constants"
import type { TaskStatus } from "@/lib/types"
import { TaskCard } from "@/components/common/TaskCard"
import { DetailDrawer } from "@/components/layout/DetailDrawer"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanToolbar } from "./KanbanToolbar"

export function KanbanPage() {
  const { tasks, moveTask, getFilteredTasksByStatus, fetchTasks } = useTaskStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const filteredByStatus = getFilteredTasksByStatus()
  const activeTask = tasks.find((t) => t.id === activeId) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const activeTaskId = active.id as string
    const overId = over.id as string

    const draggedTask = tasks.find((t) => t.id === activeTaskId)
    if (!draggedTask) return

    const isOverColumn = (COLUMN_ORDER as string[]).includes(overId)
    const targetStatus: TaskStatus = isOverColumn
      ? (overId as TaskStatus)
      : (tasks.find((t) => t.id === overId)?.status ?? draggedTask.status)

    if (isOverColumn) {
      moveTask(activeTaskId, targetStatus)
      return
    }

    const columnTasks = filteredByStatus[targetStatus] ?? []
    const oldIndex = columnTasks.findIndex((t) => t.id === activeTaskId)
    const newIndex = columnTasks.findIndex((t) => t.id === overId)

    if (draggedTask.status !== targetStatus) {
      moveTask(activeTaskId, targetStatus, newIndex >= 0 ? newIndex : undefined)
    } else if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reordered = arrayMove(columnTasks, oldIndex, newIndex)
      const allOtherTasks = tasks.filter((t) => t.status !== targetStatus)
      useTaskStore.setState({ tasks: [...allOtherTasks, ...reordered] })
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <KanbanToolbar />
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 p-4 h-full w-fit min-w-full">
            {COLUMN_ORDER.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={filteredByStatus[status] ?? []}
                activeId={activeId}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      <DetailDrawer />
    </div>
  )
}
