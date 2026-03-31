import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("backlog"),
  priority: text("priority").notNull().default("medium"),
  assigneeId: text("assignee_id").notNull().default(""),
  dueDate: text("due_date").notNull().default(""),
  tags: text("tags").notNull().default("[]"), // JSON string
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatar: text("avatar").notNull(), // initials
  color: text("color").notNull(),   // tailwind bg class
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey().default("user"),
  name: text("name").notNull().default("Alice Chen"),
  email: text("email").notNull().default("alice@taskflow.app"),
  bio: text("bio").notNull().default(""),
  accentColor: text("accent_color").notNull().default("#14b8a6"),
  fontSize: text("font_size").notNull().default("md"),
  notifications: text("notifications").notNull().default("{}"), // JSON string
  integrations: text("integrations").notNull().default("{}"),   // JSON string
  updatedAt: text("updated_at").notNull(),
})
