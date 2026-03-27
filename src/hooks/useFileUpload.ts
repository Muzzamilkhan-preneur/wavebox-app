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
        const reader = new FileReader()
        reader.onload = (ev) => {
          const dataUrl = ev.target?.result as string
          const raw     = file.name.replace(/\.[^/.]+$/, '')
          const match   = raw.match(/^(.+?)\s*[-–]\s*(.+)$/)
          const name    = match ? match[2].trim() : raw
          const artist  = match ? match[1].trim() : 'Unknown artist'
          const id      = makeSongId(file)

          const song: Song = {
            id,
            name,
            artist,
            duration: 0,
            dataUrl,
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

          tmp.src   = dataUrl
          tmp.onloadedmetadata = () => {
            song.duration = tmp.duration || 0
            finish()
          }
          tmp.onerror = () => {
            finish()
          }
        }
        reader.readAsDataURL(file)
      })
    },
    [addSongs]
  )

  return { processFiles }
}
