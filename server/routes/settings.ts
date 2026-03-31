import { Hono } from "hono"
import { db } from "../db/index"
import { settings } from "../db/schema"
import { eq } from "drizzle-orm"

type SettingsRow = typeof settings.$inferSelect

function serializeSettings(row: SettingsRow) {
  return {
    name: row.name,
    email: row.email,
    bio: row.bio,
    accentColor: row.accentColor,
    fontSize: row.fontSize,
    notifications: JSON.parse(row.notifications),
    integrations: JSON.parse(row.integrations),
    updatedAt: row.updatedAt,
  }
}

export const settingsRouter = new Hono()

// GET /api/settings
settingsRouter.get("/", (c) => {
  const row = db.select().from(settings).where(eq(settings.id, "user")).get()
  if (!row) return c.json({ error: "Settings not found" }, 404)
  return c.json({ data: serializeSettings(row) })
})

// PATCH /api/settings
settingsRouter.patch("/", async (c) => {
  const body = await c.req.json<Partial<{
    name: string
    email: string
    bio: string
    accentColor: string
    fontSize: string
    notifications: Record<string, boolean>
    integrations: Record<string, string>
  }>>()

  const existing = db.select().from(settings).where(eq(settings.id, "user")).get()
  if (!existing) return c.json({ error: "Settings not found" }, 404)

  const updates: Partial<typeof settings.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  }
  if (body.name !== undefined) updates.name = body.name
  if (body.email !== undefined) updates.email = body.email
  if (body.bio !== undefined) updates.bio = body.bio
  if (body.accentColor !== undefined) updates.accentColor = body.accentColor
  if (body.fontSize !== undefined) updates.fontSize = body.fontSize
  if (body.notifications !== undefined) updates.notifications = JSON.stringify(body.notifications)
  if (body.integrations !== undefined) updates.integrations = JSON.stringify(body.integrations)

  db.update(settings).set(updates).where(eq(settings.id, "user")).run()
  const row = db.select().from(settings).where(eq(settings.id, "user")).get()!
  return c.json({ data: serializeSettings(row) })
})
