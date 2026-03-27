import { useRef } from 'react'
import { Song } from '@/types'
import { SongArt } from './SongArt'
import { EqBars } from './EqBars'

interface Props {
  song: Song
  index?: number
  isActive?: boolean
  isPlaying?: boolean
  onClick: () => void
  onAction?: () => void
}

const HOLD_MS = 550
const MOVE_TOLERANCE = 10

function fmt(sec: number) {
  if (!sec || isNaN(sec)) return '0:00'
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
}

export function SongRow({
  song,
  isActive,
  isPlaying,
  onClick,
  onAction,
}: Props) {
  const timerRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const pointerIdRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)

  function clearHold() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function maybeRunAction() {
    if (!onAction) return

    const confirmed = window.confirm(`Remove "${song.name}" from your library?`)
    if (confirmed) {
      onAction()
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!onAction) return

    pointerIdRef.current = e.pointerId
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    longPressTriggeredRef.current = false

    clearHold()
    timerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true
      if ('vibrate' in navigator) {
        navigator.vibrate(14)
      }
      maybeRunAction()
    }, HOLD_MS)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== e.pointerId) return

    const deltaX = Math.abs(e.clientX - startXRef.current)
    const deltaY = Math.abs(e.clientY - startYRef.current)

    if (deltaX > MOVE_TOLERANCE || deltaY > MOVE_TOLERANCE) {
      clearHold()
    }
  }

  function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerIdRef.current !== e.pointerId) return

    pointerIdRef.current = null
    clearHold()
  }

  function handleClick() {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false
      return
    }

    onClick()
  }

  function handleContextMenu(e: React.MouseEvent<HTMLDivElement>) {
    if (!onAction) return

    e.preventDefault()
    maybeRunAction()
  }

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      className={`flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors ${
        isActive ? 'bg-white/[0.06]' : 'bg-transparent hover:bg-white/[0.03]'
      }`}
    >
      <div className="relative flex-shrink-0">
        <SongArt artUrl={song.artUrl} size={44} />
        {isActive && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[14px] bg-black/55">
            <EqBars />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[15px] font-medium ${isActive ? 'text-white' : 'text-white/88'}`}>
          {song.name}
        </p>
        <p className="mt-1 truncate text-xs text-white/42">{song.artist}</p>
      </div>

      <span className="flex-shrink-0 pr-1 text-xs tabular-nums text-white/28">{fmt(song.duration)}</span>
    </div>
  )
}
