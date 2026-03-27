import { PersistedPlayerSnapshot } from '@/storage/playerPersistence'
import { Playlist, Song } from '@/types'

export interface WaveboxBackupFile {
  backupVersion: 1
  exportedAt: string
  snapshot: PersistedPlayerSnapshot
}

function isSong(value: unknown): value is Song {
  if (!value || typeof value !== 'object') return false
  const song = value as Song
  return typeof song.id === 'string'
    && typeof song.name === 'string'
    && typeof song.artist === 'string'
    && typeof song.duration === 'number'
    && typeof song.dataUrl === 'string'
    && typeof song.liked === 'boolean'
}

function isPlaylist(value: unknown): value is Playlist {
  if (!value || typeof value !== 'object') return false
  const playlist = value as Playlist
  return typeof playlist.id === 'string'
    && typeof playlist.name === 'string'
    && Array.isArray(playlist.songIds)
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function toBackupSong(song: Song): Promise<Song> {
  const artUrl =
    song.artBlob instanceof Blob
      ? await blobToDataUrl(song.artBlob)
      : song.artUrl

  if (song.audioBlob instanceof Blob) {
    return {
      ...song,
      dataUrl: await blobToDataUrl(song.audioBlob),
      audioBlob: null,
      artUrl,
      artBlob: null,
    }
  }

  if (song.dataUrl.startsWith('blob:')) {
    throw new Error('Song source is not available for backup')
  }

  return {
    ...song,
    audioBlob: null,
    artUrl,
    artBlob: null,
  }
}

export async function createBackupFile(snapshot: PersistedPlayerSnapshot): Promise<WaveboxBackupFile> {
  return {
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    snapshot: {
      ...snapshot,
      library: await Promise.all(snapshot.library.map(toBackupSong)),
    },
  }
}

export function validateBackupFile(value: unknown): PersistedPlayerSnapshot | null {
  if (!value || typeof value !== 'object') return null

  const candidate = value as Partial<WaveboxBackupFile>
  const snapshot = candidate.snapshot

  if (!snapshot || typeof snapshot !== 'object') return null
  if (!Array.isArray(snapshot.library) || !snapshot.library.every(isSong)) return null
  if (!Array.isArray(snapshot.queueIds) || !snapshot.queueIds.every((id) => typeof id === 'string')) return null
  if (!Array.isArray(snapshot.playlists) || !snapshot.playlists.every(isPlaylist)) return null
  if (typeof snapshot.queueIndex !== 'number') return null
  if (typeof snapshot.shuffle !== 'boolean') return null
  if (!['off', 'all', 'one'].includes(snapshot.repeat as string)) return null
  if (typeof snapshot.volume !== 'number') return null
  if (!['library', 'nowplaying', 'queue'].includes(snapshot.activeTab as string)) return null

  return snapshot as PersistedPlayerSnapshot
}
