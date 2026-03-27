import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, FolderPlus, Heart, Music2, Play, Search, Trash2, Upload } from 'lucide-react'
import { showToast } from '@/components/Toast'
import { usePlayerStore } from '@/store/playerStore'
import { UploadZone } from '@/components/UploadZone'
import { SongRow } from '@/components/SongRow'
import { Playlist, Song } from '@/types'
import { createBackupFile, validateBackupFile } from '@/utils/backup'

type SortMode = 'recent' | 'title' | 'artist' | 'duration'

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: 'recent', label: 'Recent' },
  { id: 'title', label: 'Title' },
  { id: 'artist', label: 'Artist' },
  { id: 'duration', label: 'Length' },
]

function buildPlaylistSongs(playlist: Playlist | undefined, library: Song[]) {
  if (!playlist) return []
  const songsById = new Map(library.map((song) => [song.id, song]))
  return playlist.songIds.map((id) => songsById.get(id)).filter(Boolean) as Song[]
}

function defaultPlaylistName(sourceLabel: string, playlistsCount: number) {
  const trimmed = sourceLabel.trim()
  if (trimmed) return `${trimmed} Mix`
  return `Playlist ${playlistsCount + 1}`
}

export function LibraryView() {
  const {
    library,
    playlists,
    removeSong,
    addSongToPlaylist,
    removeSongFromPlaylist,
    createPlaylist,
    deletePlaylist,
    queue,
    queueIndex,
    playing,
    setQueue,
    setPlaying,
    setTab,
    replaceFromBackup,
    shuffle,
    repeat,
    volume,
    activeTab,
  } = usePlayerStore()

  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [collectionId, setCollectionId] = useState<string>('all')
  const [quickAddPlaylistId, setQuickAddPlaylistId] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const activeSongId = queue[queueIndex]?.id
  const currentSong = queue[queueIndex] ?? null

  useEffect(() => {
    if (collectionId !== 'all' && collectionId !== 'liked' && !playlists.some((playlist) => playlist.id === collectionId)) {
      setCollectionId('all')
    }

    if (quickAddPlaylistId && !playlists.some((playlist) => playlist.id === quickAddPlaylistId)) {
      setQuickAddPlaylistId('')
    }
  }, [collectionId, playlists, quickAddPlaylistId])

  const selectedPlaylist = playlists.find((playlist) => playlist.id === collectionId)
  const quickAddPlaylist = playlists.find((playlist) => playlist.id === quickAddPlaylistId)

  const scopedSongs = useMemo(() => {
    if (selectedPlaylist) return buildPlaylistSongs(selectedPlaylist, library)
    if (collectionId === 'liked') return library.filter((song) => song.liked)
    return library
  }, [collectionId, library, selectedPlaylist])

  const visibleSongs = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = query
      ? scopedSongs.filter((song) =>
          song.name.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
        )
      : scopedSongs

    const next = [...filtered]
    next.sort((a, b) => {
      if (sortMode === 'title') return a.name.localeCompare(b.name)
      if (sortMode === 'artist') return a.artist.localeCompare(b.artist)
      if (sortMode === 'duration') return b.duration - a.duration
      return b.addedAt - a.addedAt
    })
    return next
  }, [scopedSongs, search, sortMode])

  function playFromVisible(idx: number) {
    if (!visibleSongs.length) return
    setQueue([...visibleSongs], idx)
    setPlaying(true)
    setTab('nowplaying')
  }

  function promptForPlaylist(seedSongIds: string[] = []) {
    const suggestedName = defaultPlaylistName(search || (selectedPlaylist?.name ?? ''), playlists.length)
    const name = window.prompt('Playlist name', suggestedName)
    if (!name) return

    const playlistId = createPlaylist(name, seedSongIds)
    if (playlistId) {
      setCollectionId(playlistId)
      setQuickAddPlaylistId((current) => current || playlistId)
    }
  }

  function currentCollectionLabel() {
    if (selectedPlaylist) return selectedPlaylist.name
    if (collectionId === 'liked') return 'Favorites'
    return 'All Tracks'
  }

  function playlistMembershipAction(song: Song) {
    if (selectedPlaylist) {
      return {
        actionIcon: 'minus' as const,
        actionTitle: `Remove from ${selectedPlaylist.name}`,
        actionTone: 'danger' as const,
        onAction: () => removeSongFromPlaylist(selectedPlaylist.id, song.id),
      }
    }

    if (quickAddPlaylist) {
      const included = quickAddPlaylist.songIds.includes(song.id)
      return included
        ? {
            actionIcon: 'minus' as const,
            actionTitle: `Remove from ${quickAddPlaylist.name}`,
            actionTone: 'danger' as const,
            onAction: () => removeSongFromPlaylist(quickAddPlaylist.id, song.id),
          }
        : {
            actionIcon: 'plus' as const,
            actionTitle: `Add to ${quickAddPlaylist.name}`,
            actionTone: 'accent' as const,
            onAction: () => addSongToPlaylist(quickAddPlaylist.id, song.id),
          }
    }

    return {
      actionIcon: 'trash' as const,
      actionTitle: 'Remove song',
      actionTone: 'danger' as const,
      onAction: () => removeSong(song.id),
    }
  }

  const collectionChips = [
    { id: 'all', label: 'All', count: library.length },
    { id: 'liked', label: 'Favorites', count: library.filter((song) => song.liked).length },
    ...playlists.map((playlist) => ({
      id: playlist.id,
      label: playlist.name,
      count: playlist.songIds.length,
    })),
  ]

  function exportBackup() {
    const backup = createBackupFile({
      library,
      queueIds: queue.map((song) => song.id),
      queueIndex,
      shuffle,
      repeat,
      volume,
      activeTab,
      playlists,
    })

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `wavebox-backup-${stamp}.json`
    link.click()

    URL.revokeObjectURL(url)
    showToast('Backup exported')
  }

  async function importBackup(file: File) {
    try {
      const parsed = JSON.parse(await file.text())
      const snapshot = validateBackupFile(parsed)

      if (!snapshot) {
        showToast('Backup file is invalid')
        return
      }

      replaceFromBackup(snapshot)
      showToast('Backup restored')
    } catch {
      showToast('Backup import failed')
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <UploadZone />

      {library.length === 0 ? (
        <div className="mx-5 flex flex-1 flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.035] px-8 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
            <Music2 size={24} className="text-white/20" />
          </div>
          <p className="mt-5 text-lg font-semibold text-white/88">Your library is empty</p>
          <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-white/42">
            Start with a few favorite tracks. They will stay saved on this device and ready to play.
          </p>
        </div>
      ) : (
        <div className="px-5 pb-4">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/36">Library</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-white">
                {visibleSongs.length} track{visibleSongs.length !== 1 ? 's' : ''} in {currentCollectionLabel()}
              </h2>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-right backdrop-blur">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/32">Current</p>
              <p className="mt-1 max-w-[130px] truncate text-sm font-medium text-white/82">
                {currentSong?.name ?? 'Nothing playing'}
              </p>
              <p className="mt-1 text-xs text-white/38">{playing ? 'Playing now' : 'Paused or idle'}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-black/10 px-4 py-3">
              <Search size={16} className="text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by song or artist"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/26"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSortMode(option.id)}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                    sortMode === option.id
                      ? 'bg-white text-[#07120e]'
                      : 'border border-white/10 bg-white/[0.03] text-white/42 hover:text-white/78'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {collectionChips.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setCollectionId(chip.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                    collectionId === chip.id
                      ? 'border-white/16 bg-white/[0.12] text-white'
                      : 'border-white/10 bg-white/[0.03] text-white/42 hover:text-white/76'
                  }`}
                >
                  {chip.label} <span className="text-white/40">{chip.count}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                onClick={() => promptForPlaylist([])}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/62 transition-colors hover:text-white"
              >
                <FolderPlus size={14} />
                New Playlist
              </button>

              {visibleSongs.length > 0 && (
                <button
                  onClick={() => promptForPlaylist(visibleSongs.map((song) => song.id))}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/62 transition-colors hover:text-white"
                >
                  <Heart size={14} />
                  Save This View
                </button>
              )}

              {selectedPlaylist && (
                <button
                  onClick={() => {
                    deletePlaylist(selectedPlaylist.id)
                    setCollectionId('all')
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-3 py-2 text-xs font-medium text-danger transition-colors hover:border-danger/40"
                >
                  <Trash2 size={14} />
                  Delete Playlist
                </button>
              )}

              <button
                onClick={exportBackup}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/62 transition-colors hover:text-white"
              >
                <Download size={14} />
                Export Backup
              </button>

              <button
                onClick={() => importRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/62 transition-colors hover:text-white"
              >
                <Upload size={14} />
                Import Backup
              </button>
            </div>

            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) await importBackup(file)
                e.target.value = ''
              }}
            />

            {playlists.length > 0 && !selectedPlaylist && (
              <div className="mt-5 flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/32">Quick Add Playlist</p>
                <select
                  value={quickAddPlaylistId}
                  onChange={(e) => setQuickAddPlaylistId(e.target.value)}
                  className="rounded-[18px] border border-white/10 bg-black/10 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">Use row action for delete</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="mb-3 mt-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/28">Track List</p>
              <p className="mt-1 text-xs text-white/36">
                {search ? `Showing matches for "${search}"` : 'Tap any row to jump in'}
              </p>
            </div>

            {visibleSongs.length > 0 && (
              <button
                onClick={() => playFromVisible(0)}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#07120e] transition-transform hover:scale-[1.01] active:scale-[0.98]"
              >
                <Play size={14} fill="currentColor" />
                Play Visible
              </button>
            )}
          </div>

          {visibleSongs.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
              <p className="text-sm font-medium text-white/74">Nothing matches this view</p>
              <p className="mt-2 text-sm text-white/36">
                Try another search, switch collections, or build a playlist from a broader set.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {visibleSongs.map((song, i) => {
                const action = playlistMembershipAction(song)

                return (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={i}
                    isActive={song.id === activeSongId}
                    isPlaying={song.id === activeSongId && playing}
                    actionIcon={action.actionIcon}
                    actionTitle={action.actionTitle}
                    actionTone={action.actionTone}
                    onClick={() => playFromVisible(i)}
                    onAction={action.onAction}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
