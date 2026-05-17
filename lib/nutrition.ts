"use server"

import { eq, sql, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { nutritionLogs, nutritionGoals } from "@/lib/db/schema"
import { ensureUser } from "@/lib/actions"
import { searchIndianFoods } from "@/lib/indian-foods"

export type OFFProduct = {
  barcode: string
  name: string
  brand?: string
  imageUrl?: string
  servingG: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export async function lookupBarcode(barcode: string): Promise<OFFProduct | null> {
  const clean = barcode.replace(/[^0-9]/g, "")
  if (clean.length < 6) return null
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=product_name,brands,image_front_small_url,nutriments,serving_size`,
      { headers: { "User-Agent": "FitTrack-AI/1.0" }, next: { revalidate: 60 * 60 * 24 } },
    )
    if (!res.ok) return null
    const data = (await res.json()) as any
    if (data.status !== 1 || !data.product) return null
    const p = data.product
    const n = p.nutriments ?? {}
    // OFF reports per 100 g/ml. Normalize to a 100 g serving.
    return {
      barcode: clean,
      name: p.product_name || "Unknown product",
      brand: p.brands || undefined,
      imageUrl: p.image_front_small_url || undefined,
      servingG: 100,
      calories: Math.round(Number(n["energy-kcal_100g"] ?? n.energy_kcal_100g ?? 0)),
      proteinG: Math.round(Number(n.proteins_100g ?? 0)),
      carbsG: Math.round(Number(n.carbohydrates_100g ?? 0)),
      fatG: Math.round(Number(n.fat_100g ?? 0)),
    }
  } catch {
    return null
  }
}

export async function searchFoods(query: string): Promise<OFFProduct[]> {
  const q = query.trim()
  if (q.length < 2) return []

  // 1) Local Indian-food DB (instant, curated)
  const local: OFFProduct[] = searchIndianFoods(q).map((f) => ({
    barcode: f.id,
    name: f.name,
    brand: f.brand,
    servingG: f.servingG,
    calories: f.calories,
    proteinG: f.proteinG,
    carbsG: f.carbsG,
    fatG: f.fatG,
  }))

  // 2) Open Food Facts — packaged products. Prefer the India endpoint for
  //    better regional coverage; fall back to the world endpoint if it errors.
  let remote: OFFProduct[] = []
  for (const host of ["in.openfoodfacts.org", "world.openfoodfacts.org"]) {
    try {
      const url = `https://${host}/cgi/search.pl?search_terms=${encodeURIComponent(
        q,
      )}&search_simple=1&action=process&json=1&page_size=12&fields=code,product_name,brands,image_front_small_url,nutriments`
      const res = await fetch(url, {
        headers: { "User-Agent": "FitTrack-AI/1.0" },
        next: { revalidate: 60 * 5 },
      })
      if (!res.ok) continue
      const data = (await res.json()) as any
      const products = data.products ?? []
      remote = products
        .filter((p: any) => p.product_name && p.nutriments)
        .map((p: any) => {
          const n = p.nutriments ?? {}
          return {
            barcode: String(p.code || ""),
            name: p.product_name,
            brand: p.brands || undefined,
            imageUrl: p.image_front_small_url || undefined,
            servingG: 100,
            calories: Math.round(Number(n["energy-kcal_100g"] ?? n.energy_kcal_100g ?? 0)),
            proteinG: Math.round(Number(n.proteins_100g ?? 0)),
            carbsG: Math.round(Number(n.carbohydrates_100g ?? 0)),
            fatG: Math.round(Number(n.fat_100g ?? 0)),
          }
        })
        .filter((p: OFFProduct) => p.calories > 0)
      if (remote.length > 0) break
    } catch {
      // try next host
    }
  }

  // Local results first so home-cooked dishes outrank packaged matches.
  return [...local, ...remote].slice(0, 24)
}

export async function logFood(input: {
  barcode?: string
  name: string
  brand?: string
  imageUrl?: string
  servingG: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  meal: "breakfast" | "lunch" | "dinner" | "snack"
}) {
  const me = await ensureUser()
  if (!me) throw new Error("Not authenticated")
  await db.insert(nutritionLogs).values({
    userId: me.id,
    barcode: input.barcode,
    name: input.name,
    brand: input.brand,
    imageUrl: input.imageUrl,
    servingG: input.servingG,
    calories: input.calories,
    proteinG: input.proteinG,
    carbsG: input.carbsG,
    fatG: input.fatG,
    meal: input.meal,
  })
  revalidatePath("/nutrition")
  return { ok: true }
}

export async function deleteFood(id: number) {
  const me = await ensureUser()
  if (!me) throw new Error("Not authenticated")
  await db
    .delete(nutritionLogs)
    .where(and(eq(nutritionLogs.id, id), eq(nutritionLogs.userId, me.id)))
  revalidatePath("/nutrition")
  return { ok: true }
}

export async function getTodayNutrition() {
  const me = await ensureUser()
  if (!me) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const logs = await db
    .select()
    .from(nutritionLogs)
    .where(
      and(eq(nutritionLogs.userId, me.id), sql`${nutritionLogs.createdAt} >= ${today}`),
    )
    .orderBy(desc(nutritionLogs.createdAt))

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.calories,
      proteinG: acc.proteinG + l.proteinG,
      carbsG: acc.carbsG + l.carbsG,
      fatG: acc.fatG + l.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  )

  const [goal] = await db
    .select()
    .from(nutritionGoals)
    .where(eq(nutritionGoals.userId, me.id))
    .limit(1)

  return {
    logs,
    totals,
    goal: goal ?? {
      userId: me.id,
      calories: 2000,
      proteinG: 120,
      carbsG: 250,
      fatG: 70,
      updatedAt: new Date(),
    },
  }
}

export async function updateGoals(input: {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}) {
  const me = await ensureUser()
  if (!me) throw new Error("Not authenticated")
  await db
    .insert(nutritionGoals)
    .values({ userId: me.id, ...input })
    .onConflictDoUpdate({
      target: nutritionGoals.userId,
      set: { ...input, updatedAt: new Date() },
    })
  revalidatePath("/nutrition")
  return { ok: true }
}
