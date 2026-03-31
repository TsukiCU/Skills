import { test, expect, type Page } from "@playwright/test"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resetDB(page: Page) {
  await page.request.post("http://localhost:3001/api/seed-reset")
}

/** Navigate to kanban and wait for tasks to render */
async function gotoKanban(page: Page) {
  await page.goto("/")
  await expect(page.getByTestId("column-todo")).toBeVisible({ timeout: 10000 })
  // Wait for the todo column to show the seeded 4 task cards
  await expect(page.locator('[data-testid="column-todo"] [data-testid^="task-card-"]')).toHaveCount(
    4,
    { timeout: 10000 }
  )
}

/** Count task cards inside a named column */
function columnCards(page: Page, status: string) {
  return page.locator(`[data-testid="column-${status}"] [data-testid^="task-card-"]`)
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe("Kanban CRUD flows", () => {
  test.beforeEach(async ({ page }) => {
    await resetDB(page)
    await gotoKanban(page)
  })

  // -------------------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------------------

  test("should create a new task and display it in the correct column", async ({ page }) => {
    const taskTitle = "E2E Test Task"
    const initialCount = await columnCards(page, "todo").count()

    // Open dialog
    await page.getByTestId("new-task-btn").click()
    await expect(page.getByTestId("new-task-title")).toBeVisible({ timeout: 5000 })

    // Fill title
    await page.getByTestId("new-task-title").fill(taskTitle)

    // Select "High" priority
    await page.getByTestId("new-task-priority").click()
    await page.getByRole("option", { name: /^High$/i }).click()

    // Ensure status stays as "To Do" (default)
    // Submit and wait for POST response
    const createResponse = page.waitForResponse(
      (r) => r.url().includes("/api/tasks") && r.request().method() === "POST",
      { timeout: 8000 }
    )
    await page.getByTestId("new-task-submit").click()
    await createResponse

    // Dialog should close
    await expect(page.getByTestId("new-task-title")).not.toBeVisible({ timeout: 5000 })

    // New card should appear in todo column
    await expect(columnCards(page, "todo")).toHaveCount(initialCount + 1, { timeout: 5000 })

    // Verify task title is visible somewhere on the page
    await expect(page.getByText(taskTitle).first()).toBeVisible()
  })

  test("should show validation error when submitting with empty title", async ({ page }) => {
    await page.getByTestId("new-task-btn").click()
    await expect(page.getByTestId("new-task-title")).toBeVisible({ timeout: 5000 })

    // Submit without filling title
    await page.getByTestId("new-task-submit").click()

    // Error message should appear, dialog stays open
    await expect(page.getByText("Title is required")).toBeVisible()
    await expect(page.getByTestId("new-task-title")).toBeVisible()
  })

  // -------------------------------------------------------------------------
  // READ / SEARCH
  // -------------------------------------------------------------------------

  test("should display seeded tasks on load", async ({ page }) => {
    // Verify seed data counts per column
    await expect(columnCards(page, "backlog")).toHaveCount(4)
    await expect(columnCards(page, "todo")).toHaveCount(4)
    await expect(columnCards(page, "in-progress")).toHaveCount(4)
    await expect(columnCards(page, "review")).toHaveCount(3)
    await expect(columnCards(page, "done")).toHaveCount(3)
  })

  test("should filter tasks by search query and restore on clear", async ({ page }) => {
    const searchInput = page.getByTestId("search-input")

    // Search for a known unique task title
    await searchInput.fill("OAuth2")
    await page.waitForTimeout(300)

    // Only one task should match in backlog
    await expect(columnCards(page, "backlog")).toHaveCount(1)
    // Todo column should be empty
    await expect(columnCards(page, "todo")).toHaveCount(0)

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(300)

    // All todo tasks should return
    await expect(columnCards(page, "todo")).toHaveCount(4)
    await expect(columnCards(page, "backlog")).toHaveCount(4)
  })

  test("should filter tasks by priority button", async ({ page }) => {
    const allBefore = await page.locator('[data-testid^="task-card-"]').count()

    // Click "High" priority filter
    await page.getByTestId("priority-filter-high").click()
    await page.waitForTimeout(300)

    const filtered = await page.locator('[data-testid^="task-card-"]').count()
    // High priority tasks in seed: task-1,7,10,12,13 = 5
    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(allBefore)

    // Toggle off
    await page.getByTestId("priority-filter-high").click()
    await page.waitForTimeout(300)

    const restored = await page.locator('[data-testid^="task-card-"]').count()
    expect(restored).toBe(allBefore)
  })

  // -------------------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------------------

  test("should open detail drawer when clicking a task card", async ({ page }) => {
    const firstCard = columnCards(page, "backlog").first()
    await firstCard.click()
    await expect(page.getByTestId("drawer-task-title")).toBeVisible({ timeout: 5000 })
  })

  test("should update task priority via detail drawer", async ({ page }) => {
    // Open first card in in-progress column (task-9, priority=urgent)
    const firstCard = columnCards(page, "in-progress").first()
    await firstCard.click()
    await expect(page.getByTestId("drawer-task-title")).toBeVisible({ timeout: 5000 })

    // Change priority to "low" — just click the button, no waitForResponse (Vite proxy URL differs)
    await page.getByTestId("drawer-priority-low").click()
    // Wait a moment for the optimistic update to apply
    await page.waitForTimeout(500)

    // Close drawer using Escape key (avoids click interception issues)
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("drawer-task-title")).not.toBeVisible({ timeout: 3000 })

    // The first card in in-progress should now show "Low" badge
    await expect(firstCard.getByText("Low")).toBeVisible({ timeout: 5000 })
  })

  test("should update task status via detail drawer status chips", async ({ page }) => {
    // Get task title before we interact
    const firstTodoCard = columnCards(page, "todo").first()
    await firstTodoCard.click()
    await expect(page.getByTestId("drawer-task-title")).toBeVisible({ timeout: 5000 })
    const taskTitle = await page.getByTestId("drawer-task-title").inputValue()

    // Move to "in-progress"
    await page.getByTestId("drawer-status-in-progress").click()
    await page.waitForTimeout(500)

    // Close drawer using Escape key (avoids click interception by dialog overlay)
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("drawer-task-title")).not.toBeVisible({ timeout: 3000 })

    // Task should now be in in-progress column — search by title text
    const inProgressCol = page.getByTestId("column-in-progress")
    await expect(inProgressCol.getByText(taskTitle)).toBeVisible({ timeout: 5000 })

    // Todo column should have 3 cards now
    await expect(columnCards(page, "todo")).toHaveCount(3, { timeout: 5000 })
  })

  // -------------------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------------------

  test("should delete a task and decrease column count", async ({ page }) => {
    const initialCount = await columnCards(page, "todo").count()
    expect(initialCount).toBeGreaterThan(0)

    // Open first todo task
    await columnCards(page, "todo").first().click()
    await expect(page.getByTestId("drawer-task-title")).toBeVisible({ timeout: 5000 })

    // Click delete
    await page.getByTestId("drawer-delete-btn").click()
    await expect(page.getByTestId("confirm-delete-btn")).toBeVisible({ timeout: 3000 })

    // Confirm delete and wait for DELETE request
    const deleteResponse = page.waitForResponse(
      (r) => r.url().includes("/api/tasks") && r.request().method() === "DELETE",
      { timeout: 8000 }
    )
    await page.getByTestId("confirm-delete-btn").click()
    await deleteResponse

    // Drawer should close
    await expect(page.getByTestId("drawer-task-title")).not.toBeVisible({ timeout: 5000 })

    // One fewer task in todo
    await expect(columnCards(page, "todo")).toHaveCount(initialCount - 1, { timeout: 5000 })
  })

  test("should cancel delete and keep task", async ({ page }) => {
    const initialCount = await columnCards(page, "todo").count()

    await columnCards(page, "todo").first().click()
    await expect(page.getByTestId("drawer-task-title")).toBeVisible({ timeout: 5000 })

    await page.getByTestId("drawer-delete-btn").click()
    await expect(page.getByTestId("confirm-delete-btn")).toBeVisible({ timeout: 3000 })

    // Cancel (the last "Cancel" button belongs to the confirmation dialog)
    await page.getByRole("button", { name: "Cancel" }).last().click()
    // Wait for confirm dialog to close
    await expect(page.getByTestId("confirm-delete-btn")).not.toBeVisible({ timeout: 3000 })

    // Close drawer using Escape (avoids click interception from dialog overlay)
    await page.keyboard.press("Escape")
    await expect(page.getByTestId("drawer-task-title")).not.toBeVisible({ timeout: 3000 })

    // Count should be unchanged
    await expect(columnCards(page, "todo")).toHaveCount(initialCount)
  })
})
