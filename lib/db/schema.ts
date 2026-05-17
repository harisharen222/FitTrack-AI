import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  username: text("username").notNull(),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const workouts = pgTable(
  "workouts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    exercise: text("exercise").notNull(),
    reps: integer("reps").notNull().default(0),
    durationSec: integer("duration_sec").notNull().default(0),
    xpEarned: integer("xp_earned").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("workouts_user_idx").on(t.userId),
    createdIdx: index("workouts_created_idx").on(t.createdAt),
  }),
)

export const achievements = pgTable(
  "achievements",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  },
  (t) => ({
    userCodeUnq: uniqueIndex("achievements_user_code_unq").on(t.userId, t.code),
  }),
)

export const nutritionLogs = pgTable(
  "nutrition_logs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    barcode: text("barcode"),
    name: text("name").notNull(),
    brand: text("brand"),
    imageUrl: text("image_url"),
    servingG: integer("serving_g").notNull().default(100),
    calories: integer("calories").notNull().default(0),
    proteinG: integer("protein_g").notNull().default(0),
    carbsG: integer("carbs_g").notNull().default(0),
    fatG: integer("fat_g").notNull().default(0),
    meal: text("meal").notNull().default("snack"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("nutrition_user_idx").on(t.userId),
    createdIdx: index("nutrition_created_idx").on(t.createdAt),
  }),
)

export const nutritionGoals = pgTable("nutrition_goals", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  calories: integer("calories").notNull().default(2000),
  proteinG: integer("protein_g").notNull().default(120),
  carbsG: integer("carbs_g").notNull().default(250),
  fatG: integer("fat_g").notNull().default(70),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Workout = typeof workouts.$inferSelect
export type NewWorkout = typeof workouts.$inferInsert
export type NutritionLog = typeof nutritionLogs.$inferSelect
export type NewNutritionLog = typeof nutritionLogs.$inferInsert
export type NutritionGoal = typeof nutritionGoals.$inferSelect

export const challengeEnrollments = pgTable(
  "challenge_enrollments",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    challengeId: text("challenge_id").notNull(),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    abandonedAt: timestamp("abandoned_at"),
  },
  (t) => ({
    userIdx: index("ce_user_idx").on(t.userId),
    uniq: uniqueIndex("ce_user_challenge_active_unq").on(t.userId, t.challengeId),
  }),
)

export type ChallengeEnrollment = typeof challengeEnrollments.$inferSelect
