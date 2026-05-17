"use client"

import { useMemo, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, Trophy, Clock, CheckCircle2, XCircle, Sparkles, Loader2, Play, Ban } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { DIFFICULTY_META, type Difficulty } from "@/lib/challenges"
import {
  abandonChallenge,
  enrollChallenge,
  type ChallengeWithProgress,
} from "@/lib/challenge-actions"

const DIFFICULTIES: (Difficulty | "all")[] = ["all", "beginner", "intermediate", "advanced", "elite"]
const CATEGORIES = ["all", "strength", "cardio", "core", "consistency", "variety"] as const

export default function ChallengesBoard({ initial }: { initial: ChallengeWithProgress[] }) {
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all")
  const [tab, setTab] = useState<"explore" | "active" | "completed">("explore")

  const filtered = useMemo(() => {
    return initial.filter((c) => {
      if (difficulty !== "all" && c.challenge.difficulty !== difficulty) return false
      if (category !== "all" && c.challenge.category !== category) return false
      if (tab === "active") return c.status === "active"
      if (tab === "completed") return c.status === "completed"
      return c.status === "available" || c.status === "failed"
    })
  }, [initial, difficulty, category, tab])

  const counts = useMemo(() => {
    return {
      active: initial.filter((c) => c.status === "active").length,
      completed: initial.filter((c) => c.status === "completed").length,
    }
  }, [initial])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl border overflow-hidden p-6 md:p-8 bg-gradient-to-br from-rose-500/10 via-fuchsia-500/10 to-violet-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Push your limits</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="gradient-text">Challenges</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-lg">
              Pick a challenge. Earn XP. Build the streak. From 7-day starters to 66-day habit forges.
            </p>
          </div>
          <div className="flex gap-3">
            <Stat label="Active" value={counts.active} icon={Flame} accent="text-orange-500" />
            <Stat label="Completed" value={counts.completed} icon={Trophy} accent="text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      {tab === "explore" && (
        <div className="space-y-3">
          <FilterRow
            label="Difficulty"
            value={difficulty}
            options={DIFFICULTIES.map((d) => ({
              value: d,
              label: d === "all" ? "All" : DIFFICULTY_META[d as Difficulty].label,
            }))}
            onChange={(v) => setDifficulty(v as any)}
          />
          <FilterRow
            label="Category"
            value={category}
            options={CATEGORIES.map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))}
            onChange={(v) => setCategory(v as any)}
          />
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
            No challenges match your filters.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <ChallengeCard key={c.challenge.id} item={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs uppercase tracking-wider text-muted-foreground w-20">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition border",
              value === o.value
                ? "bg-foreground text-background border-transparent"
                : "bg-secondary/40 text-muted-foreground hover:bg-secondary border-border/60",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon, accent }: any) {
  return (
    <div className="rounded-xl border px-4 py-3 bg-background/60">
      <Icon className={cn("h-4 w-4 mb-1", accent)} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  )
}

function ChallengeCard({ item }: { item: ChallengeWithProgress }) {
  const { challenge: c, status, progress, target, daysLeft, enrollmentId } = item
  const pct = target > 0 ? Math.min(100, (progress / target) * 100) : 0
  const diff = DIFFICULTY_META[c.difficulty]
  const [pending, start] = useTransition()

  return (
    <Card className={cn("overflow-hidden bg-gradient-to-br", c.gradient, status === "completed" && "ring-2 ring-yellow-500/50")}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="text-3xl shrink-0">{c.emoji}</div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate">{c.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>
            </div>
          </div>
          <Badge className={cn("shrink-0 bg-gradient-to-r text-white border-transparent", diff.color)}>
            {diff.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.durationDays}d</span>
          <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />{c.xpReward} XP</span>
          <span className="capitalize ml-auto">{c.category}</span>
        </div>

        {status !== "available" && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{progress} / {target}</span>
              <span className="text-muted-foreground">
                {status === "active" && daysLeft !== undefined && `${daysLeft}d left`}
                {status === "completed" && "Completed!"}
                {status === "failed" && "Time’s up"}
              </span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
        )}

        <div className="flex gap-2">
          {status === "available" && (
            <Button
              className="w-full gradient-bg text-white"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await enrollChallenge(c.id)
                  toast.success("Challenge accepted!", { description: c.title })
                  location.reload()
                })
              }
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              Accept
            </Button>
          )}
          {status === "active" && enrollmentId && (
            <Button
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  if (!confirm("Abandon this challenge? Progress will be lost.")) return
                  await abandonChallenge(enrollmentId)
                  toast.info("Challenge abandoned")
                  location.reload()
                })
              }
            >
              <Ban className="h-4 w-4 mr-2" />
              Abandon
            </Button>
          )}
          {status === "completed" && (
            <div className="w-full text-center text-sm font-semibold text-yellow-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Mastered
            </div>
          )}
          {status === "failed" && (
            <Button
              variant="outline"
              className="w-full"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  if (enrollmentId) await abandonChallenge(enrollmentId)
                  await enrollChallenge(c.id)
                  toast.success("Restarted!", { description: c.title })
                  location.reload()
                })
              }
            >
              <XCircle className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
