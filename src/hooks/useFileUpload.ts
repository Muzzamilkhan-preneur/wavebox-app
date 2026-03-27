import { useCallback } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { showToast } from '@/components/Toast'
import { Song } from '@/types'

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

      arr.forEach((file) => {
        const raw = file.name.replace(/\.[^/.]+$/, '')
        const match = raw.match(/^(.+?)\s*[-\u2013]\s*(.+)$/)
        const name = match ? match[2].trim() : raw
        const artist = match ? match[1].trim() : 'Unknown artist'
        const sourceKey = makeSongId(file)
        const objectUrl = URL.createObjectURL(file)

        const song: Song = {
          id: sourceKey,
          name,
          artist,
          duration: 0,
          dataUrl: objectUrl,
          audioBlob: file,
          sourceKey,
          artUrl: null,
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
