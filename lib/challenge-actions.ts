"use server"

import { eq, sql, and, isNull, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { challengeEnrollments, workouts } from "@/lib/db/schema"
import { ensureUser } from "@/lib/actions"
import { CHALLENGES, CHALLENGE_BY_ID, type Challenge } from "@/lib/challenges"

export type ChallengeStatus = "available" | "active" | "completed" | "failed"

export type ChallengeWithProgress = {
  challenge: Challenge
  status: ChallengeStatus
  progress: number
  target: number
  startedAt?: Date
  completedAt?: Date
  daysLeft?: number
  enrollmentId?: number
}

async function computeProgress(
  userId: string,
  c: Challenge,
  startedAt: Date,
  endsAt: Date,
): Promise<{ progress: number; target: number }> {
  const now = new Date()
  const upper = now < endsAt ? now : endsAt

  if (c.goal.kind === "totalReps") {
    const conds = [
      eq(workouts.userId, userId),
      sql`${workouts.createdAt} >= ${startedAt}`,
      sql`${workouts.createdAt} <= ${upper}`,
    ]
    if (c.goal.exercise) conds.push(eq(workouts.exercise, c.goal.exercise))
    const [row] = await db
      .select({ reps: sql<number>`coalesce(sum(${workouts.reps}), 0)::int` })
      .from(workouts)
      .where(and(...conds))
    return { progress: Number(row?.reps ?? 0), target: c.goal.target }
  }

  if (c.goal.kind === "workoutsCount") {
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          sql`${workouts.createdAt} >= ${startedAt}`,
          sql`${workouts.createdAt} <= ${upper}`,
        ),
      )
    return { progress: Number(row?.n ?? 0), target: c.goal.target }
  }

  if (c.goal.kind === "uniqueExercises") {
    const [row] = await db
      .select({ n: sql<number>`count(distinct ${workouts.exercise})::int` })
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          sql`${workouts.createdAt} >= ${startedAt}`,
          sql`${workouts.createdAt} <= ${upper}`,
        ),
      )
    return { progress: Number(row?.n ?? 0), target: c.goal.target }
  }

  // dailyStreak — count consecutive days from start meeting min reps
  if (c.goal.kind === "dailyStreak") {
    const conds = [
      eq(workouts.userId, userId),
      sql`${workouts.createdAt} >= ${startedAt}`,
      sql`${workouts.createdAt} <= ${upper}`,
    ]
    if (c.goal.exercise) conds.push(eq(workouts.exercise, c.goal.exercise))
    const rows = await db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${workouts.createdAt}), 'YYYY-MM-DD')`,
        reps: sql<number>`coalesce(sum(${workouts.reps}), 0)::int`,
      })
      .from(workouts)
      .where(and(...conds))
      .groupBy(sql`date_trunc('day', ${workouts.createdAt})`)

    const qualifying = new Set(
      rows.filter((r) => Number(r.reps) >= c.goal.minRepsPerDay).map((r) => r.day),
    )

    // Count consecutive qualifying days from startedAt forward
    let streak = 0
    const cursor = new Date(startedAt)
    cursor.setUTCHours(0, 0, 0, 0)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    while (cursor <= today && cursor <= endsAt) {
      const key = cursor.toISOString().slice(0, 10)
      if (qualifying.has(key)) streak += 1
      else if (cursor < today) {
        // Broken streak — only break if this past day is not today (today still has time)
        break
      } else {
        // Today not yet qualifying — don't break, just stop counting
        break
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return { progress: streak, target: c.goal.days }
  }

  return { progress: 0, target: 1 }
}

export async function getChallenges(): Promise<ChallengeWithProgress[]> {
  const me = await ensureUser()
  if (!me) return []

  const enrollments = await db
    .select()
    .from(challengeEnrollments)
    .where(eq(challengeEnrollments.userId, me.id))
    .orderBy(desc(challengeEnrollments.startedAt))

  const byId = new Map<string, typeof enrollments[number]>()
  for (const e of enrollments) {
    if (!byId.has(e.challengeId)) byId.set(e.challengeId, e)
  }

  const result: ChallengeWithProgress[] = []
  for (const c of CHALLENGES) {
    const e = byId.get(c.id)
    if (!e) {
      result.push({
        challenge: c,
        status: "available",
        progress: 0,
        target:
          c.goal.kind === "totalReps"
            ? c.goal.target
            : c.goal.kind === "workoutsCount"
              ? c.goal.target
              : c.goal.kind === "uniqueExercises"
                ? c.goal.target
                : c.goal.days,
      })
      continue
    }
    const endsAt = new Date(e.startedAt)
    endsAt.setDate(endsAt.getDate() + c.durationDays)
    const { progress, target } = await computeProgress(me.id, c, e.startedAt, endsAt)
    const now = new Date()
    let status: ChallengeStatus
    if (e.completedAt) status = "completed"
    else if (progress >= target) status = "completed"
    else if (now > endsAt) status = "failed"
    else status = "active"

    const daysLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86400000))

    result.push({
      challenge: c,
      status,
      progress: Math.min(progress, target),
      target,
      startedAt: e.startedAt,
      completedAt: e.completedAt ?? undefined,
      daysLeft,
      enrollmentId: e.id,
    })
  }
  return result
}

export async function enrollChallenge(challengeId: string) {
  const me = await ensureUser()
  if (!me) throw new Error("Not authenticated")
  if (!CHALLENGE_BY_ID[challengeId]) throw new Error("Unknown challenge")

  await db
    .insert(challengeEnrollments)
    .values({ userId: me.id, challengeId })
    .onConflictDoNothing()
  revalidatePath("/challenges")
  return { ok: true }
}

export async function abandonChallenge(enrollmentId: number) {
  const me = await ensureUser()
  if (!me) throw new Error("Not authenticated")
  await db
    .delete(challengeEnrollments)
    .where(and(eq(challengeEnrollments.id, enrollmentId), eq(challengeEnrollments.userId, me.id)))
  revalidatePath("/challenges")
  return { ok: true }
}
