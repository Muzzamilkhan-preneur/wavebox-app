import { Minus, Plus, X } from 'lucide-react'
import { Song } from '@/types'
import { SongArt } from './SongArt'
import { EqBars } from './EqBars'

interface Props {
  song: Song
  index?: number
  isActive?: boolean
  isPlaying?: boolean
  actionIcon?: 'plus' | 'minus' | 'trash'
  actionTitle?: string
  actionTone?: 'accent' | 'danger' | 'neutral'
  onClick: () => void
  onAction?: () => void
}

function fmt(sec: number) {
  if (!sec || isNaN(sec)) return '0:00'
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
}

function ActionGlyph({ icon }: { icon: Props['actionIcon'] }) {
  if (icon === 'plus') return <Plus size={13} strokeWidth={2.5} />
  if (icon === 'minus') return <Minus size={13} strokeWidth={2.5} />
  return <X size={13} strokeWidth={2.5} />
}

export function SongRow({
  song,
  isActive,
  isPlaying,
  actionIcon,
  actionTitle,
  actionTone = 'neutral',
  onClick,
  onAction,
}: Props) {
  const actionToneClass =
    actionTone === 'accent'
      ? 'hover:bg-accent/12 hover:text-accent'
      : actionTone === 'danger'
        ? 'hover:bg-danger/10 hover:text-danger'
        : 'hover:bg-white/10 hover:text-white/70'

  return (
    <div
      onClick={onClick}
      className={`
        group flex cursor-pointer items-center gap-3 rounded-[20px] px-3 py-3 transition-all
        ${isActive
          ? 'bg-white/[0.08] shadow-[0_14px_34px_rgba(0,0,0,0.18)] ring-1 ring-white/8'
          : 'hover:bg-white/[0.045]'}
      `}
    >
      <div className="relative flex-shrink-0">
        <SongArt artUrl={song.artUrl} size={48} />
        {isActive && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[14px] bg-black/55">
            <EqBars />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[15px] font-medium tracking-[-0.02em] ${isActive ? 'text-white' : 'text-white/88'}`}>
          {song.name}
        </p>
        <p className="mt-1 truncate text-xs text-white/38">{song.artist}</p>
      </div>

      <span className="flex-shrink-0 text-xs tabular-nums text-white/25">{fmt(song.duration)}</span>

      {onAction && actionIcon && (
        <button
          onClick={(e) => { e.stopPropagation(); onAction() }}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white/25 opacity-0 transition-all group-hover:opacity-100 ${actionToneClass}`}
          title={actionTitle}
        >
          <ActionGlyph icon={actionIcon} />
        </button>
      )}
    </div>
  )
}
