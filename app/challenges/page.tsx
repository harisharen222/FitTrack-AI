import DashboardHeader from "@/components/dashboard-header"
import ChallengesBoard from "@/components/challenges-board"
import { getChallenges } from "@/lib/challenge-actions"

export const dynamic = "force-dynamic"

export default async function ChallengesPage() {
  const list = await getChallenges()
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto max-w-7xl">
          <ChallengesBoard initial={list} />
        </div>
      </main>
    </div>
  )
}
