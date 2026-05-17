export type Difficulty = "beginner" | "intermediate" | "advanced" | "elite"

export type ChallengeGoal =
  | { kind: "totalReps"; exercise?: string; target: number }
  | { kind: "dailyStreak"; minRepsPerDay: number; exercise?: string; days: number }
  | { kind: "uniqueExercises"; target: number }
  | { kind: "workoutsCount"; target: number }

export type Challenge = {
  id: string
  title: string
  emoji: string
  description: string
  difficulty: Difficulty
  durationDays: number
  category: "strength" | "cardio" | "core" | "consistency" | "variety"
  xpReward: number
  goal: ChallengeGoal
  gradient: string
}

export const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; order: number }> = {
  beginner: { label: "Beginner", color: "from-emerald-500 to-teal-500", order: 0 },
  intermediate: { label: "Intermediate", color: "from-sky-500 to-indigo-500", order: 1 },
  advanced: { label: "Advanced", color: "from-violet-500 to-fuchsia-500", order: 2 },
  elite: { label: "Elite", color: "from-rose-500 to-orange-500", order: 3 },
}

export const CHALLENGES: Challenge[] = [
  // STRENGTH — Push-ups
  {
    id: "pushup-100-beginner",
    title: "100 Push-ups Week",
    emoji: "💪",
    description: "Hit 100 total push-ups in 7 days. A gentle start.",
    difficulty: "beginner",
    durationDays: 7,
    category: "strength",
    xpReward: 150,
    goal: { kind: "totalReps", exercise: "pushup", target: 100 },
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "pushup-500-intermediate",
    title: "500 Push-up Pursuit",
    emoji: "💪",
    description: "500 push-ups in 14 days. Show grit.",
    difficulty: "intermediate",
    durationDays: 14,
    category: "strength",
    xpReward: 400,
    goal: { kind: "totalReps", exercise: "pushup", target: 500 },
    gradient: "from-sky-500/20 to-indigo-500/20",
  },
  {
    id: "pushup-1500-advanced",
    title: "1500 Push-up Gauntlet",
    emoji: "🔥",
    description: "1500 push-ups in 30 days. Don't skip leg day.",
    difficulty: "advanced",
    durationDays: 30,
    category: "strength",
    xpReward: 1000,
    goal: { kind: "totalReps", exercise: "pushup", target: 1500 },
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    id: "pushup-3000-elite",
    title: "3000 Push-up Beast",
    emoji: "👹",
    description: "3000 push-ups in 30 days. 100/day average.",
    difficulty: "elite",
    durationDays: 30,
    category: "strength",
    xpReward: 2500,
    goal: { kind: "totalReps", exercise: "pushup", target: 3000 },
    gradient: "from-rose-500/20 to-orange-500/20",
  },

  // STRENGTH — Squats
  {
    id: "squat-200-beginner",
    title: "200 Squats Week",
    emoji: "🦵",
    description: "200 squats in 7 days. Wake up those legs.",
    difficulty: "beginner",
    durationDays: 7,
    category: "strength",
    xpReward: 180,
    goal: { kind: "totalReps", exercise: "squat", target: 200 },
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "squat-1000-intermediate",
    title: "1000 Squat Squad",
    emoji: "🦵",
    description: "1000 squats in 14 days.",
    difficulty: "intermediate",
    durationDays: 14,
    category: "strength",
    xpReward: 500,
    goal: { kind: "totalReps", exercise: "squat", target: 1000 },
    gradient: "from-sky-500/20 to-indigo-500/20",
  },
  {
    id: "squat-5000-elite",
    title: "5000 Squat Iron Quads",
    emoji: "🏋️",
    description: "5000 squats in 30 days. Sit-stand-repeat.",
    difficulty: "elite",
    durationDays: 30,
    category: "strength",
    xpReward: 3000,
    goal: { kind: "totalReps", exercise: "squat", target: 5000 },
    gradient: "from-rose-500/20 to-orange-500/20",
  },

  // CORE — Sit-ups / Crunches
  {
    id: "situp-150-beginner",
    title: "Core Starter",
    emoji: "🧘",
    description: "150 sit-ups in 7 days. Build that core.",
    difficulty: "beginner",
    durationDays: 7,
    category: "core",
    xpReward: 160,
    goal: { kind: "totalReps", exercise: "situp", target: 150 },
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "crunch-1000-advanced",
    title: "1000 Crunch Crush",
    emoji: "💢",
    description: "1000 crunches in 21 days.",
    difficulty: "advanced",
    durationDays: 21,
    category: "core",
    xpReward: 800,
    goal: { kind: "totalReps", exercise: "crunch", target: 1000 },
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },

  // CONSISTENCY
  {
    id: "streak-7-beginner",
    title: "7-Day Streak",
    emoji: "🔥",
    description: "Train every day for 7 days straight (10+ reps).",
    difficulty: "beginner",
    durationDays: 7,
    category: "consistency",
    xpReward: 200,
    goal: { kind: "dailyStreak", minRepsPerDay: 10, days: 7 },
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "streak-14-intermediate",
    title: "Two-Week Warrior",
    emoji: "🗡️",
    description: "Train every day for 14 days (25+ reps).",
    difficulty: "intermediate",
    durationDays: 14,
    category: "consistency",
    xpReward: 500,
    goal: { kind: "dailyStreak", minRepsPerDay: 25, days: 14 },
    gradient: "from-sky-500/20 to-indigo-500/20",
  },
  {
    id: "streak-30-advanced",
    title: "30-Day Iron Will",
    emoji: "⚔️",
    description: "Train every day for 30 days (50+ reps).",
    difficulty: "advanced",
    durationDays: 30,
    category: "consistency",
    xpReward: 1500,
    goal: { kind: "dailyStreak", minRepsPerDay: 50, days: 30 },
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },
  {
    id: "streak-66-elite",
    title: "66-Day Habit Forge",
    emoji: "🏛️",
    description: "66 consecutive days. Science says it builds a habit.",
    difficulty: "elite",
    durationDays: 66,
    category: "consistency",
    xpReward: 4000,
    goal: { kind: "dailyStreak", minRepsPerDay: 30, days: 66 },
    gradient: "from-rose-500/20 to-orange-500/20",
  },

  // VARIETY
  {
    id: "variety-5-beginner",
    title: "Five-Exercise Sampler",
    emoji: "🎯",
    description: "Try 5 different exercises in 7 days.",
    difficulty: "beginner",
    durationDays: 7,
    category: "variety",
    xpReward: 200,
    goal: { kind: "uniqueExercises", target: 5 },
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "variety-all-advanced",
    title: "Full Spectrum",
    emoji: "🌈",
    description: "All 10 exercises in 14 days.",
    difficulty: "advanced",
    durationDays: 14,
    category: "variety",
    xpReward: 900,
    goal: { kind: "uniqueExercises", target: 10 },
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },

  // WORKOUT COUNT
  {
    id: "sessions-10-beginner",
    title: "10 Sessions Sprint",
    emoji: "⚡",
    description: "Complete 10 workout sessions in 14 days.",
    difficulty: "beginner",
    durationDays: 14,
    category: "consistency",
    xpReward: 250,
    goal: { kind: "workoutsCount", target: 10 },
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "sessions-50-advanced",
    title: "50 Sessions Marathon",
    emoji: "🏃",
    description: "Complete 50 workouts in 30 days.",
    difficulty: "advanced",
    durationDays: 30,
    category: "consistency",
    xpReward: 1800,
    goal: { kind: "workoutsCount", target: 50 },
    gradient: "from-violet-500/20 to-fuchsia-500/20",
  },
]

export const CHALLENGE_BY_ID = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]))
