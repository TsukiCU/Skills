---
name: git-workflow
description: "Handle all git operations following project conventions. Use this skill when the user asks to commit, push, create a branch, make a PR, check status, or any git-related operation. Trigger keywords: 'commit', 'push', 'PR', 'pull request', 'branch', 'merge', 'git status', 'save my work', 'push to GitHub', 'create a PR for this'. Always use this skill for git operations to ensure consistent commit messages and branch naming."
---

# Git Workflow Skill

Standardized git operations for this project.

## Branch Naming
```
feat/short-description     # New feature
fix/short-description      # Bug fix
refactor/short-description # Code restructure
style/short-description    # Visual/CSS only changes
chore/short-description    # Tooling, deps, config
```

## Commit Message Format
```
type: concise description in imperative mood

# Examples:
feat: add kanban board page with drag-and-drop columns
fix: correct dark mode colors on settings form
style: unify card padding across analytics page
refactor: extract task store from KanbanPage
chore: add framer-motion dependency
```

Rules:
- Type prefix is mandatory
- Description in lowercase, no period at end
- Imperative mood ("add" not "added", "fix" not "fixes")
- Max 72 characters for subject line
- If change is complex, add body separated by blank line

## Standard Operations

### Committing Work
```bash
# 1. Check what changed
git status
git diff --stat

# 2. Stage relevant files (NOT blanket `git add .`)
git add src/pages/KanbanPage/
git add src/components/common/TaskCard.tsx

# 3. Commit with conventional message
git commit -m "feat: add kanban board page with drag-and-drop columns"
```

IMPORTANT: Stage files selectively. Group related changes into one commit. Unrelated changes get separate commits.

### Creating a Feature Branch
```bash
git checkout -b feat/kanban-board
# ... do work ...
# ... commit ...
git push -u origin feat/kanban-board
```

### Creating a Pull Request
Use the GitHub MCP tool to create PRs:
- Title: same format as commit message
- Body: brief description of what changed and why
- Always target `main` branch unless told otherwise

### Before Any Push
Run these checks:
```bash
npm run type-check
npm run lint
```
If either fails, fix before pushing. Never push broken code.

## Safety Rules
- NEVER force push to `main`
- NEVER commit `.env`, `node_modules`, `dist`, `.DS_Store`
- Check `.gitignore` exists and covers these before first commit
- If unsure about a destructive git operation (rebase, reset), ask the user first
