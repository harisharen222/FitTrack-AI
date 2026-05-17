export type ShareCardData = {
  username: string
  level: number
  exerciseName: string
  exerciseEmoji: string
  reps: number
  xpEarned: number
  isPR?: boolean
  date?: Date
  variant?: "workout" | "achievement" | "streak" | "challenge"
  subtitle?: string
}

const GRADIENTS: Record<NonNullable<ShareCardData["variant"]>, [string, string, string]> = {
  workout: ["#10b981", "#14b8a6", "#8b5cf6"],
  achievement: ["#f59e0b", "#ef4444", "#ec4899"],
  streak: ["#fb923c", "#f43f5e", "#a855f7"],
  challenge: ["#a855f7", "#d946ef", "#f43f5e"],
}

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  const W = 1080
  const H = 1350
  const variant = data.variant ?? "workout"
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")!

  // Background gradient
  const [c1, c2, c3] = GRADIENTS[variant]
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, c1)
  bg.addColorStop(0.5, c2)
  bg.addColorStop(1, c3)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Subtle blob highlights
  drawBlob(ctx, W * 0.2, H * 0.15, 380, "rgba(255,255,255,0.15)")
  drawBlob(ctx, W * 0.85, H * 0.75, 460, "rgba(0,0,0,0.18)")

  // Glass card panel
  roundRect(ctx, 60, 220, W - 120, H - 400, 48)
  ctx.fillStyle = "rgba(15, 23, 42, 0.55)"
  ctx.fill()
  ctx.strokeStyle = "rgba(255,255,255,0.15)"
  ctx.lineWidth = 2
  ctx.stroke()

  // Logo / brand top-left
  ctx.fillStyle = "white"
  ctx.font = "700 44px system-ui, -apple-system, 'Segoe UI', sans-serif"
  ctx.textAlign = "left"
  ctx.fillText("⚡ FitTrack AI", 80, 130)

  // Date top-right
  ctx.font = "500 28px system-ui, -apple-system, 'Segoe UI', sans-serif"
  ctx.fillStyle = "rgba(255,255,255,0.7)"
  ctx.textAlign = "right"
  const d = data.date ?? new Date()
  ctx.fillText(
    d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    W - 80,
    130,
  )

  // Badge if PR
  if (data.isPR) {
    const bx = W / 2,
      by = 195
    ctx.fillStyle = "#fde047"
    roundRect(ctx, bx - 90, by - 30, 180, 50, 25)
    ctx.fill()
    ctx.fillStyle = "#1f2937"
    ctx.font = "800 26px system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("⭐ NEW PR", bx, by + 8)
  }

  // Big emoji
  ctx.font = "260px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji'"
  ctx.textAlign = "center"
  ctx.fillText(data.exerciseEmoji, W / 2, 540)

  // Exercise name
  ctx.fillStyle = "white"
  ctx.font = "800 64px system-ui, sans-serif"
  ctx.fillText(data.exerciseName.toUpperCase(), W / 2, 640)

  // Subtitle (variant-specific)
  if (data.subtitle) {
    ctx.fillStyle = "rgba(255,255,255,0.75)"
    ctx.font = "500 32px system-ui, sans-serif"
    ctx.fillText(data.subtitle, W / 2, 690)
  }

  // Huge reps number
  ctx.fillStyle = "white"
  ctx.font = "900 280px system-ui, sans-serif"
  ctx.fillText(String(data.reps), W / 2, 970)

  ctx.fillStyle = "rgba(255,255,255,0.75)"
  ctx.font = "600 38px system-ui, sans-serif"
  ctx.fillText("REPS", W / 2, 1030)

  // Bottom stat strip
  const stripY = 1110
  ctx.fillStyle = "rgba(255,255,255,0.1)"
  roundRect(ctx, 100, stripY, W - 200, 160, 28)
  ctx.fill()

  // Three stats
  const stats = [
    { label: "ATHLETE", value: `@${data.username}` },
    { label: "LEVEL", value: String(data.level) },
    { label: "XP EARNED", value: `+${data.xpEarned}` },
  ]
  const colW = (W - 200) / stats.length
  stats.forEach((s, i) => {
    const cx = 100 + colW * i + colW / 2
    ctx.fillStyle = "rgba(255,255,255,0.55)"
    ctx.font = "700 22px system-ui, sans-serif"
    ctx.fillText(s.label, cx, stripY + 56)
    ctx.fillStyle = "white"
    ctx.font = "800 52px system-ui, sans-serif"
    ctx.fillText(s.value, cx, stripY + 118)
  })

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.6)"
  ctx.font = "500 28px system-ui, sans-serif"
  ctx.fillText("Train smarter with AI · fittrack.ai", W / 2, H - 50)

  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/png", 0.95),
  )
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawBlob(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  g.addColorStop(0, color)
  g.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
}

export async function shareOrDownloadCard(data: ShareCardData) {
  const blob = await renderShareCard(data)
  const file = new File([blob], `fittrack-${Date.now()}.png`, { type: "image/png" })

  const nav = navigator as any
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: "My FitTrack workout",
        text: `Just crushed ${data.reps} ${data.exerciseName} on FitTrack AI! 💪`,
      })
      return "shared" as const
    } catch {
      // user cancelled — fall through to download
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return "downloaded" as const
}
