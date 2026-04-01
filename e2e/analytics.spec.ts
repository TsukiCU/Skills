import { test, expect, type Page } from "@playwright/test"

async function gotoAnalytics(page: Page) {
  await page.goto("/analytics")
  await expect(page.getByTestId("stat-card-total-tasks")).toBeVisible({ timeout: 10000 })
}

test.describe("Analytics page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAnalytics(page)
  })

  // -------------------------------------------------------------------------
  // Stat cards
  // -------------------------------------------------------------------------

  test("should display all 4 stat cards with numeric values", async ({ page }) => {
    const cards = [
      "stat-card-total-tasks",
      "stat-card-completed",
      "stat-card-overdue",
      "stat-card-avg-completion",
    ]
    for (const testId of cards) {
      await expect(page.getByTestId(testId)).toBeVisible()
    }

    // Total tasks should show a positive integer
    const totalText = await page.getByTestId("stat-card-total-tasks").locator("p.text-3xl").textContent()
    expect(Number(totalText?.trim())).toBeGreaterThan(0)
  })

  test("should show total tasks count that matches seed data (18 tasks)", async ({ page }) => {
    const totalText = await page.getByTestId("stat-card-total-tasks").locator("p.text-3xl").textContent()
    expect(Number(totalText?.trim())).toBe(18)
  })

  test("should show completed count matching seed data (3 done tasks)", async ({ page }) => {
    const completedText = await page.getByTestId("stat-card-completed").locator("p.text-3xl").textContent()
    expect(Number(completedText?.trim())).toBe(3)
  })

  // -------------------------------------------------------------------------
  // Chart cards
  // -------------------------------------------------------------------------

  test("should display all 4 chart cards", async ({ page }) => {
    const charts = [
      "chart-card-status-distribution",
      "chart-card-weekly-completion-trend",
      "chart-card-priority-breakdown",
      "chart-card-team-workload",
    ]
    for (const testId of charts) {
      await expect(page.getByTestId(testId)).toBeVisible()
    }
  })

  test("should render SVG inside each chart card", async ({ page }) => {
    const chartIds = [
      "chart-card-status-distribution",
      "chart-card-weekly-completion-trend",
      "chart-card-priority-breakdown",
      "chart-card-team-workload",
    ]
    for (const testId of chartIds) {
      const svg = page.getByTestId(testId).locator("svg").first()
      await expect(svg).toBeVisible()
    }
  })

  // -------------------------------------------------------------------------
  // Weekly trend range selector
  // -------------------------------------------------------------------------

  test("should switch weekly trend range with 4W/8W/All buttons", async ({ page }) => {
    // Default is 8W (aria-pressed=true)
    await expect(page.getByTestId("trend-range-8w")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByTestId("trend-range-4w")).toHaveAttribute("aria-pressed", "false")

    // Click 4W
    await page.getByTestId("trend-range-4w").click()
    await expect(page.getByTestId("trend-range-4w")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByTestId("trend-range-8w")).toHaveAttribute("aria-pressed", "false")

    // Click All
    await page.getByTestId("trend-range-all").click()
    await expect(page.getByTestId("trend-range-all")).toHaveAttribute("aria-pressed", "true")
    await expect(page.getByTestId("trend-range-4w")).toHaveAttribute("aria-pressed", "false")
  })
})
