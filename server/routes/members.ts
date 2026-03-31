import { Hono } from "hono"
import { db } from "../db/index"
import { members } from "../db/schema"

export const membersRouter = new Hono()

// GET /api/members
membersRouter.get("/", (c) => {
  const rows = db.select().from(members).all()
  return c.json({ data: rows })
})
