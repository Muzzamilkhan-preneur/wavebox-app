import { useMemo, useState } from 'react'
import { Music2, Play, Search } from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { SongRow } from '@/components/SongRow'

export function LibraryView() {
  const {
    library,
    queue,
    queueIndex,
    playing,
    setQueue,
    setPlaying,
    setTab,
    removeSong,
  } = usePlayerStore()

  const [search, setSearch] = useState('')
  const activeSongId = queue[queueIndex]?.id

  const visibleSongs = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return [...library].sort((a, b) => b.addedAt - a.addedAt)

    return [...library]
      .filter((song) =>
        song.name.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
      )
      .sort((a, b) => b.addedAt - a.addedAt)
  }, [library, search])

  function playSongs(index: number) {
    if (!visibleSongs.length) return
    setQueue(visibleSongs, index)
    setPlaying(true)
    setTab('nowplaying')
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-4 sm:px-5">
      <div className="pb-4 pt-1">
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <Search size={16} className="text-white/28" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs or artists"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/24"
          />
        </div>
      </div>

      {library.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-white/[0.04]">
            <Music2 size={24} className="text-white/22" />
          </div>
          <p className="mt-5 text-2xl font-semibold tracking-[-0.05em] text-white">No songs yet</p>
          <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-white/46">
            Use the add button at the top and build a small personal library.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/32">Library</p>
              <p className="mt-1 text-sm text-white/58">
                {visibleSongs.length} track{visibleSongs.length === 1 ? '' : 's'}
              </p>
              <p className="mt-1 text-xs text-white/34">Press and hold a song to remove it.</p>
            </div>

            {visibleSongs.length > 0 && (
              <button
                onClick={() => playSongs(0)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-xs font-semibold text-[#081018] transition-transform active:scale-95"
              >
                <Play size={14} fill="currentColor" />
                Play all
              </button>
            )}
          </div>

          {visibleSongs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-sm text-white/46">No songs match your search.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {visibleSongs.map((song, index) => (
                <SongRow
                  key={song.id}
                  song={song}
                  isActive={song.id === activeSongId}
                  isPlaying={song.id === activeSongId && playing}
                  onClick={() => playSongs(index)}
                  onAction={() => removeSong(song.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
