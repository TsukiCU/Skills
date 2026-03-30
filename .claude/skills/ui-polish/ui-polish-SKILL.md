---
name: ui-polish
description: "Diagnose and fix UI quality issues in existing pages and components. Use this skill when the user reports visual bugs, spacing inconsistencies, theme problems, animation glitches, layout hierarchy issues, or wants to refine existing UI without rebuilding it. Also use when adding a small element (button, badge, link) to an existing page without breaking its structure. Trigger keywords: 'fix the spacing', 'dark mode broken', 'alignment off', 'looks weird', 'polish', 'refine', 'too much padding', 'hierarchy is wrong', 'make it look better', 'this modal feels off', 'add a button here without breaking layout', 'responsive is broken'. Use this skill anytime the user is unhappy with how existing UI looks or feels."
---

# UI Polish Skill

Diagnose and surgically fix UI issues in existing components without unnecessary rewrites.

## Diagnostic Process

### 1. Identify the Problem Category
Before changing code, classify the issue:

| Category | Symptoms | Common Fixes |
|---|---|---|
| **Spacing** | Uneven gaps, cramped/loose areas | Audit `p-`, `m-`, `gap-` values; align to 4px grid |
| **Hierarchy** | Everything same size/weight, unclear focus | Adjust font sizes, weights, colors, spacing between sections |
| **Theme** | Colors wrong in dark/light mode | Check CSS variables, hardcoded colors, opacity values |
| **Layout** | Overflow, misalignment, broken responsive | Check flex/grid properties, min/max widths, breakpoints |
| **Motion** | Janky animation, no transitions | Add/fix `transition-*`, Framer Motion props, `will-change` |
| **Interaction** | Hover/focus states missing, click targets small | Add hover/focus styles, increase touch targets to 44px+ |
| **Density** | Too crowded or too sparse | Adjust padding, consolidate elements, add whitespace |

### 2. Audit Before Fixing
Read the entire file(s) involved before making changes. Look for:
- Hardcoded colors (should be CSS variables)
- Inconsistent spacing values (e.g., mixing `p-3` and `p-4` at same level)
- Missing dark mode classes (`dark:` variants)
- Broken responsive breakpoints
- z-index conflicts
- Missing transition/animation on interactive elements

### 3. Fix Rules

**Minimal diff principle**: Change only what's needed. If the user says "fix spacing on the header", don't refactor the entire page.

**Spacing fixes**:
- Same-level siblings: use consistent `gap-*`
- Parent-child: padding on parent, not margin on children
- Section separation: use `space-y-*` or explicit `mt-*` on sections
- Card internal: `p-4` (compact) or `p-6` (spacious), pick one per card type

**Hierarchy fixes**:
- Page title: `text-2xl font-semibold` or `text-3xl font-bold`
- Section title: `text-lg font-medium`
- Body: `text-sm text-muted-foreground`
- Caption/meta: `text-xs text-muted-foreground`
- Use color weight to separate: primary text vs muted-foreground vs border

**Theme fixes**:
- Replace any hardcoded hex/rgb with CSS variable references
- Test both modes: ensure `bg-background`, `text-foreground` propagate
- Borders: use `border-border` not hardcoded gray
- Hover states: use `hover:bg-accent` or `hover:bg-muted`

**Adding elements without breaking layout**:
- Read the parent container's layout model (flex? grid? what gap?)
- Match existing element patterns (same padding, radius, font size)
- If adding to a flex row, check if `flex-wrap` is needed
- If adding to a grid, check if column count needs adjustment

### 4. Verify After Fixing
- Run `npm run type-check`
- Describe exactly what changed and why
- If theme-related: confirm fix works in BOTH light and dark mode
- If responsive: confirm fix works at mobile (375px), tablet (768px), desktop (1280px)

### 5. Common Anti-patterns to Fix on Sight
Even if the user didn't mention them, fix these when encountered:
- `onClick` on a `<div>` without `role="button"` and `tabIndex={0}`
- Missing `key` prop in lists
- Text truncation without `title` attribute or tooltip
- Buttons without visible focus ring (`focus-visible:ring-2`)
- Images without `alt` text
- Color contrast below 4.5:1 for normal text
