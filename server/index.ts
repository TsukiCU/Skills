import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import "./db/migrate"
import { tasksRouter } from "./routes/tasks"
import { membersRouter } from "./routes/members"
import { settingsRouter } from "./routes/settings"

const app = new Hono()

app.use("*", cors({
  origin: ["http://localhost:5173", "http://localhost:4173"],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type"],
}))

app.use("*", logger())

app.route("/api/tasks", tasksRouter)
app.route("/api/members", membersRouter)
app.route("/api/settings", settingsRouter)

app.get("/api/health", (c) => c.json({ status: "ok" }))

const PORT = 3001
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
