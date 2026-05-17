"use server"

import { eq, sql, and, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { workouts, achievements, nutritionLogs } from "@/lib/db/schema"
import { ensureUser } from "@/lib/actions"
import { ACHIEVEMENT_BY_CODE } from "@/lib/achievements"

export type MonthlyReport = {
  username: string
  level: number
  monthLabel: string
  year: number
  month: number // 1-12
  totals: {
    workouts: number
    reps: number
    xp: number
    uniqueExercises: number
    activeDays: number
    avgRepsPerDay: number
  }
  exercises: { exercise: string; reps: number; sessions: number; best: number }[]
  daily: { day: string; reps: number }[]
  prs: { exercise: string; reps: number; date: Date }[]
  achievements: { code: string; name: string; emoji: string; tier: string; unlockedAt: Date }[]
  nutrition: {
    daysLogged: number
    avgCalories: number
    avgProteinG: number
  } | null
  prevMonth: { reps: number; workouts: number }
}

function monthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0))
  return { start, end }
}

export async function getMonthlyReport(
  year: number,
  month: number,
): Promise<MonthlyReport | null> {
  const me = await ensureUser()
  if (!me) return null

  const { start, end } = monthBounds(year, month)
  const prev = monthBounds(month === 1 ? year - 1 : year, month === 1 ? 12 : month - 1)

  // Totals
  const [tot] = await db
    .select({
      workouts: sql<number>`count(*)::int`,
      reps: sql<number>`coalesce(sum(${workouts.reps}), 0)::int`,
      xp: sql<number>`coalesce(sum(${workouts.xpEarned}), 0)::int`,
      uniq: sql<number>`count(distinct ${workouts.exercise})::int`,
      activeDays: sql<number>`count(distinct date_trunc('day', ${workouts.createdAt}))::int`,
    })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, me.id),
        sql`${workouts.createdAt} >= ${start}`,
        sql`${workouts.createdAt} < ${end}`,
      ),
    )

  // Per-exercise
  const exRows = await db
    .select({
      exercise: workouts.exercise,
      reps: sql<number>`coalesce(sum(${workouts.reps}), 0)::int`,
      sessions: sql<number>`count(*)::int`,
      best: sql<number>`max(${workouts.reps})::int`,
    })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, me.id),
        sql`${workouts.createdAt} >= ${start}`,
        sql`${workouts.createdAt} < ${end}`,
      ),
    )
    .groupBy(workouts.exercise)
    .orderBy(desc(sql`sum(${workouts.reps})`))

  // Daily
  const dailyRows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${workouts.createdAt}), 'YYYY-MM-DD')`,
      reps: sql<number>`coalesce(sum(${workouts.reps}), 0)::int`,
    })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, me.id),
        sql`${workouts.createdAt} >= ${start}`,
        sql`${workouts.createdAt} < ${end}`,
      ),
    )
    .groupBy(sql`date_trunc('day', ${workouts.createdAt})`)
    .orderBy(sql`date_trunc('day', ${workouts.createdAt})`)

  // Build full daily array (fill gaps with 0)
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const dailyMap = new Map(dailyRows.map((r) => [r.day, Number(r.reps)]))
  const daily: { day: string; reps: number }[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    daily.push({ day: key, reps: dailyMap.get(key) ?? 0 })
  }

  // PRs in month (max reps per exercise this month; flagged as PR if it exceeds all prior records)
  const priorBest = await db
    .select({
      exercise: workouts.exercise,
      best: sql<number>`max(${workouts.reps})::int`,
    })
    .from(workouts)
    .where(and(eq(workouts.userId, me.id), sql`${workouts.createdAt} < ${start}`))
    .groupBy(workouts.exercise)

  const priorMap = new Map(priorBest.map((p) => [p.exercise, Number(p.best)]))

  const prRows = await db
    .select({
      exercise: workouts.exercise,
      reps: workouts.reps,
      createdAt: workouts.createdAt,
    })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, me.id),
        sql`${workouts.createdAt} >= ${start}`,
        sql`${workouts.createdAt} < ${end}`,
      ),
    )
    .orderBy(desc(workouts.reps))

  const prs: { exercise: string; reps: number; date: Date }[] = []
  const seen = new Set<string>()
  for (const r of prRows) {
    if (seen.has(r.exercise)) continue
    const prior = priorMap.get(r.exercise) ?? 0
    if (r.reps > prior) {
      prs.push({ exercise: r.exercise, reps: r.reps, date: r.createdAt })
      seen.add(r.exercise)
    }
  }

  // Achievements unlocked in month
  const achRows = await db
    .select()
    .from(achievements)
    .where(
      and(
        eq(achievements.userId, me.id),
        sql`${achievements.unlockedAt} >= ${start}`,
        sql`${achievements.unlockedAt} < ${end}`,
      ),
    )
    .orderBy(desc(achievements.unlockedAt))

  const achList = achRows
    .map((a) => {
      const meta = ACHIEVEMENT_BY_CODE[a.code]
      if (!meta) return null
      return {
        code: a.code,
        name: meta.name,
        emoji: meta.emoji,
        tier: meta.tier,
        unlockedAt: a.unlockedAt,
      }
    })
    .filter(Boolean) as MonthlyReport["achievements"]

  // Nutrition summary (if any)
  let nutrition: MonthlyReport["nutrition"] = null
  try {
    const nutRows = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${nutritionLogs.createdAt}), 'YYYY-MM-DD')`,
        cals: sql<number>`coalesce(sum(${nutritionLogs.calories}), 0)::int`,
        pro: sql<number>`coalesce(sum(${nutritionLogs.proteinG}), 0)::int`,
      })
      .from(nutritionLogs)
      .where(
        and(
          eq(nutritionLogs.userId, me.id),
          sql`${nutritionLogs.createdAt} >= ${start}`,
          sql`${nutritionLogs.createdAt} < ${end}`,
        ),
      )
      .groupBy(sql`date_trunc('day', ${nutritionLogs.createdAt})`)

    if (nutRows.length > 0) {
      const days = nutRows.length
      const totalCals = nutRows.reduce((s, r) => s + Number(r.cals), 0)
      const totalPro = nutRows.reduce((s, r) => s + Number(r.pro), 0)
      nutrition = {
        daysLogged: days,
        avgCalories: Math.round(totalCals / days),
        avgProteinG: Math.round(totalPro / days),
      }
    }
  } catch {
    // nutrition table not migrated yet — skip
  }

  // Prev month for comparison
  const [prevTot] = await db
    .select({
      workouts: sql<number>`count(*)::int`,
      reps: sql<number>`coalesce(sum(${workouts.reps}), 0)::int`,
    })
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, me.id),
        sql`${workouts.createdAt} >= ${prev.start}`,
        sql`${workouts.createdAt} < ${prev.end}`,
      ),
    )

  const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  })

  return {
    username: me.username,
    level: me.level,
    monthLabel: monthName,
    year,
    month,
    totals: {
      workouts: Number(tot?.workouts ?? 0),
      reps: Number(tot?.reps ?? 0),
      xp: Number(tot?.xp ?? 0),
      uniqueExercises: Number(tot?.uniq ?? 0),
      activeDays: Number(tot?.activeDays ?? 0),
      avgRepsPerDay:
        Number(tot?.activeDays ?? 0) > 0
          ? Math.round(Number(tot?.reps ?? 0) / Number(tot?.activeDays ?? 1))
          : 0,
    },
    exercises: exRows.map((r) => ({
      exercise: r.exercise,
      reps: Number(r.reps),
      sessions: Number(r.sessions),
      best: Number(r.best),
    })),
    daily,
    prs,
    achievements: achList,
    nutrition,
    prevMonth: {
      reps: Number(prevTot?.reps ?? 0),
      workouts: Number(prevTot?.workouts ?? 0),
    },
  }
}
