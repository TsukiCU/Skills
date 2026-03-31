import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, AlertTriangle, BarChart3 } from "lucide-react"
import { isPast, parseISO, isToday } from "date-fns"
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts"
import { useTaskStore } from "@/stores/taskStore"
import { MEMBERS } from "@/data/members"
import { COLUMN_ORDER, TASK_STATUSES } from "@/lib/constants"
import { weeklyCompletionData } from "@/data/analytics"
import type { TaskPriority, TaskStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_HEX: Record<TaskStatus, string> = {
  backlog: "#a1a1aa",
  todo: "#38bdf8",
  "in-progress": "#fbbf24",
  review: "#a78bfa",
  done: "#34d399",
}

const PRIORITY_HEX: Record<TaskPriority, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#38bdf8",
  low: "#a1a1aa",
}

// Member hex colors mapped from their Tailwind bg- classes
const MEMBER_HEX: Record<string, string> = {
  "member-1": "#14b8a6", // teal-500
  "member-2": "#8b5cf6", // violet-500
  "member-3": "#f43f5e", // rose-500
  "member-4": "#f59e0b", // amber-500
}

// --primary is defined as oklch(...) in this project, so `hsl(var(--primary))` produces
// `hsl(oklch(...))` which is invalid CSS and renders as transparent in SVG attributes.
// SVG presentation attributes (stroke=, fill=, stopColor=) cannot resolve CSS custom
// properties at all — only SVG style="" attributes can. Use a hardcoded hex instead.
const PRIMARY_TEAL = "#14b8a6"

const PRIORITY_ORDER: TaskPriority[] = ["urgent", "high", "medium", "low"]
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
}

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--foreground))",
  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  padding: "8px 12px",
}

// Recharts wraps contentStyle in its own div with a default white background.
// Setting background:transparent here ensures only contentStyle controls the look.
const TOOLTIP_WRAPPER_STYLE = { outline: "none", background: "transparent" }

// Recharts renders SVG <text> elements using inline 'fill' presentation attributes.
// CSS presentation attributes don't support CSS custom properties, but CSS stylesheet
// rules do — and CSS rules take precedence over presentation attributes.
// [&_.recharts-text]:fill-current tells Tailwind to emit:
//   .wrapper .recharts-text { fill: currentColor }
// which overrides the inline attribute, so the text inherits the wrapper's CSS color.
const CHART_WRAPPER = "[&_.recharts-text]:fill-current"

type TrendRange = "4W" | "8W" | "All"

type StatCardProps = {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  label: string
  value: string | number
  trend: string
  trendColor?: string
  delay: number
}

function StatCard({ icon, iconBg, iconColor, label, value, trend, trendColor = "text-muted-foreground", delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="rounded-lg border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold font-heading tracking-tight">{value}</p>
          <p className={`mt-1 text-xs ${trendColor}`}>{trend}</p>
        </div>
        <div className={cn("rounded-full p-2.5", iconBg, iconColor)}>{icon}</div>
      </div>
    </motion.div>
  )
}

type ChartCardProps = {
  title: string
  children: React.ReactNode
  delay: number
}

function ChartCard({ title, children, delay }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className="rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </motion.div>
  )
}

