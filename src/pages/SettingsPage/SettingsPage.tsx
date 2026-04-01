import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  Palette,
  Bell,
  Plug,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Link,
  Unlink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/themeStore"
import { useSettingsStore, type NotificationSettings, type IntegrationId } from "@/stores/settingsStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "profile" | "appearance" | "notifications" | "integrations"

type SettingsDraft = {
  name: string
  email: string
  bio: string
  accentColor: string
  fontSize: "sm" | "md" | "lg"
  notifications: NotificationSettings
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "integrations", label: "Integrations", icon: Plug },
]

const ACCENT_COLORS = [
  { label: "Teal", value: "#14b8a6" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Sky", value: "#38bdf8" },
  { label: "Emerald", value: "#10b981" },
  { label: "Orange", value: "#f97316" },
  { label: "Indigo", value: "#6366f1" },
]

type IntegrationMeta = {
  name: string
  description: string
  iconLabel: string
  iconBg: string
}

const INTEGRATION_META: Record<IntegrationId, IntegrationMeta> = {
  github: {
    name: "GitHub",
    description: "Sync tasks with GitHub issues and pull requests.",
    iconLabel: "GH",
    iconBg: "bg-neutral-900",
  },
  slack: {
    name: "Slack",
    description: "Get task notifications delivered to your Slack channels.",
    iconLabel: "SL",
    iconBg: "bg-[#4A154B]",
  },
  notion: {
    name: "Notion",
    description: "Mirror your tasks as Notion database entries.",
    iconLabel: "N",
    iconBg: "bg-neutral-800",
  },
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ─── Sub-components ───────────────────────────────────────────────────────────

type ToggleProps = {
  checked: boolean
  onChange: (v: boolean) => void
  id?: string
  "aria-label"?: string
}

function Toggle({ checked, onChange, id, "aria-label": ariaLabel }: ToggleProps) {
  return (
    <button
      id={id}
      data-testid={id ? `toggle-${id}` : undefined}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

type SectionLabelProps = {
  htmlFor?: string
  children: React.ReactNode
}

function FieldLabel({ htmlFor, children }: SectionLabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
      {children}
    </label>
  )
}

type FieldGroupProps = {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: React.ReactNode
}

function FieldGroup({ label, htmlFor, hint, error, children }: FieldGroupProps) {
  return (
    <div className="space-y-1.5">
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

type NotifRowProps = {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  id: string
}

function NotifRow({ label, description, checked, onChange, id }: NotifRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} aria-label={label} />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const settings = useSettingsStore()
  const { theme, setTheme } = useThemeStore()

  // ── Draft state (local copy of all saveable settings) ──
  const [draft, setDraft] = useState<SettingsDraft>({
    name: settings.name,
    email: settings.email,
    bio: settings.bio,
    accentColor: settings.accentColor,
    fontSize: settings.fontSize,
    notifications: { ...settings.notifications },
  })

  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [emailError, setEmailError] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)

  // Fetch settings from API on mount and sync draft
  useEffect(() => {
    settings.fetchSettings().then(() => {
      const s = useSettingsStore.getState()
      setDraft({
        name: s.name,
        email: s.email,
        bio: s.bio,
        accentColor: s.accentColor,
        fontSize: s.fontSize,
        notifications: { ...s.notifications },
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Dirty check ──
  const isDirty =
    draft.name !== settings.name ||
    draft.email !== settings.email ||
    draft.bio !== settings.bio ||
    draft.accentColor !== settings.accentColor ||
    draft.fontSize !== settings.fontSize ||
    JSON.stringify(draft.notifications) !== JSON.stringify(settings.notifications)

  // Clear saved feedback after 2s
  useEffect(() => {
    if (savedFeedback) {
      const t = setTimeout(() => setSavedFeedback(false), 2000)
      return () => clearTimeout(t)
    }
  }, [savedFeedback])

  // ── Helpers ──
  function patchDraft(patch: Partial<SettingsDraft>) {
    setDraft((d) => ({ ...d, ...patch }))
    setEmailError("")
  }

  function patchNotif(key: keyof NotificationSettings, value: boolean) {
    setDraft((d) => ({ ...d, notifications: { ...d.notifications, [key]: value } }))
  }

  async function handleSave() {
    if (!EMAIL_REGEX.test(draft.email)) {
      setEmailError("Enter a valid email address")
      setActiveTab("profile")
      return
    }
    setSaving(true)
    await Promise.all([
      settings.saveProfile({ name: draft.name, email: draft.email, bio: draft.bio }),
      settings.saveAppearance({ accentColor: draft.accentColor, fontSize: draft.fontSize }),
      settings.saveNotifications(draft.notifications),
    ])
    setSaving(false)
    setSavedFeedback(true)
  }

  function handleDiscard() {
    setDraft({
      name: settings.name,
      email: settings.email,
      bio: settings.bio,
      accentColor: settings.accentColor,
      fontSize: settings.fontSize,
      notifications: { ...settings.notifications },
    })
    setEmailError("")
  }

  // ─── Section renderers ─────────────────────────────────────────────────────

  function renderProfile() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage your personal information and account details.
          </p>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary text-xl font-bold shrink-0">
            {draft.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{draft.name || "Your Name"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Avatar is generated from your initials
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Full Name" htmlFor="s-name">
            <Input
              id="s-name"
              data-testid="settings-name-input"
              value={draft.name}
              onChange={(e) => patchDraft({ name: e.target.value })}
              placeholder="Your full name"
            />
          </FieldGroup>

          <FieldGroup
            label="Email"
            htmlFor="s-email"
            error={emailError}
            hint="Used for notifications and account recovery."
          >
            <Input
              id="s-email"
              type="email"
              value={draft.email}
              onChange={(e) => { patchDraft({ email: e.target.value }); setEmailError("") }}
              placeholder="you@example.com"
              aria-invalid={!!emailError}
              className={emailError ? "border-destructive" : ""}
            />
          </FieldGroup>
        </div>

        <FieldGroup label="Bio" htmlFor="s-bio" hint="A short description shown on your profile.">
          <Textarea
            id="s-bio"
            value={draft.bio}
            onChange={(e) => patchDraft({ bio: e.target.value })}
            placeholder="Tell your team a bit about yourself…"
            rows={3}
            className="resize-none"
          />
        </FieldGroup>
      </div>
    )
  }

  function renderAppearance() {
    const fontSizeOptions: { value: "sm" | "md" | "lg"; label: string; desc: string }[] = [
      { value: "sm", label: "Small", desc: "13px" },
      { value: "md", label: "Medium", desc: "14px" },
      { value: "lg", label: "Large", desc: "16px" },
    ]

    const themeOptions: { value: "light" | "dark" | "system"; label: string }[] = [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "System" },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Appearance</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Customize how TaskFlow looks on your device.
          </p>
        </div>

        {/* Theme */}
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-foreground">Theme</p>
          <div className="flex gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                data-testid={`settings-theme-${opt.value}`}
                onClick={() => setTheme(opt.value)}
                aria-label={`Switch to ${opt.label} theme`}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  theme === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            System follows your OS preference automatically.
          </p>
        </div>

        {/* Accent color */}
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-foreground">Accent Color</p>
          <div className="flex flex-wrap gap-2.5">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => patchDraft({ accentColor: c.value })}
                title={c.label}
                aria-label={`Select ${c.label} accent color`}
                className={cn(
                  "relative h-8 w-8 rounded-full transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "hover:scale-110",
                  draft.accentColor === c.value && "scale-110 ring-2 ring-offset-2 ring-offset-background"
                )}
                style={{ backgroundColor: c.value, ...(draft.accentColor === c.value ? { ringColor: c.value } : {}) }}
              >
                {draft.accentColor === c.value && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Affects buttons, active states, and highlights across the app.
          </p>
        </div>

        {/* Font size */}
        <div className="space-y-2.5">
          <p className="text-sm font-medium text-foreground">Interface Density</p>
          <div className="flex gap-2">
            {fontSizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => patchDraft({ fontSize: opt.value })}
                aria-label={`${opt.label} font size`}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  draft.fontSize === opt.value
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <span className="block">{opt.label}</span>
                <span className="text-xs opacity-60">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderNotifications() {
    const { notifications } = draft

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Notifications</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Choose how and when you receive updates.
          </p>
        </div>

        {/* Email */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</p>
          <div className="mt-1 divide-y divide-border rounded-lg border border-border">
            <div className="px-4">
              <NotifRow
                id="n-email-assigned"
                label="Task assigned to me"
                description="Receive an email when a task is assigned to you."
                checked={notifications.emailTaskAssigned}
                onChange={(v) => patchNotif("emailTaskAssigned", v)}
              />
            </div>
            <div className="px-4">
              <NotifRow
                id="n-email-deadline"
                label="Deadline reminders"
                description="Get reminded 24 hours before a task is due."
                checked={notifications.emailDeadlineReminders}
                onChange={(v) => patchNotif("emailDeadlineReminders", v)}
              />
            </div>
            <div className="px-4">
              <NotifRow
                id="n-email-updates"
                label="Project updates"
                description="Weekly digest of project progress and changes."
                checked={notifications.emailProjectUpdates}
                onChange={(v) => patchNotif("emailProjectUpdates", v)}
              />
            </div>
          </div>
        </div>

        {/* Push */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Push</p>
          <div className="mt-1 divide-y divide-border rounded-lg border border-border">
            <div className="px-4">
              <NotifRow
                id="n-push-comments"
                label="New comments"
                description="Push notification when someone comments on your task."
                checked={notifications.pushNewComments}
                onChange={(v) => patchNotif("pushNewComments", v)}
              />
            </div>
            <div className="px-4">
              <NotifRow
                id="n-push-status"
                label="Status changes"
                description="Notified when a task you own moves columns."
                checked={notifications.pushStatusChanges}
                onChange={(v) => patchNotif("pushStatusChanges", v)}
              />
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Desktop</p>
          <div className="mt-1 divide-y divide-border rounded-lg border border-border">
            <div className="px-4">
              <NotifRow
                id="n-desktop-all"
                label="All desktop notifications"
                description="Show browser notifications for all activity."
                checked={notifications.desktopAll}
                onChange={(v) => patchNotif("desktopAll", v)}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderIntegrations() {
    const integrationIds: IntegrationId[] = ["github", "slack", "notion"]

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-foreground">Integrations</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Connect your favourite tools to streamline your workflow.
          </p>
        </div>

        <div className="space-y-3">
          {integrationIds.map((id) => {
            const meta = INTEGRATION_META[id]
            const status = settings.integrations[id]
            const isConnected = status === "connected"

            return (
              <motion.div
                key={id}
                layout
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold",
                    meta.iconBg
                  )}
                >
                  {meta.iconLabel}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{meta.name}</p>
                    {isConnected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
                </div>

                {/* Action */}
                <Button
                  size="sm"
                  variant={isConnected ? "outline" : "default"}
                  onClick={() => settings.toggleIntegration(id)}
                  className="shrink-0 gap-1.5"
                  aria-label={isConnected ? `Disconnect ${meta.name}` : `Connect ${meta.name}`}
                >
                  {isConnected ? (
                    <>
                      <Unlink className="h-3.5 w-3.5" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Link className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </Button>
              </motion.div>
            )
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Integration changes take effect immediately and do not require saving.
        </p>
      </div>
    )
  }

  const sectionMap: Record<Tab, () => React.ReactNode> = {
    profile: renderProfile,
    appearance: renderAppearance,
    notifications: renderNotifications,
    integrations: renderIntegrations,
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border px-6 py-4 shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Configuration
        </p>
        <h1 className="mt-0.5 text-2xl font-bold font-heading tracking-tight text-foreground">
          Settings
        </h1>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tab nav — vertical on md+, horizontal strip on mobile */}
        <nav
          className={cn(
            "shrink-0 border-r border-border bg-sidebar",
            "hidden md:flex md:w-48 md:flex-col md:py-3 md:px-2 md:gap-0.5"
          )}
          aria-label="Settings sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-testid={`settings-tab-${id}`}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 text-left w-full",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeTab === id
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile tab nav */}
        <div className="md:hidden w-full absolute top-[4.5rem] left-0 z-10 border-b border-border bg-background px-4 flex gap-1 overflow-x-auto scrollbar-none shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                activeTab === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 py-6 pb-32 mt-0 md:mt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {sectionMap[activeTab]()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sticky unsaved changes bar */}
      <AnimatePresence>
        {(isDirty || saving || savedFeedback) && (
          <motion.div
            key="unsaved-bar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute bottom-0 left-0 right-0 z-20",
              "flex items-center justify-between gap-4 px-6 py-3",
              "border-t border-border bg-card/95 backdrop-blur-sm shadow-lg"
            )}
          >
            <div className="flex items-center gap-2 text-sm">
              {savedFeedback ? (
                <span data-testid="settings-saved-feedback" className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Changes saved
                </span>
              ) : (
                <span data-testid="settings-unsaved-bar" className="text-muted-foreground">
                  You have unsaved changes
                </span>
              )}
            </div>
            {!savedFeedback && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  data-testid="settings-discard-btn"
                  onClick={handleDiscard}
                  disabled={saving}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  data-testid="settings-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-1.5 min-w-[80px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
