import { ListMusic } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { SongRow } from './SongRow'

export function QueueView() {
  const { queue, queueIndex, playing, clearQueue, jumpTo, setPlaying, setTab } = usePlayerStore()

  function handleClick(i: number) {
    jumpTo(i)
    setPlaying(true)
    setTab('nowplaying')
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-4">
      <div className="mb-5 flex items-end justify-between gap-4 pt-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/36">Queue</p>
          <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-white">Up next</h2>
          <p className="mt-2 text-sm text-white/40">
            {queue.length ? `${queue.length} tracks lined up for this session.` : 'No tracks are waiting right now.'}
          </p>
        </div>

        {queue.length > 0 && (
          <button
            onClick={clearQueue}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/44 transition-colors hover:border-danger/35 hover:bg-danger/10 hover:text-danger"
          >
            Clear all
          </button>
        )}
      </div>

      {queue.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.035] px-8 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.06]">
            <ListMusic size={24} className="text-white/20" />
          </div>
          <p className="mt-5 text-lg font-semibold text-white/88">Queue is empty</p>
          <p className="mt-2 max-w-[230px] text-sm leading-relaxed text-white/42">
            Start a track from the library and Wavebox will line the rest up automatically.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {queue.map((song, i) => (
            <SongRow
              key={`${song.id}_${i}`}
              song={song}
              isActive={i === queueIndex}
              isPlaying={i === queueIndex && playing}
              onClick={() => handleClick(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
