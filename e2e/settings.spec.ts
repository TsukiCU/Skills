import { test, expect, type Page } from "@playwright/test"

async function gotoSettings(page: Page) {
  await page.goto("/settings")
  await expect(page.getByTestId("settings-tab-profile")).toBeVisible({ timeout: 8000 })
}

test.describe("Settings page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoSettings(page)
  })

  // -------------------------------------------------------------------------
  // Tab navigation
  // -------------------------------------------------------------------------

  test("should display all 4 tabs", async ({ page }) => {
    for (const tab of ["profile", "appearance", "notifications", "integrations"]) {
      await expect(page.getByTestId(`settings-tab-${tab}`)).toBeVisible()
    }
  })

  test("should switch to Appearance tab", async ({ page }) => {
    await page.getByTestId("settings-tab-appearance").click()
    await expect(page.getByTestId("settings-tab-appearance")).toHaveAttribute("aria-current", "page")
    // Theme buttons should be visible
    await expect(page.getByTestId("settings-theme-light")).toBeVisible()
    await expect(page.getByTestId("settings-theme-dark")).toBeVisible()
    await expect(page.getByTestId("settings-theme-system")).toBeVisible()
  })

  test("should switch to Notifications tab", async ({ page }) => {
    await page.getByTestId("settings-tab-notifications").click()
    await expect(page.getByTestId("settings-tab-notifications")).toHaveAttribute("aria-current", "page")
    await expect(page.getByTestId("toggle-n-email-assigned")).toBeVisible()
  })

  test("should switch to Integrations tab", async ({ page }) => {
    await page.getByTestId("settings-tab-integrations").click()
    await expect(page.getByTestId("settings-tab-integrations")).toHaveAttribute("aria-current", "page")
    // GitHub integration button visible
    await expect(page.getByRole("button", { name: /disconnect github/i })).toBeVisible({ timeout: 5000 })
  })

  // -------------------------------------------------------------------------
  // Profile save flow
  // -------------------------------------------------------------------------

  test("should show unsaved changes bar when name is edited", async ({ page }) => {
    const nameInput = page.getByTestId("settings-name-input")
    await nameInput.fill("Updated Name")
    await expect(page.getByTestId("settings-unsaved-bar")).toBeVisible({ timeout: 3000 })
  })

  test("should save profile and show saved feedback", async ({ page }) => {
    // Change to a different value to make form dirty
    await page.getByTestId("settings-name-input").fill("Alice Chen (Updated)")
    await expect(page.getByTestId("settings-unsaved-bar")).toBeVisible({ timeout: 3000 })

    const saveResp = page.waitForResponse(
      (r) => r.url().includes("/api/settings") && r.request().method() === "PATCH",
      { timeout: 8000 }
    )
    await page.getByTestId("settings-save-btn").click()
    await saveResp

    await expect(page.getByTestId("settings-saved-feedback")).toBeVisible({ timeout: 5000 })
    // Unsaved bar should disappear after feedback
    await expect(page.getByTestId("settings-unsaved-bar")).not.toBeVisible({ timeout: 5000 })
  })

  test("should discard changes", async ({ page }) => {
    const nameInput = page.getByTestId("settings-name-input")
    const originalValue = await nameInput.inputValue()

    await nameInput.fill("Temporary Name")
    await expect(page.getByTestId("settings-unsaved-bar")).toBeVisible({ timeout: 3000 })

    await page.getByTestId("settings-discard-btn").click()
    await expect(page.getByTestId("settings-unsaved-bar")).not.toBeVisible({ timeout: 3000 })

    // Value should revert to original
    await expect(nameInput).toHaveValue(originalValue)
  })

  // -------------------------------------------------------------------------
  // Notifications toggle
  // -------------------------------------------------------------------------

  test("should toggle a notification switch and save", async ({ page }) => {
    await page.getByTestId("settings-tab-notifications").click()

    const toggle = page.getByTestId("toggle-n-email-assigned")
    const initialState = await toggle.getAttribute("aria-checked")

    // Toggle it
    await toggle.click()
    const newState = await toggle.getAttribute("aria-checked")
    expect(newState).not.toBe(initialState)

    // Unsaved bar should appear
    await expect(page.getByTestId("settings-unsaved-bar")).toBeVisible({ timeout: 3000 })

    // Save
    const saveResp = page.waitForResponse(
      (r) => r.url().includes("/api/settings") && r.request().method() === "PATCH",
      { timeout: 8000 }
    )
    await page.getByTestId("settings-save-btn").click()
    await saveResp
    await expect(page.getByTestId("settings-saved-feedback")).toBeVisible({ timeout: 5000 })
  })

  test("should persist notification toggle after page reload", async ({ page }) => {
    await page.getByTestId("settings-tab-notifications").click()

    const toggle = page.getByTestId("toggle-n-email-assigned")
    const initialState = await toggle.getAttribute("aria-checked")

    // Toggle and save
    await toggle.click()
    const saveResp = page.waitForResponse(
      (r) => r.url().includes("/api/settings") && r.request().method() === "PATCH",
      { timeout: 8000 }
    )
    await page.getByTestId("settings-save-btn").click()
    await saveResp

    // Reload and navigate back to notifications tab
    await page.reload()
    await expect(page.getByTestId("settings-tab-notifications")).toBeVisible({ timeout: 8000 })
    await page.getByTestId("settings-tab-notifications").click()

    const reloadedState = await page.getByTestId("toggle-n-email-assigned").getAttribute("aria-checked")
    expect(reloadedState).not.toBe(initialState)

    // Restore original state
    await page.getByTestId("toggle-n-email-assigned").click()
    const restoreResp = page.waitForResponse(
      (r) => r.url().includes("/api/settings") && r.request().method() === "PATCH",
      { timeout: 8000 }
    )
    await page.getByTestId("settings-save-btn").click()
    await restoreResp
  })

  // -------------------------------------------------------------------------
  // Theme in Appearance
  // -------------------------------------------------------------------------

  test("should change theme via Appearance tab", async ({ page }) => {
    await page.getByTestId("settings-tab-appearance").click()

    // Switch to dark
    await page.getByTestId("settings-theme-dark").click()
    await expect(page.locator("html")).toHaveClass(/dark/, { timeout: 3000 })

    // Switch back to light
    await page.getByTestId("settings-theme-light").click()
    await expect(page.locator("html")).not.toHaveClass(/dark/)
  })
})
