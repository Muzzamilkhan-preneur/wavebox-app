import { Music2 } from 'lucide-react'

interface Props {
  artUrl: string | null
  size?: number
  className?: string
}

export function SongArt({ artUrl, size = 44, className = '' }: Props) {
  return (
    <div
      className={`flex-shrink-0 overflow-hidden rounded-[14px] bg-white/[0.04] ${className}`}
      style={{ width: size, height: size }}
    >
      {artUrl ? (
        <img src={artUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
          <Music2 size={size * 0.36} className="text-white/24" />
        </div>
      )}
    </div>
  )
}
