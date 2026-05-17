"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Share2, Download, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { renderShareCard, shareOrDownloadCard, type ShareCardData } from "@/lib/share-card"

type Props = {
  data: ShareCardData
  size?: "sm" | "default" | "icon"
  variant?: "default" | "outline" | "ghost" | "secondary"
  label?: string
  className?: string
}

export default function ShareWorkoutButton({
  data,
  size = "sm",
  variant = "outline",
  label = "Share",
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const buildPreview = () => {
    start(async () => {
      const blob = await renderShareCard(data)
      setPreview(URL.createObjectURL(blob))
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) buildPreview()
        else if (preview) {
          URL.revokeObjectURL(preview)
          setPreview(null)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={className}>
          <Share2 className={label ? "h-4 w-4 mr-2" : "h-4 w-4"} />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Share your win
          </DialogTitle>
          <DialogDescription>
            Post your workout card to socials — perfect 4:5 ratio for Instagram & TikTok.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl overflow-hidden border bg-secondary/30 aspect-[4/5] flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Share preview" className="w-full h-full object-contain" />
          ) : (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button
            className="w-full gradient-bg text-white"
            disabled={pending || !preview}
            onClick={async () => {
              const result = await shareOrDownloadCard(data)
              toast.success(
                result === "shared" ? "Shared!" : "Saved to your device",
                { description: result === "downloaded" ? "Open it in your social app." : undefined },
              )
              setOpen(false)
            }}
          >
            {typeof navigator !== "undefined" && (navigator as any).canShare ? (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download PNG
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
