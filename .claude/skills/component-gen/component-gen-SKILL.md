---
name: component-gen
description: "Generate reusable atomic or composite UI components following the project's design system. Use this skill when the user asks for a specific component that doesn't exist yet — such as a tag selector, status badge, avatar group, stat card, empty state, date picker wrapper, or any self-contained UI element. Also use when the user says 'I need a component for X' or 'make a reusable X'. Trigger keywords: 'component', 'reusable', 'make a card', 'create a badge', 'need a picker', 'build a widget'. Do NOT use for full pages — use ui-implement instead."
---

# Component Gen Skill

Generate self-contained, reusable components that integrate with shadcn/ui and the project's design system.

## Decision: shadcn vs Custom

1. **Does shadcn/ui already have it?** → Use it directly. Run `npx shadcn@latest add <name>`.
2. **Is it a styled wrapper around shadcn?** → Build on top of the shadcn primitive.
3. **Is it fully custom?** → Build from scratch using Tailwind + design tokens.

Check shadcn catalog first: Button, Input, Select, Dialog, Sheet, Dropdown, Popover, Tooltip, Tabs, Card, Badge, Avatar, Calendar, Command, Table, Separator, Switch, Checkbox, Radio, Slider, Textarea, Label, Alert, Toast.

## Component Template

```tsx
import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  status: "todo" | "in-progress" | "done"
  size?: "sm" | "md"
  className?: string
}

const statusConfig = {
  todo: { label: "To Do", class: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  "in-progress": { label: "In Progress", class: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  done: { label: "Done", class: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
} as const

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        config.class,
        className
      )}
    >
      {config.label}
    </span>
  )
}
```

## Rules

- File location: `src/components/common/ComponentName.tsx`
- Named export only
- Accept `className?: string` prop, merge with `cn()`
- All color values via Tailwind theme or CSS variables — no hardcoded hex
- Include dark mode variants for every custom color
- Support size variants if the component could reasonably appear at different sizes
- Add JSDoc comment above component explaining usage
- Props type defined as `type XxxProps` directly above the component
- Config objects (like status maps) as `const` above the component, not inline

## After Creating
- Add export to barrel file if one exists
- Mention which pages/components could use this
- Run type-check
