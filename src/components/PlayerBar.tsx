import { SkipBack, SkipForward, Play, Pause, Music2, Disc3 } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useAudio } from '@/hooks/useAudio'

export function PlayerBar() {
  const { queue, queueIndex, playing, setPlaying, nextSong, prevSong, setTab } = usePlayerStore()
  const { progress } = useAudio()
  const song = queue[queueIndex] ?? null

  return (
    <div className="relative z-10 shrink-0 border-t border-white/8 bg-[#0a1017] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:rounded-b-[28px] sm:px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="h-[2px] flex-1 rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#90ffd4,#61d5ff)] transition-[width] duration-300 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <button
          onClick={() => setTab('nowplaying')}
          className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/34"
        >
          <Disc3 size={12} />
          Player
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setTab('nowplaying')}
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.05]"
        >
          {song?.artUrl ? (
            <img src={song.artUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <Music2 size={18} className="text-white/30" />
          )}
        </button>

        <button
          onClick={() => setTab('nowplaying')}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate text-sm font-medium text-white/92">
            {song?.name ?? 'No song selected'}
          </p>
          <p className="mt-1 truncate text-xs text-white/40">
            {song?.artist ?? 'Add music to start listening'}
          </p>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={prevSong}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/48 transition-colors hover:text-white/88"
            title="Previous"
          >
            <SkipBack size={18} fill="currentColor" />
          </button>

          <button
            onClick={() => setPlaying(!playing)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#081018] transition-transform active:scale-95"
            title={playing ? 'Pause' : 'Play'}
          >
            {playing
              ? <Pause size={18} fill="currentColor" />
              : <Play size={18} fill="currentColor" className="translate-x-px" />
            }
          </button>

          <button
            onClick={nextSong}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/48 transition-colors hover:text-white/88"
            title="Next"
          >
            <SkipForward size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  )
}
