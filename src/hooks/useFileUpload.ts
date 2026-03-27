import { useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { showToast } from '@/components/Toast'
import { Song } from '@/types'
import { extractAudioMetadata } from '@/utils/audioMetadata'

function parseFallbackName(fileName: string) {
  const raw = fileName.replace(/\.[^/.]+$/, '')
  const dashIndex = Math.max(raw.lastIndexOf(' - '), raw.lastIndexOf(' – '))
  const dotIndex = raw.lastIndexOf('. ')

  if (dashIndex > 0) {
    return {
      name: raw.slice(0, dashIndex).trim(),
      artist: raw.slice(dashIndex + 3).trim() || 'Unknown artist',
    }
  }

  if (dotIndex > 0) {
    return {
      name: raw.slice(0, dotIndex).trim(),
      artist: raw.slice(dotIndex + 2).trim() || 'Unknown artist',
    }
  }

  return { name: raw, artist: 'Unknown artist' }
}

export function useFileUpload() {
  const addSongs = usePlayerStore((s) => s.addSongs)

  function makeSongId(file: File) {
    const safeName = file.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase()
    return `wb_${safeName}_${file.size}_${file.lastModified}`
  }

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files).filter(
        (f) => f.type.startsWith('audio/') || /\.(mp3|aac|flac|wav|ogg|m4a)$/i.test(f.name)
      )
      if (!arr.length) return

      arr.forEach(async (file) => {
        const sourceKey = makeSongId(file)
        const objectUrl = URL.createObjectURL(file)
        const fallback = parseFallbackName(file.name)
        const metadata = await extractAudioMetadata(file)
        const coverUrl = metadata.coverBlob ? URL.createObjectURL(metadata.coverBlob) : null

        const song: Song = {
          id: sourceKey,
          name: metadata.title?.trim() || fallback.name,
          artist: metadata.artist?.trim() || fallback.artist,
          duration: 0,
          dataUrl: objectUrl,
          audioBlob: file,
          sourceKey,
          artUrl: coverUrl,
          artBlob: metadata.coverBlob ?? null,
          liked: false,
          addedAt: Date.now(),
        }

        const tmp = new Audio()
        let done = false

        const finish = () => {
          if (done) return
          done = true
          tmp.onloadedmetadata = null
          tmp.onerror = null
          tmp.src = ''
          addSongs([song])
          showToast(`Added "${song.name}"`)
        }

        tmp.src = objectUrl
        tmp.onloadedmetadata = () => {
          song.duration = tmp.duration || 0
          finish()
        }
        tmp.onerror = () => {
          finish()
        }
      })
    },
    [addSongs]
  )

  return { processFiles }
}
