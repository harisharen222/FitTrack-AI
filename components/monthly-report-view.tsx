"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, ArrowRight, Trophy, Flame, Sparkles, Calendar, Activity, TrendingUp, TrendingDown, Minus, Apple } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import type { MonthlyReport } from "@/lib/reports"

const EXERCISE_LABELS: Record<string, { name: string; emoji: string }> = {
  squat: { name: "Squats", emoji: "🦵" },
  pushup: { name: "Push-ups", emoji: "💪" },
  bicep: { name: "Bicep Curls", emoji: "💥" },
  lunge: { name: "Lunges", emoji: "🏃" },
  shoulderPress: { name: "Shoulder Press", emoji: "🏋️" },
  lateralRaise: { name: "Lateral Raises", emoji: "🦅" },
  situp: { name: "Sit-ups", emoji: "🧘" },
  crunch: { name: "Crunches", emoji: "💢" },
  gluteBridge: { name: "Glute Bridge", emoji: "🌉" },
  tricepExtension: { name: "Tricep Extension", emoji: "🔥" },
}

const TIER_COLORS: Record<string, string> = {
  bronze: "#b45309",
  silver: "#94a3b8",
  gold: "#eab308",
  platinum: "#a78bfa",
}

const CHART_COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316", "#eab308", "#84cc16", "#22d3ee"]

