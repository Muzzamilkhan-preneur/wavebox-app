export interface Song {
  id: string
  name: string
  artist: string
  duration: number
  dataUrl: string
  audioBlob?: Blob | null
  sourceKey?: string
  artUrl: string | null
  artBlob?: Blob | null
  liked: boolean
  addedAt: number
}

export interface Playlist {
  id: string
  name: string
  songIds: string[]
  createdAt: number
}

export type RepeatMode = 'off' | 'all' | 'one'
export type Tab = 'library' | 'nowplaying' | 'queue'
