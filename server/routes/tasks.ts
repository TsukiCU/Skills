import { Hono } from "hono"
import { db } from "../db/index"
import { tasks } from "../db/schema"
import { eq, asc } from "drizzle-orm"
import { nanoid } from "nanoid"

type TaskRow = typeof tasks.$inferSelect

function serializeTask(row: TaskRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assigneeId,
    dueDate: row.dueDate,
    tags: JSON.parse(row.tags) as string[],
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export const tasksRouter = new Hono()

// GET /api/tasks
tasksRouter.get("/", (c) => {
  const rows = db.select().from(tasks).orderBy(asc(tasks.sortOrder)).all()
  return c.json({ data: rows.map(serializeTask) })
})

// GET /api/tasks/:id
tasksRouter.get("/:id", (c) => {
  const id = c.req.param("id")
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!row) return c.json({ error: "Task not found" }, 404)
  return c.json({ data: serializeTask(row) })
})

// POST /api/tasks
tasksRouter.post("/", async (c) => {
  const body = await c.req.json<{
    title: string
    description?: string
    status?: string
    priority?: string
    assigneeId?: string
    dueDate?: string
    tags?: string[]
  }>()

  if (!body.title?.trim()) {
    return c.json({ error: "title is required" }, 400)
  }

  const now = new Date().toISOString()
  const id = nanoid()

  // Determine sortOrder: max in column + 1
  const columnTasks = db.select().from(tasks)
    .where(eq(tasks.status, body.status ?? "backlog"))
    .all()
  const maxOrder = columnTasks.reduce((max, t) => Math.max(max, t.sortOrder), -1)

  const newTask = {
    id,
    title: body.title.trim(),
    description: body.description ?? "",
    status: body.status ?? "backlog",
    priority: body.priority ?? "medium",
    assigneeId: body.assigneeId ?? "",
    dueDate: body.dueDate ?? "",
    tags: JSON.stringify(body.tags ?? []),
    sortOrder: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  }

  db.insert(tasks).values(newTask).run()
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get()!
  return c.json({ data: serializeTask(row) }, 201)
})

// PATCH /api/tasks/:id
tasksRouter.patch("/:id", async (c) => {
  const id = c.req.param("id")
  const existing = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!existing) return c.json({ error: "Task not found" }, 404)

  const body = await c.req.json<Partial<{
    title: string
    description: string
    status: string
    priority: string
    assigneeId: string
    dueDate: string
    tags: string[]
    sortOrder: number
  }>>()

  const updates: Partial<typeof tasks.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  }
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.status !== undefined) updates.status = body.status
  if (body.priority !== undefined) updates.priority = body.priority
  if (body.assigneeId !== undefined) updates.assigneeId = body.assigneeId
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate
  if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags)
  if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder

  db.update(tasks).set(updates).where(eq(tasks.id, id)).run()
  const row = db.select().from(tasks).where(eq(tasks.id, id)).get()!
  return c.json({ data: serializeTask(row) })
})

// PATCH /api/tasks/:id/move — for drag-and-drop
tasksRouter.patch("/:id/move", async (c) => {
  const id = c.req.param("id")
  const existing = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!existing) return c.json({ error: "Task not found" }, 404)

  const body = await c.req.json<{ status: string; sortOrder: number }>()
  if (body.status === undefined || body.sortOrder === undefined) {
    return c.json({ error: "status and sortOrder are required" }, 400)
  }

  const now = new Date().toISOString()
  db.update(tasks).set({ status: body.status, sortOrder: body.sortOrder, updatedAt: now })
    .where(eq(tasks.id, id)).run()

  const row = db.select().from(tasks).where(eq(tasks.id, id)).get()!
  return c.json({ data: serializeTask(row) })
})

// DELETE /api/tasks/:id
tasksRouter.delete("/:id", (c) => {
  const id = c.req.param("id")
  const existing = db.select().from(tasks).where(eq(tasks.id, id)).get()
  if (!existing) return c.json({ error: "Task not found" }, 404)

  db.delete(tasks).where(eq(tasks.id, id)).run()
  return c.json({ data: { id } })
})
