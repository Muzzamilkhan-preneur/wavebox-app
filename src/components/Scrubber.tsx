import { useRef } from 'react'

interface Props {
  progress: number
  currentTime: number
  duration: number
  onSeek: (pct: number) => void
}

function fmt(sec: number) {
  if (!sec || isNaN(sec)) return '0:00'
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
}

export function Scrubber({ progress, currentTime, duration, onSeek }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  function calcPct(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  return (
    <div className="w-full px-0">
      <div
        ref={trackRef}
        className="group relative mb-3 h-2 cursor-pointer rounded-full bg-white/[0.08]"
        onPointerDown={(e) => {
          trackRef.current?.setPointerCapture(e.pointerId)
          onSeek(calcPct(e.clientX))
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 1) return
          onSeek(calcPct(e.clientX))
        }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[linear-gradient(90deg,#90ffd4,#61d5ff)] transition-all pointer-events-none"
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-white shadow-[0_0_28px_rgba(255,255,255,0.36)] opacity-0 transition-opacity pointer-events-none group-hover:opacity-100"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] tabular-nums text-white/32">
        <span>{fmt(currentTime)}</span>
        <span>{fmt(duration)}</span>
      </div>
    </div>
  )
}
