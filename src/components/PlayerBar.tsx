import { SkipBack, SkipForward, Play, Pause, Music2 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useAudio } from '@/hooks/useAudio'

export function PlayerBar() {
  const { queue, queueIndex, playing, setPlaying, nextSong, prevSong, setTab } = usePlayerStore()
  const { progress } = useAudio()
  const song = queue[queueIndex] ?? null

  return (
    <div className="relative z-10 shrink-0 px-4 pb-4 pt-3">
      <div className="pointer-events-none absolute inset-x-12 top-0 h-10 bg-[radial-gradient(circle,rgba(137,255,211,0.18),transparent_70%)] blur-2xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div
          className="absolute left-0 top-0 h-[3px] bg-[linear-gradient(90deg,#90ffd4,#61d5ff)] transition-[width] duration-500 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />

        <div className="flex items-center gap-3 px-4 py-4">
          <div
            className="flex cursor-pointer items-center justify-center"
            onClick={() => setTab('nowplaying')}
          >
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.06]">
              {song?.artUrl
                ? <img src={song.artUrl} alt="" className="h-full w-full object-cover" />
                : <Music2 size={20} className="text-white/22" />
              }
            </div>
          </div>

          <div
            className="min-w-0 flex-1 cursor-pointer"
            onClick={() => setTab('nowplaying')}
          >
            <p className="truncate text-[15px] font-medium tracking-[-0.02em] text-white/92">
              {song?.name ?? 'No song selected'}
            </p>
            <p className="mt-1 truncate text-xs text-white/38">
              {song?.artist ?? 'Choose something from your library'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={prevSong}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/42 transition-colors hover:text-white/82 active:scale-95"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>

            <button
              onClick={() => setPlaying(!playing)}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#a4ffd9,#5ed3ff)] text-[#04100d] shadow-[0_18px_40px_rgba(102,228,198,0.32)] transition-all hover:scale-[1.02] active:scale-[0.96]"
            >
              {playing
                ? <Pause size={18} fill="currentColor" />
                : <Play  size={18} fill="currentColor" className="translate-x-px" />
              }
            </button>

            <button
              onClick={nextSong}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/42 transition-colors hover:text-white/82 active:scale-95"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