export default function MonthlyReportView({ report }: { report: MonthlyReport }) {
  const router = useRouter()

  const prevMonth = () => {
    const m = report.month === 1 ? 12 : report.month - 1
    const y = report.month === 1 ? report.year - 1 : report.year
    router.push(`/reports/monthly?year=${y}&month=${m}`)
  }
  const nextMonth = () => {
    const m = report.month === 12 ? 1 : report.month + 1
    const y = report.month === 12 ? report.year + 1 : report.year
    router.push(`/reports/monthly?year=${y}&month=${m}`)
  }

  const repsDelta = report.totals.reps - report.prevMonth.reps
  const repsPct =
    report.prevMonth.reps > 0
      ? Math.round((repsDelta / report.prevMonth.reps) * 100)
      : null

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print">
        <DashboardHeader />
      </div>

      {/* Toolbar */}
      <div className="no-print container mx-auto max-w-5xl px-4 md:px-6 py-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="font-semibold px-3">{report.monthLabel}</div>
          <Button variant="outline" size="icon" onClick={nextMonth}><ArrowRight className="h-4 w-4" /></Button>
        </div>
        <Button className="gradient-bg text-white" onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      <main className="container mx-auto max-w-5xl px-4 md:px-6 pb-12">
        <article className="report-paper rounded-3xl overflow-hidden shadow-2xl">
          {/* COVER */}
          <section className="report-cover relative p-10 md:p-14 text-white overflow-hidden">
            <div className="cover-blob blob-a" />
            <div className="cover-blob blob-b" />
            <div className="relative">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-2 font-bold text-xl">
                  ⚡ FitTrack AI
                </div>
                <div className="text-sm opacity-80">Monthly Progress Report</div>
              </div>
              <div className="space-y-2 mb-12">
                <div className="text-sm uppercase tracking-[0.3em] opacity-80">
                  {report.monthLabel}
                </div>
                <h1 className="text-5xl md:text-7xl font-black leading-none">
                  {report.username}
                </h1>
                <div className="text-2xl opacity-90 mt-2">Level {report.level} athlete</div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
                <BigStat label="Workouts" value={report.totals.workouts} />
                <BigStat label="Total reps" value={report.totals.reps} />
                <BigStat label="Active days" value={report.totals.activeDays} />
                <BigStat label="XP earned" value={report.totals.xp} />
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <section className="p-8 md:p-12 space-y-10">
            <Heading icon={Sparkles} title="At a glance" />
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <Card grad="from-emerald-500/15 to-teal-500/10" icon={Activity} label="Workouts" value={report.totals.workouts} />
              <Card grad="from-orange-500/15 to-rose-500/10" icon={Flame} label="Total reps" value={report.totals.reps.toLocaleString()} />
              <Card grad="from-violet-500/15 to-fuchsia-500/10" icon={Sparkles} label="Variety" value={`${report.totals.uniqueExercises} exercises`} />
              <Card grad="from-sky-500/15 to-indigo-500/10" icon={Calendar} label="Avg reps/active day" value={report.totals.avgRepsPerDay} />
            </div>

            {/* MoM comparison */}
            <div className="rounded-2xl border bg-secondary/30 p-6">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                Vs. previous month
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {repsPct === null ? (
                  <span className="text-2xl font-bold text-muted-foreground">First tracked month — keep it up!</span>
                ) : (
                  <>
                    {repsDelta >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-emerald-500" />
                    ) : repsDelta === 0 ? (
                      <Minus className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-rose-500" />
                    )}
                    <span className="text-3xl font-black">
                      {repsDelta >= 0 ? "+" : ""}
                      {repsPct}%
                    </span>
                    <span className="text-muted-foreground">
                      reps ({report.prevMonth.reps.toLocaleString()} → {report.totals.reps.toLocaleString()})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Daily activity chart */}
            <div>
              <Heading icon={Activity} title="Daily activity" />
              <div className="h-64 rounded-2xl border p-4 bg-secondary/20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.daily.map((d) => ({ ...d, label: d.day.slice(-2) }))}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="label" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip
                      labelFormatter={(l) => `Day ${l}`}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Bar dataKey="reps" radius={[6, 6, 0, 0]} fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Exercise breakdown */}
            {report.exercises.length > 0 && (
              <div>
                <Heading icon={TrendingUp} title="Exercise breakdown" />
                <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
                  <div className="h-72 rounded-2xl border p-4 bg-secondary/20">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={report.exercises}
                          dataKey="reps"
                          nameKey="exercise"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {report.exercises.map((_, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: any, n: any) => [`${v} reps`, EXERCISE_LABELS[n]?.name ?? n]}
                          contentStyle={{ borderRadius: 8, fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="rounded-2xl border divide-y divide-border/60 overflow-hidden">
                    {report.exercises.map((e, i) => {
                      const meta = EXERCISE_LABELS[e.exercise] ?? { name: e.exercise, emoji: "•" }
                      return (
                        <li key={e.exercise} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                            />
                            <span className="text-xl">{meta.emoji}</span>
                            <div>
                              <div className="font-medium">{meta.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {e.sessions} sessions · best {e.best}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold">{e.reps.toLocaleString()}</div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* PRs */}
            {report.prs.length > 0 && (
              <div>
                <Heading icon={Trophy} title="Personal records set" />
                <div className="grid gap-3 md:grid-cols-3">
                  {report.prs.map((p) => {
                    const meta = EXERCISE_LABELS[p.exercise] ?? { name: p.exercise, emoji: "•" }
                    return (
                      <div
                        key={p.exercise}
                        className="rounded-2xl border p-4 bg-gradient-to-br from-yellow-500/15 to-amber-500/10"
                      >
                        <div className="flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400 font-bold uppercase tracking-wider">
                          <Trophy className="h-3 w-3" /> New PR
                        </div>
                        <div className="text-3xl mt-1">{meta.emoji}</div>
                        <div className="font-semibold mt-1">{meta.name}</div>
                        <div className="text-2xl font-black">{p.reps} reps</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.date).toLocaleDateString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Achievements */}
            {report.achievements.length > 0 && (
              <div>
                <Heading icon={Sparkles} title="Achievements unlocked" />
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                  {report.achievements.map((a) => (
                    <div
                      key={a.code}
                      className="rounded-2xl p-4 text-center text-white"
                      style={{ background: TIER_COLORS[a.tier] ?? "#64748b" }}
                    >
                      <div className="text-3xl">{a.emoji}</div>
                      <div className="font-semibold text-sm mt-1">{a.name}</div>
                      <div className="text-[10px] opacity-80 uppercase tracking-wider mt-0.5">
                        {a.tier}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutrition */}
            {report.nutrition && (
              <div>
                <Heading icon={Apple} title="Nutrition snapshot" />
                <div className="grid gap-4 md:grid-cols-3">
                  <Card grad="from-lime-500/15 to-emerald-500/10" icon={Calendar} label="Days logged" value={report.nutrition.daysLogged} />
                  <Card grad="from-orange-500/15 to-rose-500/10" icon={Flame} label="Avg calories / day" value={report.nutrition.avgCalories} />
                  <Card grad="from-red-500/15 to-pink-500/10" icon={Activity} label="Avg protein (g) / day" value={report.nutrition.avgProteinG} />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>FitTrack AI · {report.monthLabel}</span>
              <span>
                <Link href="/dashboard" className="underline">fittrack.ai/dashboard</Link>
              </span>
            </div>
          </section>
        </article>
      </main>

      <style jsx global>{`
        .report-paper {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
        }
        .report-cover {
          background: linear-gradient(135deg, #0f172a 0%, #14532d 25%, #0e7490 60%, #6d28d9 100%);
        }
        .cover-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          opacity: 0.6;
        }
        .blob-a {
          top: -80px;
          right: -80px;
          width: 360px;
          height: 360px;
          background: radial-gradient(closest-side, #10b981, transparent);
        }
        .blob-b {
          bottom: -100px;
          left: -60px;
          width: 420px;
          height: 420px;
          background: radial-gradient(closest-side, #d946ef, transparent);
        }
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: white !important; }
          .no-print { display: none !important; }
          .report-paper {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .report-cover {
            page-break-after: always;
            color: white !important;
          }
          section, .rounded-2xl, .rounded-3xl {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}

function BigStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/15">
      <div className="text-3xl md:text-4xl font-black">{value}</div>
      <div className="text-xs uppercase tracking-wider opacity-80 mt-1">{label}</div>
    </div>
  )
}

function Card({ icon: Icon, label, value, grad }: any) {
  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-br ${grad}`}>
      <Icon className="h-5 w-5 mb-3" />
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

function Heading({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
      <Icon className="h-5 w-5 text-emerald-500" />
      {title}
    </h2>
  )
}
