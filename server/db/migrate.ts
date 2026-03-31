import { sqlite } from "./index"

// Create tables if they don't exist (simple inline migration)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'backlog',
    priority TEXT NOT NULL DEFAULT 'medium',
    assignee_id TEXT NOT NULL DEFAULT '',
    due_date TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY DEFAULT 'user',
    name TEXT NOT NULL DEFAULT 'Alice Chen',
    email TEXT NOT NULL DEFAULT 'alice@taskflow.app',
    bio TEXT NOT NULL DEFAULT '',
    accent_color TEXT NOT NULL DEFAULT '#14b8a6',
    font_size TEXT NOT NULL DEFAULT 'md',
    notifications TEXT NOT NULL DEFAULT '{}',
    integrations TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
  );
`)

console.log("Migration complete")
