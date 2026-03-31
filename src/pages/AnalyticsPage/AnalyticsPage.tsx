import { useMemo } from "react"
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
  ResponsiveContainer,
} from "recharts"
import { useTaskStore } from "@/stores/taskStore"
import { MEMBERS } from "@/data/members"
import { COLUMN_ORDER, TASK_STATUSES } from "@/lib/constants"
import { weeklyCompletionData } from "@/data/analytics"
import type { TaskPriority, TaskStatus } from "@/lib/types"

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

const PRIORITY_ORDER: TaskPriority[] = ["urgent", "high", "medium", "low"]
const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
}

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: string | number
  trend: string
  trendColor?: string
  delay: number
}

function StatCard({ icon, label, value, trend, trendColor = "text-muted-foreground", delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="rounded-lg border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold font-heading tracking-tight">{value}</p>
          <p className={`mt-1 text-xs ${trendColor}`}>{trend}</p>
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
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
      className="rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </motion.div>
  )
}

export function AnalyticsPage() {
  const tasks = useTaskStore((s) => s.tasks)

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
      })),
    [tasks]
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Project health and team performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Total Tasks"
          value={stats.total}
          trend="↑12% vs last week"
          trendColor="text-emerald-600 dark:text-emerald-400"
          delay={0}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed"
          value={stats.completed}
          trend={`${stats.completionPct}% of total`}
          trendColor="text-muted-foreground"
          delay={0.05}
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Overdue"
          value={stats.overdue}
          trend={stats.overdue > 0 ? "Needs attention" : "All on track"}
          trendColor={stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}
          delay={0.1}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
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
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
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
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyCompletionData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#completedGradient)"
                dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Priority Breakdown */}
        <ChartCard title="Priority Breakdown" delay={0.3}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={priorityData}
              layout="vertical"
              margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Team Workload */}
        <ChartCard title="Team Workload" delay={0.35}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={workloadData}
              layout="vertical"
              margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                axisLine={false}
                tickLine={false}
                width={44}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = workloadData.find((w) => w.name === payload[0].payload.name)
                  return (
                    <div
                      style={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                    >
                      <p className="font-medium">{d?.fullName}</p>
                      <p className="text-muted-foreground">{payload[0].value} tasks</p>
                    </div>
                  )
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
              />
              <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={24} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