export function AnalyticsPage() {
  const tasks = useTaskStore((s) => s.tasks)
  const [trendRange, setTrendRange] = useState<TrendRange>("8W")

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === "done").length
    const overdue = tasks.filter(
      (t) => t.status !== "done" && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))
    ).length
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, overdue, completionPct }
  }, [tasks])

  const statusData = useMemo(
    () =>
      COLUMN_ORDER.map((status) => ({
        name: TASK_STATUSES[status],
        value: tasks.filter((t) => t.status === status).length,
        color: STATUS_HEX[status],
      })).filter((d) => d.value > 0),
    [tasks]
  )

  const priorityData = useMemo(
    () =>
      PRIORITY_ORDER.map((p) => ({
        name: PRIORITY_LABELS[p],
        count: tasks.filter((t) => t.priority === p).length,
        color: PRIORITY_HEX[p],
      })),
    [tasks]
  )

  const workloadData = useMemo(
    () =>
      MEMBERS.map((m) => ({
        name: m.name.split(" ")[0],
        fullName: m.name,
        avatar: m.avatar,
        tasks: tasks.filter((t) => t.assigneeId === m.id).length,
        color: MEMBER_HEX[m.id] ?? "#a1a1aa",
      })),
    [tasks]
  )

  const trendData = useMemo(() => {
    if (trendRange === "4W") return weeklyCompletionData.slice(-4)
    if (trendRange === "8W") return weeklyCompletionData.slice(-8)
    return weeklyCompletionData
  }, [trendRange])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          iconBg="bg-teal-100 dark:bg-teal-900/40"
          iconColor="text-teal-600 dark:text-teal-400"
          label="Total Tasks"
          value={stats.total}
          trend="↑12% vs last week"
          trendColor="text-emerald-600 dark:text-emerald-400"
          delay={0}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
          label="Completed"
          value={stats.completed}
          trend={`${stats.completionPct}% of total`}
          trendColor="text-muted-foreground"
          delay={0.05}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          iconBg={stats.overdue > 0 ? "bg-red-100 dark:bg-red-900/40" : "bg-zinc-100 dark:bg-zinc-800"}
          iconColor={stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}
          label="Overdue"
          value={stats.overdue}
          trend={stats.overdue > 0 ? "Needs attention" : "All on track"}
          trendColor={stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}
          delay={0.1}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          iconBg="bg-sky-100 dark:bg-sky-900/40"
          iconColor="text-sky-600 dark:text-sky-400"
          label="Avg Completion"
          value="4.2 days"
          trend="−0.8 days vs last month"
          trendColor="text-emerald-600 dark:text-emerald-400"
          delay={0.15}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Status Distribution */}
        <ChartCard title="Status Distribution" delay={0.2}>
          <div className={cn(CHART_WRAPPER, "text-muted-foreground")}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={false}
                  offset={8}
                  wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-1">
            {statusData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Weekly Completion Trend */}
        <ChartCard title="Weekly Completion Trend" delay={0.25}>
          {/* Range selector */}
          <div className="flex gap-1 mb-3">
            {(["4W", "8W", "All"] as TrendRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTrendRange(r)}
                aria-pressed={trendRange === r}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  trendRange === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <div className={cn(CHART_WRAPPER, "text-muted-foreground")}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  {/* Use hardcoded hex — hsl(var(--primary)) is invalid in SVG attributes
                      because --primary is an oklch value, not an hsl channel tuple */}
                  <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY_TEAL} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={PRIMARY_TEAL} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  cursor={false}
                  offset={8}
                  wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke={PRIMARY_TEAL}
                  strokeWidth={2}
                  fill="url(#completedGradient)"
                  dot={{ r: 3, fill: PRIMARY_TEAL, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: PRIMARY_TEAL }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Priority Breakdown */}
        <ChartCard title="Priority Breakdown" delay={0.3}>
          <div className={cn(CHART_WRAPPER, "text-muted-foreground")}>
            {/* bottom: 16 gives room for the "tasks" axis label to avoid clipping */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={priorityData}
                layout="vertical"
                margin={{ top: 0, right: 12, bottom: 16, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} vertical={true} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  label={{ value: "tasks", position: "insideBottomRight", offset: -4, fontSize: 10, fill: "currentColor" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={false}
                  offset={8}
                  wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24} background={{ fill: "transparent" }}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Team Workload */}
        <ChartCard title="Team Workload" delay={0.35}>
          <div className={cn(CHART_WRAPPER, "text-muted-foreground")}>
            {/* bottom: 16 gives room for the "tasks" axis label to avoid clipping */}
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={workloadData}
                layout="vertical"
                margin={{ top: 0, right: 32, bottom: 16, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.15} vertical={true} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  label={{ value: "tasks", position: "insideBottomRight", offset: -4, fontSize: 10, fill: "currentColor" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = workloadData.find((w) => w.name === payload[0].payload.name)
                    return (
                      <div style={TOOLTIP_STYLE}>
                        <p className="font-medium">{d?.fullName}</p>
                        <p className="text-muted-foreground">{payload[0].value} tasks</p>
                      </div>
                    )
                  }}
                  cursor={false}
                  offset={8}
                  wrapperStyle={TOOLTIP_WRAPPER_STYLE}
                />
                <Bar dataKey="tasks" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {workloadData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="tasks"
                    position="right"
                    style={{ fontSize: 11, fill: "currentColor", fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
