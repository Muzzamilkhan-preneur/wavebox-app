import { Playlist, RepeatMode, Song, Tab } from '@/types'

const DB_NAME = 'wavebox-player'
const DB_VERSION = 2
const SONGS_STORE = 'songs'
const STATE_STORE = 'state'
const PLAYER_STATE_KEY = 'player-state'

interface PlayerStateRecord {
  key: typeof PLAYER_STATE_KEY
  songOrder: string[]
  queueIds: string[]
  queueIndex: number
  shuffle: boolean
  repeat: RepeatMode
  volume: number
  activeTab: Tab
  playlists: Playlist[]
}

interface PersistedSongRecord extends Omit<Song, 'dataUrl'> {
  dataUrl?: string
}

export interface PersistedPlayerSnapshot {
  library: Song[]
  queueIds: string[]
  queueIndex: number
  shuffle: boolean
  repeat: RepeatMode
  volume: number
  activeTab: Tab
  playlists: Playlist[]
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function waitForTransaction(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(SONGS_STORE)) {
        db.createObjectStore(SONGS_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(STATE_STORE)) {
        db.createObjectStore(STATE_STORE, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
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

function normalizePlaylist(playlist: Playlist, index: number) {
  return {
    ...playlist,
    createdAt: typeof playlist.createdAt === 'number' ? playlist.createdAt : Date.now() - index,
    songIds: Array.isArray(playlist.songIds) ? playlist.songIds : [],
  }
}

function dataUrlToBlob(dataUrl: string) {
  if (!dataUrl.startsWith('data:')) return null

  const [header, body] = dataUrl.split(',', 2)
  if (!header || !body) return null

  const mimeMatch = header.match(/^data:(.*?);base64$/)
  if (!mimeMatch) return null

  const binary = window.atob(body)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new Blob([bytes], { type: mimeMatch[1] || 'audio/mpeg' })
}

function createRuntimeSong(record: PersistedSongRecord, index: number) {
  const audioBlob = record.audioBlob instanceof Blob ? record.audioBlob : null
  const artBlob = record.artBlob instanceof Blob ? record.artBlob : null
  const runtimeUrl = audioBlob
    ? URL.createObjectURL(audioBlob)
    : typeof record.dataUrl === 'string'
      ? record.dataUrl
      : ''
  const runtimeArtUrl = artBlob
    ? URL.createObjectURL(artBlob)
    : typeof record.artUrl === 'string'
      ? record.artUrl
      : null

  return normalizeSong(
    {
      ...record,
      dataUrl: runtimeUrl,
      audioBlob,
      artUrl: runtimeArtUrl,
      artBlob,
    },
    index
  )
}

async function toPersistedSongRecord(song: Song): Promise<PersistedSongRecord | null> {
  let audioBlob = song.audioBlob instanceof Blob ? song.audioBlob : null
  let artBlob = song.artBlob instanceof Blob ? song.artBlob : null

  if (!audioBlob && typeof song.dataUrl === 'string' && song.dataUrl.startsWith('data:')) {
    audioBlob = dataUrlToBlob(song.dataUrl)
  }

  if (!artBlob && typeof song.artUrl === 'string' && song.artUrl.startsWith('data:')) {
    artBlob = dataUrlToBlob(song.artUrl)
  }

  const dataUrl = audioBlob ? undefined : song.dataUrl
  const artUrl = artBlob ? null : (song.artUrl ?? null)
  if (!audioBlob && !dataUrl) return null

  return {
    ...song,
    dataUrl,
    audioBlob,
    artUrl,
    artBlob,
    sourceKey: song.sourceKey ?? song.id,
  }
}

export async function loadPlayerSnapshot(): Promise<PersistedPlayerSnapshot | null> {
  const db = await openDatabase()
  const transaction = db.transaction([SONGS_STORE, STATE_STORE], 'readonly')
  const songsStore = transaction.objectStore(SONGS_STORE)
  const stateStore = transaction.objectStore(STATE_STORE)

  const [songs, state] = await Promise.all([
    requestToPromise<PersistedSongRecord[]>(songsStore.getAll()),
    requestToPromise<PlayerStateRecord | undefined>(stateStore.get(PLAYER_STATE_KEY)),
  ])

  await waitForTransaction(transaction)
  db.close()

  if (!songs.length && !state) {
    return null
  }

  const normalizedSongs = songs
    .map(createRuntimeSong)
    .filter((song) => typeof song.dataUrl === 'string' && song.dataUrl.length > 0)

  const songsById = new Map(normalizedSongs.map((song) => [song.id, song]))

  const library =
    state?.songOrder?.length
      ? state.songOrder.map((id) => songsById.get(id)).filter(Boolean) as Song[]
      : normalizedSongs

  const queueIds =
    state?.queueIds?.length
      ? state.queueIds.filter((id) => songsById.has(id))
      : library.map((song) => song.id)

  const queueIndex = queueIds.length
    ? Math.min(Math.max(state?.queueIndex ?? 0, 0), queueIds.length - 1)
    : 0

  const playlists = (state?.playlists ?? []).map(normalizePlaylist)

  return {
    library,
    queueIds,
    queueIndex,
    shuffle: state?.shuffle ?? false,
    repeat: state?.repeat ?? 'off',
    volume: state?.volume ?? 1,
    activeTab: state?.activeTab ?? 'library',
    playlists,
  }
}

export async function saveLibrarySnapshot(library: Song[]) {
  const records = (await Promise.all(library.map(toPersistedSongRecord))).filter(Boolean) as PersistedSongRecord[]

  const db = await openDatabase()
  const transaction = db.transaction(SONGS_STORE, 'readwrite')
  const songsStore = transaction.objectStore(SONGS_STORE)
  const existingIds = await requestToPromise<IDBValidKey[]>(songsStore.getAllKeys())
  const nextIds = new Set(records.map((song) => song.id))

  existingIds.forEach((id) => {
    if (!nextIds.has(String(id))) {
      songsStore.delete(id)
    }
  })

  records.forEach((song) => {
    songsStore.put(song)
  })

  await waitForTransaction(transaction)
  db.close()
}

export async function savePlayerState(snapshot: Omit<PersistedPlayerSnapshot, 'library'> & { songOrder: string[] }) {
  const db = await openDatabase()
  const transaction = db.transaction(STATE_STORE, 'readwrite')
  const stateStore = transaction.objectStore(STATE_STORE)

  const state: PlayerStateRecord = {
    key: PLAYER_STATE_KEY,
    songOrder: snapshot.songOrder,
    queueIds: snapshot.queueIds,
    queueIndex: snapshot.queueIndex,
    shuffle: snapshot.shuffle,
    repeat: snapshot.repeat,
    volume: snapshot.volume,
    activeTab: snapshot.activeTab,
    playlists: snapshot.playlists,
  }

  stateStore.put(state)

  await waitForTransaction(transaction)
  db.close()
}
