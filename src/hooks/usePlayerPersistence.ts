import { useEffect } from 'react'
import { loadPlayerSnapshot, saveLibrarySnapshot, savePlayerState } from '@/storage/playerPersistence'
import { usePlayerStore } from '@/store/playerStore'

export function usePlayerPersistence() {
  const hasHydrated = usePlayerStore((s) => s.hasHydrated)
  const hydrateFromStorage = usePlayerStore((s) => s.hydrateFromStorage)
  const library = usePlayerStore((s) => s.library)
  const playlists = usePlayerStore((s) => s.playlists)
  const queue = usePlayerStore((s) => s.queue)
  const queueIndex = usePlayerStore((s) => s.queueIndex)
  const shuffle = usePlayerStore((s) => s.shuffle)
  const repeat = usePlayerStore((s) => s.repeat)
  const volume = usePlayerStore((s) => s.volume)
  const activeTab = usePlayerStore((s) => s.activeTab)

  useEffect(() => {
    let cancelled = false

    loadPlayerSnapshot()
      .then((snapshot) => {
        if (!cancelled) {
          hydrateFromStorage(snapshot)
        }
      })
      .catch(() => {
        if (!cancelled) {
          hydrateFromStorage(null)
        }
      })

    return () => {
      cancelled = true
    }
  }, [hydrateFromStorage])

  useEffect(() => {
    if (!hasHydrated) return

    const timeoutId = window.setTimeout(() => {
      void saveLibrarySnapshot(library)
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [hasHydrated, library])

  useEffect(() => {
    if (!hasHydrated) return

    const timeoutId = window.setTimeout(() => {
      void savePlayerState({
        songOrder: library.map((song) => song.id),
        queueIds: queue.map((song) => song.id),
        queueIndex,
        shuffle,
        repeat,
        volume,
        activeTab,
        playlists,
      })
    }, 180)

    return () => window.clearTimeout(timeoutId)
  }, [hasHydrated, library, playlists, queue, queueIndex, shuffle, repeat, volume, activeTab])
}
