---
name: e2e-testing
description: "Write, run, and debug Playwright end-to-end tests. Use this skill when the user asks to add tests, write test cases, verify a feature works, automate browser testing, check for regressions, or debug a failing test. Trigger keywords: 'test', 'e2e', 'playwright', 'automate', 'verify', 'regression', 'test case', 'does this work', 'run tests', 'CI'. Use this skill for any testing work beyond simple type-check or lint."
---

# E2E Testing Skill

Write and maintain Playwright end-to-end tests for the TaskFlow application.

## Structure
```
e2e/
├── fixtures/
│   └── test-helpers.ts   — shared page object helpers (login, createTask, etc.)
├── kanban.spec.ts        — Kanban board CRUD tests
├── navigation.spec.ts    — sidebar navigation, routing
├── analytics.spec.ts     — analytics page rendering
├── settings.spec.ts      — settings form interactions
└── playwright.config.ts  — (project root)
```

## Conventions
- Use Page Object pattern: reusable helpers in fixtures/ for common actions
- Test isolation: each test should start from a known state — seed DB before suite or reset between tests
- Descriptive test names: `test('should create a new task and display it in the correct column')`
- Use data-testid attributes for selectors — avoid fragile CSS/text selectors when possible
- Group related tests in `test.describe()` blocks
- Assertions: prefer `expect(locator).toBeVisible()` over `waitForSelector`
- Screenshots on failure: enabled in config

## Test Writing Rules
- Before writing tests, check if the target elements have data-testid. If not, add them to the source components first.
- Each test should be independent — no test should depend on another test's side effects
- Use `test.beforeEach` for common setup (navigate to page, wait for load)
- For API-dependent tests: wait for network idle or specific API responses with `page.waitForResponse`
- Keep tests focused: one logical assertion per test, or a tight sequence for a single user flow

## Running Tests
```bash
npx playwright test                    # run all
npx playwright test kanban.spec.ts     # run one file
npx playwright test --headed           # watch in browser
npx playwright test --ui               # interactive UI mode
npx playwright show-report             # view HTML report after run
```

## Debugging Failures
1. Run with `--headed` to see what's happening
2. Add `await page.pause()` to stop at a point and use Inspector
3. Check if element needs data-testid added
4. Check if page needs time to load — add appropriate waitFor
5. Screenshot comparison: use `expect(page).toHaveScreenshot()` for visual regression
```