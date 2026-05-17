"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"

type Props = {
  onDetected: (code: string) => void
  onCancel: () => void
}

declare global {
  interface Window {
    BarcodeDetector?: any
  }
}

export default function BarcodeScanner({ onDetected, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const zxingControlsRef = useRef<{ stop: () => void } | null>(null)
  const stoppedRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [engine, setEngine] = useState<"native" | "zxing" | null>(null)
  const [scans, setScans] = useState(0)

  useEffect(() => {
    let cancelled = false

    function cleanup() {
      stoppedRef.current = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      if (zxingControlsRef.current) {
        try {
          zxingControlsRef.current.stop()
        } catch {}
        zxingControlsRef.current = null
      }
      const s = streamRef.current
      if (s) s.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    async function startNative() {
      const video = videoRef.current!
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      streamRef.current = stream
      video.srcObject = stream
      await video.play()
      setLoading(false)

      const detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"],
      })
      const tick = async () => {
        if (stoppedRef.current) return
        try {
          const codes = await detector.detect(video)
          setScans((n) => n + 1)
          if (codes && codes.length > 0) {
            const raw = String(codes[0].rawValue || "").trim()
            if (raw) {
              cleanup()
              onDetected(raw)
              return
            }
          }
        } catch {}
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    async function startZXing() {
      const video = videoRef.current!
      const { BrowserMultiFormatReader } = await import("@zxing/browser")
      const { DecodeHintType, BarcodeFormat } = await import("@zxing/library")
      const hints = new Map<any, any>()
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.QR_CODE,
      ])
      hints.set(DecodeHintType.TRY_HARDER, true)

      const reader = new BrowserMultiFormatReader(hints)

      // Pick rear camera if available
      let deviceId: string | undefined
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        const back = devices.find((d) =>
          /back|rear|environment/i.test(d.label),
        )
        deviceId = back?.deviceId ?? devices[0]?.deviceId
      } catch {}

      const controls = await reader.decodeFromVideoDevice(
        deviceId ?? null,
        video,
        (result, err) => {
          if (stoppedRef.current) return
          setScans((n) => n + 1)
          if (result) {
            const raw = result.getText()
            if (raw) {
              cleanup()
              onDetected(raw.trim())
            }
          }
        },
      )
      zxingControlsRef.current = controls as any
      setLoading(false)
    }

    async function start() {
      if (typeof window === "undefined") return
      try {
        // ZXing is more reliable across platforms (BarcodeDetector silently fails
        // on Chrome desktop Windows even when present). Always use it.
        setEngine("zxing")
        await startZXing()
      } catch (e: any) {
        const msg = e?.message ?? String(e) ?? "Could not access camera"
        setError(
          /permission|denied|notallowed/i.test(msg)
            ? "Camera permission denied. Allow it in the address bar and retry."
            : msg,
        )
        setLoading(false)
      }
    }

    start()
    return () => {
      cancelled = true
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative rounded-lg overflow-hidden border bg-black">
      <video
        ref={videoRef}
        className="w-full max-h-80 object-cover"
        playsInline
        muted
        autoPlay
      />
      {loading && (
        <div className="absolute inset-0 grid place-items-center bg-black/40">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-4/5 h-32 border-2 border-emerald-400 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.5)] relative">
          <div className="absolute inset-x-0 h-0.5 bg-emerald-400 animate-pulse top-1/2" />
        </div>
      </div>
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
      {engine && !loading && (
        <div className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider bg-black/60 text-white/80 px-2 py-1 rounded">
          {engine === "native" ? "Native" : "ZXing"} · {scans} frames
        </div>
      )}
      <div className="absolute top-2 left-2 right-12 text-[10px] bg-black/60 text-white/90 px-2 py-1 rounded">
        Hold barcode flat, fill the green box, good lighting helps
      </div>
      {error && (
        <div className="absolute bottom-2 left-2 right-2 text-xs bg-red-500/90 text-white p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}
