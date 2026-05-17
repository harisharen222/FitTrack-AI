import DashboardHeader from "@/components/dashboard-header"
import NutritionDashboard from "@/components/nutrition-dashboard"
import { getTodayNutrition } from "@/lib/nutrition"

export const dynamic = "force-dynamic"

export default async function NutritionPage() {
  const data = await getTodayNutrition()
  if (!data) {
    return <div className="flex min-h-screen items-center justify-center">Sign in to track nutrition.</div>
  }
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <NutritionDashboard initial={data} />
        </div>
      </main>
    </div>
  )
}
