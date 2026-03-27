import { create } from 'zustand'
import { PersistedPlayerSnapshot } from '@/storage/playerPersistence'
import { Playlist, RepeatMode, Song, Tab } from '@/types'

interface PlayerState {
  library: Song[]
  playlists: Playlist[]
  addSongs: (songs: Song[]) => void
  removeSong: (id: string) => void
  toggleLike: (id: string) => void
  createPlaylist: (name: string, songIds?: string[]) => string | null
  deletePlaylist: (playlistId: string) => void
  addSongToPlaylist: (playlistId: string, songId: string) => void
  removeSongFromPlaylist: (playlistId: string, songId: string) => void

  queue: Song[]
  queueIndex: number
  setQueue: (songs: Song[], startIndex: number) => void
  clearQueue: () => void
  jumpTo: (index: number) => void
  nextSong: () => void
  prevSong: () => void

  playing: boolean
  setPlaying: (v: boolean) => void
  shuffle: boolean
  toggleShuffle: () => void
  repeat: RepeatMode
  cycleRepeat: () => void

  progress: number
  currentTime: number
  duration: number
  volume: number
  setAudioState: (state: Partial<Pick<PlayerState, 'progress' | 'currentTime' | 'duration' | 'volume'>>) => void
  resetAudioState: () => void

  activeTab: Tab
  hasHydrated: boolean
  setTab: (t: Tab) => void
  hydrateFromStorage: (snapshot: PersistedPlayerSnapshot | null) => void
  replaceFromBackup: (snapshot: PersistedPlayerSnapshot) => void
}

function normalizeSong(song: Song, index: number) {
  return {
    ...song,
    audioBlob: song.audioBlob instanceof Blob ? song.audioBlob : null,
    artBlob: song.artBlob instanceof Blob ? song.artBlob : null,
    sourceKey: typeof song.sourceKey === 'string' ? song.sourceKey : song.id,
    addedAt: typeof song.addedAt === 'number' ? song.addedAt : Date.now() - index,
  }
}

function songFingerprint(song: Song) {
  return song.sourceKey ?? `${song.name}::${song.artist}::${song.dataUrl}`
}

function dedupeSongs(songs: Song[]) {
  const seenIds = new Set<string>()
  const seenFingerprints = new Set<string>()
  const unique: Song[] = []

  songs.forEach((song, index) => {
    const normalized = normalizeSong(song, index)
    const fingerprint = songFingerprint(normalized)

    if (seenIds.has(normalized.id) || seenFingerprints.has(fingerprint)) {
      return
    }

    seenIds.add(normalized.id)
    seenFingerprints.add(fingerprint)
    unique.push(normalized)
  })

  return unique
}

function makePlaylistId() {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function buildSnapshotState(snapshot: PersistedPlayerSnapshot | null) {
  if (!snapshot) {
    return { hasHydrated: true }
  }

  const library = dedupeSongs(snapshot.library ?? [])
  const songsById = new Map(library.map((song) => [song.id, song]))
  const queue = snapshot.queueIds.map((id) => songsById.get(id)).filter(Boolean) as Song[]
  const queueIndex = queue.length
    ? Math.min(Math.max(snapshot.queueIndex, 0), queue.length - 1)
    : 0
  const playlists = (snapshot.playlists ?? []).map((playlist, index) => ({
    ...playlist,
    createdAt: typeof playlist.createdAt === 'number' ? playlist.createdAt : Date.now() - index,
    songIds: playlist.songIds.filter((songId) => songsById.has(songId)),
  }))

  return {
    library,
    playlists,
    queue,
    queueIndex,
    shuffle: snapshot.shuffle,
    repeat: snapshot.repeat,
    volume: Math.max(0, Math.min(1, snapshot.volume)),
    activeTab: snapshot.activeTab === 'queue' ? 'library' : snapshot.activeTab,
    playing: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    hasHydrated: true,
  }
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  library: [],
  playlists: [],

  addSongs: (songs) =>
    set((s) => {
      const nextSongs = songs.map((song, index) => normalizeSong(song, index))
      const merged = dedupeSongs([...s.library, ...nextSongs])

      if (s.queue.length === 0) {
        return { library: merged, queue: merged, queueIndex: 0 }
      }

      return { library: merged }
    }),

  removeSong: (id) =>
    set((s) => {
      const library = s.library.filter((x) => x.id !== id)
      const queue = s.queue.filter((x) => x.id !== id)
      const playlists = s.playlists.map((playlist) => ({
        ...playlist,
        songIds: playlist.songIds.filter((songId) => songId !== id),
      }))

      let queueIndex = s.queueIndex
      if (queueIndex >= queue.length) queueIndex = Math.max(0, queue.length - 1)

      return { library, queue, queueIndex, playlists }
    }),

  toggleLike: (id) =>
    set((s) => ({
      library: s.library.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)),
      queue: s.queue.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)),
    })),

  createPlaylist: (name, songIds = []) => {
    const trimmed = name.trim()
    if (!trimmed) return null

    const uniqueSongIds = Array.from(new Set(songIds))
    const playlistId = makePlaylistId()

    set((s) => ({
      playlists: [
        ...s.playlists,
        {
          id: playlistId,
          name: trimmed,
          songIds: uniqueSongIds,
          createdAt: Date.now(),
        },
      ],
    }))

    return playlistId
  },

  deletePlaylist: (playlistId) =>
    set((s) => ({
      playlists: s.playlists.filter((playlist) => playlist.id !== playlistId),
    })),

  addSongToPlaylist: (playlistId, songId) =>
    set((s) => ({
      playlists: s.playlists.map((playlist) => {
        if (playlist.id !== playlistId || playlist.songIds.includes(songId)) return playlist
        return { ...playlist, songIds: [...playlist.songIds, songId] }
      }),
    })),

  removeSongFromPlaylist: (playlistId, songId) =>
    set((s) => ({
      playlists: s.playlists.map((playlist) => {
        if (playlist.id !== playlistId) return playlist
        return { ...playlist, songIds: playlist.songIds.filter((id) => id !== songId) }
      }),
    })),

  queue: [],
  queueIndex: 0,
  setQueue: (songs, startIndex) => set({ queue: songs, queueIndex: startIndex }),
  clearQueue: () => set({ queue: [], queueIndex: 0, playing: false }),
  jumpTo: (index) => set({ queueIndex: index }),

  nextSong: () => {
    const { queue, queueIndex, shuffle, repeat } = get()
    if (!queue.length) return
    if (repeat === 'one') { set({ queueIndex }); return }

    let next: number
    if (shuffle) {
      do { next = Math.floor(Math.random() * queue.length) } while (queue.length > 1 && next === queueIndex)
    } else {
      next = (queueIndex + 1) % queue.length
    }
    set({ queueIndex: next })
  },

  prevSong: () => {
    const { queue, queueIndex } = get()
    if (!queue.length) return
    set({ queueIndex: (queueIndex - 1 + queue.length) % queue.length })
  },

  playing: false,
  setPlaying: (v) => set({ playing: v }),
  shuffle: false,
  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  repeat: 'off',
  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off',
    })),

  progress: 0,
  currentTime: 0,
  duration: 0,
  volume: 1,
  setAudioState: (state) => set(state),
  resetAudioState: () => set({ progress: 0, currentTime: 0, duration: 0 }),

  activeTab: 'library',
  setTab: (t) => set({ activeTab: t }),
  hasHydrated: false,
  hydrateFromStorage: (snapshot) => set(() => buildSnapshotState(snapshot)),
  replaceFromBackup: (snapshot) => set(() => buildSnapshotState(snapshot)),
}))
