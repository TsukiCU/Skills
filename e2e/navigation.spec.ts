import { test, expect, type Page } from "@playwright/test"

async function gotoApp(page: Page) {
  await page.goto("/")
  await expect(page.getByTestId("column-todo")).toBeVisible({ timeout: 10000 })
}

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page)
  })

  test("should load Kanban page at root URL", async ({ page }) => {
    // React Router may redirect to /kanban — accept either "/" or "/kanban"
    await expect(page).toHaveURL(/\/(kanban)?$/)
    await expect(page.getByTestId("column-todo")).toBeVisible()
  })

  test("should navigate to Analytics page via sidebar", async ({ page }) => {
    await page.getByTestId("nav-analytics").click()
    await expect(page).toHaveURL("/analytics")
    await expect(page.getByTestId("stat-card-total-tasks")).toBeVisible({ timeout: 8000 })
  })

  test("should navigate to Settings page via sidebar", async ({ page }) => {
    await page.getByTestId("nav-settings").click()
    await expect(page).toHaveURL("/settings")
    await expect(page.getByTestId("settings-tab-profile")).toBeVisible({ timeout: 5000 })
  })

  test("should navigate back to Kanban from Analytics", async ({ page }) => {
    await page.getByTestId("nav-analytics").click()
    await expect(page).toHaveURL("/analytics")
    await page.getByTestId("nav-kanban").click()
    await expect(page).toHaveURL(/\/(kanban)?$/)
    await expect(page.getByTestId("column-todo")).toBeVisible({ timeout: 8000 })
  })

  test("should collapse and expand sidebar", async ({ page }) => {
    const toggle = page.getByTestId("sidebar-toggle")

    // Collapse
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-label", "Expand sidebar")

    // Expand
    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-label", "Collapse sidebar")
  })

  test("should toggle theme to dark via header", async ({ page }) => {
    // Ensure we start in light mode
    await page.getByTestId("theme-toggle").click()
    await page.getByTestId("theme-option-light").click()
    await expect(page.locator("html")).not.toHaveClass(/dark/)

    // Switch to dark
    await page.getByTestId("theme-toggle").click()
    await page.getByTestId("theme-option-dark").click()
    await expect(page.locator("html")).toHaveClass(/dark/)
  })

  test("should toggle theme back to light via header", async ({ page }) => {
    // First go dark
    await page.getByTestId("theme-toggle").click()
    await page.getByTestId("theme-option-dark").click()
    await expect(page.locator("html")).toHaveClass(/dark/)

    // Then back to light
    await page.getByTestId("theme-toggle").click()
    await page.getByTestId("theme-option-light").click()
    await expect(page.locator("html")).not.toHaveClass(/dark/)
  })
})
