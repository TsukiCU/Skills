import { type Page, expect } from "@playwright/test"

export async function waitForTasksLoaded(page: Page) {
  // Wait for the kanban columns to appear
  await expect(page.locator('[data-testid="column-todo"]')).toBeVisible({ timeout: 10000 })
  // Wait for at least one task card or an empty column
  await page.waitForTimeout(500)
}

export async function createTask(
  page: Page,
  opts: {
    title: string
    priority?: "low" | "medium" | "high" | "urgent"
    status?: "backlog" | "todo" | "in-progress" | "review" | "done"
  }
) {
  await page.getByTestId("new-task-btn").click()
  await expect(page.getByTestId("new-task-title")).toBeVisible()

  await page.getByTestId("new-task-title").fill(opts.title)

  if (opts.priority) {
    await page.getByTestId("new-task-priority").click()
    // Select option by text in the dropdown
    await page.getByRole("option", { name: new RegExp(opts.priority, "i") }).click()
  }

  if (opts.status) {
    await page.getByTestId("new-task-status").click()
    const statusLabels: Record<string, string> = {
      backlog: "Backlog",
      todo: "To Do",
      "in-progress": "In Progress",
      review: "Review",
      done: "Done",
    }
    await page.getByRole("option", { name: statusLabels[opts.status] }).click()
  }

  await page.getByTestId("new-task-submit").click()
  // Wait for dialog to close and API call to complete
  await expect(page.getByTestId("new-task-title")).not.toBeVisible({ timeout: 5000 })
  await page.waitForResponse((res) => res.url().includes("/api/tasks") && res.request().method() === "POST")
}

export async function openTaskByTitle(page: Page, title: string) {
  await page.getByRole("button", { name: `Open task: ${title}` }).click()
  await expect(page.getByTestId("drawer-task-title")).toBeVisible({ timeout: 5000 })
}

export async function seedReset(page: Page) {
  // Call server seed endpoint to reset DB to known state
  await page.request.post("http://localhost:3001/api/seed-reset").catch(() => {
    // Endpoint may not exist; tests must handle this gracefully
  })
}
