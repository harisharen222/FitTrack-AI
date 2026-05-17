import { redirect } from "next/navigation"
import MonthlyReportView from "@/components/monthly-report-view"
import { getMonthlyReport } from "@/lib/reports"

export const dynamic = "force-dynamic"

type Search = { month?: string; year?: string }

export default async function MonthlyReportPage({
  searchParams,
}: {
  searchParams: Promise<Search> | Search
}) {
  const params = await Promise.resolve(searchParams)
  const now = new Date()
  const year = Number(params.year) || now.getUTCFullYear()
  const month = Number(params.month) || now.getUTCMonth() + 1
  if (year < 2000 || month < 1 || month > 12) redirect("/reports/monthly")
  const report = await getMonthlyReport(year, month)
  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Sign in to view your monthly report.
      </div>
    )
  }
  return <MonthlyReportView report={report} />
}
