"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Apple,
  Flame,
  Drumstick,
  Wheat,
  Droplet,
  Plus,
  ScanLine,
  Search,
  Trash2,
  Target,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  deleteFood,
  logFood,
  lookupBarcode,
  searchFoods,
  updateGoals,
  type OFFProduct,
} from "@/lib/nutrition"
import BarcodeScanner from "@/components/barcode-scanner"

type Log = {
  id: number
  name: string
  brand: string | null
  imageUrl: string | null
  servingG: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  meal: string
  createdAt: Date | string
}

type Totals = { calories: number; proteinG: number; carbsG: number; fatG: number }
type Goal = Totals

type Initial = {
  logs: Log[]
  totals: Totals
  goal: Goal
}

const MEALS = [
  { id: "breakfast", label: "Breakfast", emoji: "🍳" },
  { id: "lunch", label: "Lunch", emoji: "🥗" },
  { id: "dinner", label: "Dinner", emoji: "🍽️" },
  { id: "snack", label: "Snack", emoji: "🍿" },
] as const

export default function NutritionDashboard({ initial }: { initial: Initial }) {
  const [logs, setLogs] = useState(initial.logs)
  const [totals, setTotals] = useState(initial.totals)
  const [goal, setGoal] = useState(initial.goal)
  const [addOpen, setAddOpen] = useState(false)
  const [goalsOpen, setGoalsOpen] = useState(false)

  const onLogged = (l: Log) => {
    setLogs((prev) => [l, ...prev])
    setTotals((t) => ({
      calories: t.calories + l.calories,
      proteinG: t.proteinG + l.proteinG,
      carbsG: t.carbsG + l.carbsG,
      fatG: t.fatG + l.fatG,
    }))
  }

  const onDeleted = (id: number) => {
    const l = logs.find((x) => x.id === id)
    if (!l) return
    setLogs((prev) => prev.filter((x) => x.id !== id))
    setTotals((t) => ({
      calories: t.calories - l.calories,
      proteinG: t.proteinG - l.proteinG,
      carbsG: t.carbsG - l.carbsG,
      fatG: t.fatG - l.fatG,
    }))
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl border overflow-hidden p-6 md:p-8 bg-gradient-to-br from-emerald-500/10 via-lime-500/10 to-yellow-500/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Today’s nutrition</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              <span className="gradient-text">{totals.calories}</span>
              <span className="text-muted-foreground text-xl"> / {goal.calories} kcal</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Goals
                </Button>
              </DialogTrigger>
              <GoalsDialog
                goal={goal}
                onSave={(g) => {
                  setGoal(g)
                  setGoalsOpen(false)
                }}
              />
            </Dialog>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-bg text-white hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Log food
                </Button>
              </DialogTrigger>
              <AddFoodDialog
                onLogged={(l) => {
                  onLogged(l)
                  setAddOpen(false)
                }}
              />
            </Dialog>
          </div>
        </div>
        <div className="mt-6 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Macro icon={Flame} label="Calories" value={totals.calories} goal={goal.calories} unit="kcal" grad="from-orange-500/20 to-rose-500/20" />
          <Macro icon={Drumstick} label="Protein" value={totals.proteinG} goal={goal.proteinG} unit="g" grad="from-red-500/20 to-pink-500/20" />
          <Macro icon={Wheat} label="Carbs" value={totals.carbsG} goal={goal.carbsG} unit="g" grad="from-amber-500/20 to-yellow-500/20" />
          <Macro icon={Droplet} label="Fat" value={totals.fatG} goal={goal.fatG} unit="g" grad="from-sky-500/20 to-blue-500/20" />
        </div>
      </div>

      {/* Meals */}
      <div className="grid gap-4 md:grid-cols-2">
        {MEALS.map((m) => {
          const items = logs.filter((l) => l.meal === m.id)
          const cals = items.reduce((s, l) => s + l.calories, 0)
          return (
            <Card key={m.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">{m.emoji}</span>
                    {m.label}
                  </CardTitle>
                  <CardDescription>
                    {items.length} item{items.length === 1 ? "" : "s"} · {cals} kcal
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-6 border border-dashed rounded-lg">
                    Nothing logged yet
                  </div>
                ) : (
                  <ul className="divide-y divide-border/60">
                    {items.map((l) => (
                      <FoodRow key={l.id} log={l} onDelete={onDeleted} />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function Macro({
  icon: Icon,
  label,
  value,
  goal,
  unit,
  grad,
}: {
  icon: any
  label: string
  value: number
  goal: number
  unit: string
  grad: string
}) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  return (
    <div className={cn("rounded-2xl border p-5 bg-gradient-to-br", grad)}>
      <Icon className="h-5 w-5 mb-3" />
      <div className="text-2xl font-bold">
        {value}
        <span className="text-sm font-normal text-muted-foreground"> / {goal} {unit}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1 mb-2">{label}</div>
      <Progress value={pct} className="h-1.5" />
    </div>
  )
}

function FoodRow({ log, onDelete }: { log: Log; onDelete: (id: number) => void }) {
  const [pending, start] = useTransition()
  return (
    <li className="flex items-center justify-between py-2.5 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {log.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={log.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-secondary grid place-items-center">
            <Apple className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-medium truncate">{log.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {log.brand ? `${log.brand} · ` : ""}{log.servingG} g · {log.proteinG}P / {log.carbsG}C / {log.fatG}F
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <div className="font-semibold">{log.calories}</div>
          <div className="text-[10px] text-muted-foreground">kcal</div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await deleteFood(log.id)
              onDelete(log.id)
            })
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}

function AddFoodDialog({ onLogged }: { onLogged: (l: Log) => void }) {
  const [tab, setTab] = useState<"scan" | "search" | "manual">("search")
  const [product, setProduct] = useState<OFFProduct | null>(null)

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Log food</DialogTitle>
        <DialogDescription>
          Scan a barcode, search Open Food Facts, or enter manually.
        </DialogDescription>
      </DialogHeader>
      {product ? (
        <PortionForm product={product} onBack={() => setProduct(null)} onLogged={onLogged} />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="search"><Search className="mr-2 h-4 w-4" />Search</TabsTrigger>
            <TabsTrigger value="scan"><ScanLine className="mr-2 h-4 w-4" />Scan</TabsTrigger>
            <TabsTrigger value="manual"><Plus className="mr-2 h-4 w-4" />Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            <SearchPanel onProduct={setProduct} />
          </TabsContent>
          <TabsContent value="scan">
            <ScanPanel onProduct={setProduct} />
          </TabsContent>
          <TabsContent value="manual">
            <ManualPanel onProduct={setProduct} />
          </TabsContent>
        </Tabs>
      )}
    </DialogContent>
  )
}

function ScanPanel({ onProduct }: { onProduct: (p: OFFProduct) => void }) {
  const [scanning, setScanning] = useState(false)
  const [manual, setManual] = useState("")
  const [pending, start] = useTransition()

  const lookup = (code: string) => {
    start(async () => {
      const p = await lookupBarcode(code)
      if (!p) {
        toast.error("Product not found", { description: `Barcode ${code} isn’t in Open Food Facts.` })
        return
      }
      toast.success("Found it!", { description: p.name })
      onProduct(p)
    })
  }

  return (
    <div className="space-y-4 pt-2">
      {scanning ? (
        <BarcodeScanner
          onDetected={(code) => {
            setScanning(false)
            lookup(code)
          }}
          onCancel={() => setScanning(false)}
        />
      ) : (
        <Button onClick={() => setScanning(true)} className="w-full" size="lg">
          <ScanLine className="mr-2 h-4 w-4" />
          Start camera scan
        </Button>
      )}
      <div className="text-xs text-muted-foreground text-center">— or enter a barcode —</div>
      <div className="flex gap-2">
        <Input
          inputMode="numeric"
          placeholder="e.g. 5449000000996"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
        />
        <Button
          disabled={pending || manual.length < 6}
          onClick={() => lookup(manual)}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Look up"}
        </Button>
      </div>
    </div>
  )
}

function SearchPanel({ onProduct }: { onProduct: (p: OFFProduct) => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<OFFProduct[]>([])
  const [pending, start] = useTransition()

  const run = () => {
    start(async () => {
      const r = await searchFoods(q)
      setResults(r)
      if (r.length === 0) toast.info("No matches", { description: `Nothing found for “${q}”.` })
    })
  }

  return (
    <div className="space-y-3 pt-2">
      <div className="flex gap-2">
        <Input
          placeholder="Search e.g. ‘greek yogurt’"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
        <Button disabled={pending || q.length < 2} onClick={run}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
      <ul className="max-h-80 overflow-auto divide-y divide-border/60 rounded-lg border">
        {results.map((p, i) => (
          <li
            key={`${p.barcode}-${i}`}
            className="flex items-center gap-3 p-2 hover:bg-secondary/50 cursor-pointer"
            onClick={() => onProduct(p)}
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
            ) : (
              <div className="h-10 w-10 rounded bg-secondary grid place-items-center">
                <Apple className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate text-sm">{p.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {p.brand ?? "—"} · {p.calories} kcal / 100 g
              </div>
            </div>
          </li>
        ))}
        {results.length === 0 && (
          <li className="text-center text-sm text-muted-foreground py-8">
            Search Open Food Facts (1.5M+ products)
          </li>
        )}
      </ul>
    </div>
  )
}

function ManualPanel({ onProduct }: { onProduct: (p: OFFProduct) => void }) {
  const [form, setForm] = useState({
    name: "",
    calories: "",
    proteinG: "",
    carbsG: "",
    fatG: "",
  })
  return (
    <div className="space-y-3 pt-2">
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div><Label>Cal</Label><Input inputMode="numeric" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} /></div>
        <div><Label>Protein</Label><Input inputMode="numeric" value={form.proteinG} onChange={(e) => setForm({ ...form, proteinG: e.target.value })} /></div>
        <div><Label>Carbs</Label><Input inputMode="numeric" value={form.carbsG} onChange={(e) => setForm({ ...form, carbsG: e.target.value })} /></div>
        <div><Label>Fat</Label><Input inputMode="numeric" value={form.fatG} onChange={(e) => setForm({ ...form, fatG: e.target.value })} /></div>
      </div>
      <Button
        className="w-full"
        disabled={!form.name || !form.calories}
        onClick={() =>
          onProduct({
            barcode: "",
            name: form.name,
            servingG: 100,
            calories: Number(form.calories) || 0,
            proteinG: Number(form.proteinG) || 0,
            carbsG: Number(form.carbsG) || 0,
            fatG: Number(form.fatG) || 0,
          })
        }
      >
        Continue
      </Button>
    </div>
  )
}

function PortionForm({
  product,
  onBack,
  onLogged,
}: {
  product: OFFProduct
  onBack: () => void
  onLogged: (l: Log) => void
}) {
  const [grams, setGrams] = useState(100)
  const [meal, setMeal] = useState<"breakfast" | "lunch" | "dinner" | "snack">(currentMeal())
  const [pending, start] = useTransition()

  const factor = grams / 100
  const scaled = {
    calories: Math.round(product.calories * factor),
    proteinG: Math.round(product.proteinG * factor),
    carbsG: Math.round(product.carbsG * factor),
    fatG: Math.round(product.fatG * factor),
  }

  const submit = () => {
    start(async () => {
      await logFood({
        barcode: product.barcode || undefined,
        name: product.name,
        brand: product.brand,
        imageUrl: product.imageUrl,
        servingG: grams,
        ...scaled,
        meal,
      })
      onLogged({
        id: Date.now(),
        name: product.name,
        brand: product.brand ?? null,
        imageUrl: product.imageUrl ?? null,
        servingG: grams,
        ...scaled,
        meal,
        createdAt: new Date(),
      })
      toast.success("Logged!", { description: `${scaled.calories} kcal added.` })
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/30">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="h-14 w-14 rounded object-cover" />
        ) : (
          <div className="h-14 w-14 rounded bg-secondary grid place-items-center">
            <Apple className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold truncate">{product.name}</div>
          <div className="text-xs text-muted-foreground truncate">
            {product.brand ?? "—"} · {product.calories} kcal / 100 g
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Serving (g)</Label>
          <Input
            inputMode="numeric"
            value={grams}
            onChange={(e) => setGrams(Math.max(1, Number(e.target.value) || 0))}
          />
        </div>
        <div>
          <Label>Meal</Label>
          <Select value={meal} onValueChange={(v) => setMeal(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MEALS.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.emoji} {m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <PreviewStat label="kcal" value={scaled.calories} />
        <PreviewStat label="P" value={scaled.proteinG} />
        <PreviewStat label="C" value={scaled.carbsG} />
        <PreviewStat label="F" value={scaled.fatG} />
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button className="gradient-bg text-white" disabled={pending} onClick={submit}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Add to {meal}
        </Button>
      </DialogFooter>
    </div>
  )
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-2 bg-secondary/30">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}

function GoalsDialog({ goal, onSave }: { goal: Goal; onSave: (g: Goal) => void }) {
  const [form, setForm] = useState(goal)
  const [pending, start] = useTransition()
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Daily goals</DialogTitle>
        <DialogDescription>Set your macro and calorie targets.</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        {(["calories", "proteinG", "carbsG", "fatG"] as const).map((k) => (
          <div key={k}>
            <Label className="capitalize">{k.replace("G", " (g)")}</Label>
            <Input
              inputMode="numeric"
              value={form[k]}
              onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) || 0 })}
            />
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button
          className="gradient-bg text-white"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await updateGoals({
                calories: form.calories,
                proteinG: form.proteinG,
                carbsG: form.carbsG,
                fatG: form.fatG,
              })
              toast.success("Goals saved")
              onSave(form)
            })
          }
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

function currentMeal(): "breakfast" | "lunch" | "dinner" | "snack" {
  const h = new Date().getHours()
  if (h < 10) return "breakfast"
  if (h < 14) return "lunch"
  if (h < 21) return "dinner"
  return "snack"
}
