# TaskFlow — E2E Testing Guide

## Overview

TaskFlow uses [Playwright](https://playwright.dev) for end-to-end testing. Tests run against a real browser (Chromium) with the full frontend + backend stack running, making them high-fidelity integration tests that exercise actual HTTP calls, DB mutations, and UI rendering.

**Current coverage:** 33 tests across 4 spec files — Kanban CRUD, navigation, analytics, and settings.

---

## Architecture

```
Browser (Chromium)
      │
      │  HTTP requests
      ▼
Vite Dev Server :5173          ←── serves React/TypeScript SPA
      │  /api/* proxy
      ▼
Hono Node Server :3001         ←── REST API
      │
      ▼
SQLite (taskflow.db)           ←── persistent task/member/settings storage
      │
      ▼  POST /api/seed-reset
      └── Resets DB to known seed state before each Kanban test
```

Playwright's `webServer` config (in `playwright.config.ts`) starts both servers automatically before the test run and reuses them if already running (`reuseExistingServer: !process.env.CI`).

---

## How to Run Tests

```bash
# Run all tests headlessly (CI-style)
npm run test:e2e

# Open Playwright UI mode (interactive, great for debugging)
npm run test:e2e:ui

# Run a single spec file
npx playwright test e2e/kanban.spec.ts

# Run with browser visible
npx playwright test --headed

# View the HTML report from the last run
npx playwright show-report
```

---

## Test Case Inventory

### e2e/kanban.spec.ts — Kanban CRUD Flows (10 tests)

| # | Test | Category | Validates |
|---|------|----------|-----------|
| 1 | should create a new task and display it in the correct column | Create | POST /api/tasks, card appears in todo column |
| 2 | should show validation error when submitting with empty title | Create | Empty title shows inline error, dialog stays open |
| 3 | should display seeded tasks on load | Read | 4/4/4/3/3 tasks per column after seed |
| 4 | should filter tasks by search query and restore on clear | Read | Search narrows board, clearing restores full view |
| 5 | should filter tasks by priority button | Read | Priority filter reduces visible cards |
| 6 | should open detail drawer when clicking a task card | Read | Drawer opens with title input visible |
| 7 | should update task priority via detail drawer | Update | PATCH /api/tasks/:id, priority badge updates on card |
| 8 | should update task status via detail drawer status chips | Update | PATCH /api/tasks/:id, card moves to new column |
| 9 | should delete a task and decrease column count | Delete | DELETE /api/tasks/:id, column count decrements |
| 10 | should cancel delete and keep task | Delete | Cancel dialog leaves task count unchanged |

### e2e/navigation.spec.ts — Navigation & Theme (7 tests)

| # | Test | Category | Validates |
|---|------|----------|-----------|
| 1 | should load Kanban page at root URL | Navigation | `/` or `/kanban` loads Kanban board |
| 2 | should navigate to Analytics page via sidebar | Navigation | `/analytics` URL, stat cards visible |
| 3 | should navigate to Settings page via sidebar | Navigation | `/settings` URL, tab nav visible |
| 4 | should navigate back to Kanban from Analytics | Navigation | `/kanban` after clicking Kanban nav item |
| 5 | should collapse and expand sidebar | Sidebar | Toggle button flips `aria-label` |
| 6 | should toggle theme to dark via header | Theme | `<html>` gains `dark` class |
| 7 | should toggle theme back to light via header | Theme | `<html>` loses `dark` class |

### e2e/analytics.spec.ts — Analytics Page (6 tests)

| # | Test | Category | Validates |
|---|------|----------|-----------|
| 1 | should display all 4 stat cards with numeric values | Render | All stat cards visible with numeric content |
| 2 | should show total tasks count that matches seed data | Data | Total = 18 (matches seed) |
| 3 | should show completed count matching seed data | Data | Completed = 3 (3 done tasks in seed) |
| 4 | should display all 4 chart cards | Render | All chart card containers visible |
| 5 | should render SVG inside each chart card | Render | Recharts SVG elements present and visible |
| 6 | should switch weekly trend range with 4W/8W/All buttons | Interaction | `aria-pressed` state updates on range buttons |

### e2e/settings.spec.ts — Settings Page (10 tests)

| # | Test | Category | Validates |
|---|------|----------|-----------|
| 1 | should display all 4 tabs | Render | Profile/Appearance/Notifications/Integrations tabs visible |
| 2 | should switch to Appearance tab | Navigation | `aria-current=page` on active tab, theme buttons visible |
| 3 | should switch to Notifications tab | Navigation | Toggle switches visible |
| 4 | should switch to Integrations tab | Navigation | GitHub Disconnect button visible |
| 5 | should show unsaved changes bar when name is edited | Dirty state | Bar appears after input change |
| 6 | should save profile and show saved feedback | Save flow | PATCH /api/settings, "Changes saved" feedback |
| 7 | should discard changes | Discard flow | Value reverts, unsaved bar disappears |
| 8 | should toggle a notification switch and save | Notifications | Toggle state changes, PATCH succeeds |
| 9 | should persist notification toggle after page reload | Persistence | Toggle state survives page reload |
| 10 | should change theme via Appearance tab | Theme | Dark class toggled via settings theme buttons |

---

## How to Add New Tests

### Step 1 — Identify the page and elements

Before writing a test, check if the target elements have `data-testid` attributes. Search the source:

```bash
grep -r "data-testid" src/
```

If an element is missing a `data-testid`, add one to the source component first.

### Step 2 — Create or append to a spec file

Place tests in the appropriate file:
- `e2e/kanban.spec.ts` — Kanban board interactions
- `e2e/navigation.spec.ts` — Routing and layout
- `e2e/analytics.spec.ts` — Analytics page
- `e2e/settings.spec.ts` — Settings page

### Step 3 — Write the test

Follow this pattern:

```typescript
test("should do something specific", async ({ page }) => {
  // 1. Navigate to the right page (use a helper or page.goto directly)
  await page.goto("/")
  await expect(page.getByTestId("column-todo")).toBeVisible({ timeout: 10000 })

  // 2. Interact
  await page.getByTestId("new-task-btn").click()
  await page.getByTestId("new-task-title").fill("My Task")

  // 3. Wait for async side-effects if needed
  const resp = page.waitForResponse(
    (r) => r.url().includes("/api/tasks") && r.request().method() === "POST"
  )
  await page.getByTestId("new-task-submit").click()
  await resp

  // 4. Assert the outcome
  await expect(page.getByText("My Task")).toBeVisible()
})
```

### Step 4 — Run just your new test

```bash
npx playwright test e2e/your-spec.ts --headed
```

Use `--headed` to watch the browser as the test runs.

---

## How Test Isolation Works

Kanban tests call `POST /api/seed-reset` in `beforeEach`, which synchronously resets the SQLite database to its exact seed state (18 tasks, 4 members, default settings). This ensures each test starts from a known, consistent state regardless of what previous tests did.

```typescript
async function resetDB(page: Page) {
  await page.request.post("http://localhost:3001/api/seed-reset")
}

test.beforeEach(async ({ page }) => {
  await resetDB(page)
  await gotoKanban(page)
})
```

Navigation, analytics, and settings tests do not reset the DB — they read state from the running server, which is stable for read-only operations or tests that restore their own changes.

---

## Selector Strategy

**Always use `data-testid` selectors.** Avoid fragile CSS class selectors or text-based selectors where possible.

```typescript
// Good — stable, intent-revealing
page.getByTestId("new-task-btn")
page.locator('[data-testid="column-todo"] [data-testid^="task-card-"]')

// Avoid — brittle CSS selectors
page.locator(".kanban-column:first-child .task-card")

// Acceptable for non-data-testid elements
page.getByRole("option", { name: /^High$/i })   // shadcn Select options
page.getByRole("button", { name: /disconnect github/i })
```

**Column-scoped card counts** use CSS descendant selectors:

```typescript
function columnCards(page: Page, status: string) {
  return page.locator(`[data-testid="column-${status}"] [data-testid^="task-card-"]`)
}
```

This is necessary because `@dnd-kit`'s `useSortable` spreads `role="button"` onto wrapper divs, making `getByRole("button")` return extra elements.

---

## Troubleshooting Common Failures

### "column-todo not found" / wrong task counts
**Cause:** DB state is stale from a previous test run that mutated tasks.
**Fix:** Ensure `resetDB()` is called in `beforeEach`. Restart the Hono server if it was running before the seed-reset endpoint was added.

### "element is intercepted" when clicking Close Drawer button
**Cause:** A Dialog overlay (e.g., delete confirmation) is on top of the Sheet's close button.
**Fix:** Use `page.keyboard.press("Escape")` to dismiss the drawer instead of clicking the close button.

```typescript
await page.keyboard.press("Escape")
await expect(page.getByTestId("drawer-task-title")).not.toBeVisible({ timeout: 3000 })
```

### "unsaved bar not visible" in settings tests
**Cause:** Filling the name field with the same value it already has won't trigger dirty state.
**Fix:** Use a distinct value that differs from the seeded default (`"Alice Chen"`).

### Server not found / ECONNREFUSED
**Cause:** Hono server process has crashed or wasn't started.
**Fix:** `npm run server` to start it, or let Playwright start it via `webServer` config.

### Test passes locally but fails in CI
**Cause:** `reuseExistingServer: !process.env.CI` — in CI, Playwright always starts fresh servers.
**Fix:** Ensure `npm run server:seed` has been run to initialize the DB before tests run in CI, or seed in a `globalSetup` script.

---

## Current Coverage Summary

| Area | Covered | Not Covered |
|------|---------|-------------|
| Kanban — Create | New task dialog, validation | Tag/assignee/description fields |
| Kanban — Read | Column counts, search, priority filter | Assignee filter, combined filters |
| Kanban — Update | Priority change, status change via drawer | Inline editing, tag editing |
| Kanban — Delete | Confirm delete, cancel delete | Bulk delete |
| Drag & Drop | — | Not covered (complex pointer events) |
| Navigation | All 3 routes, sidebar collapse | Command palette (⌘K) |
| Theme | Light/dark toggle via header and settings | System theme (OS-dependent) |
| Analytics | All stat cards, all chart cards, trend range | Tooltip content, empty state |
| Settings | All 4 tabs, profile save, notification toggle, persist | Accent color, font density, integrations connect/disconnect |
