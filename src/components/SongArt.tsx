import { Music2 } from 'lucide-react'

interface Props {
  artUrl: string | null
  size?: number
  className?: string
}

export function SongArt({ artUrl, size = 44, className = '' }: Props) {
  return (
    <div
      className={`flex-shrink-0 overflow-hidden rounded-[14px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.02))] shadow-[0_10px_28px_rgba(0,0,0,0.18)] ${className}`}
      style={{ width: size, height: size }}
    >
      {artUrl ? (
        <img src={artUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_35%_35%,rgba(139,255,212,0.16),transparent_44%),radial-gradient(circle_at_70%_75%,rgba(96,152,255,0.12),transparent_42%),rgba(255,255,255,0.02)]">
          <Music2 size={size * 0.4} className="text-white/26" />
        </div>
      )}
    </div>
  )
}
