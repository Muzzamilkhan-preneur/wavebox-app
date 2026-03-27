import { useCallback, useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'

const sharedAudio = new Audio()
sharedAudio.preload = 'metadata'

function syncProgress() {
  const duration = sharedAudio.duration || 0
  const currentTime = sharedAudio.currentTime || 0

  usePlayerStore.getState().setAudioState({
    currentTime,
    duration,
    progress: duration ? currentTime / duration : 0,
  })
}

function resetAudio() {
  sharedAudio.pause()
  sharedAudio.src = ''
  usePlayerStore.getState().resetAudioState()
}

export function useAudioEngine() {
  const { queue, queueIndex, playing, setPlaying, currentTime, duration, volume } = usePlayerStore()

  const currentSong = queue[queueIndex] ?? null

  useEffect(() => {
    if (!currentSong) {
      resetAudio()
      return
    }

    sharedAudio.src = currentSong.dataUrl
    sharedAudio.load()
    syncProgress()

    if (playing) {
      sharedAudio.play().catch(() => setPlaying(false))
    }

    updateMediaSession(currentSong)
  }, [currentSong?.id, setPlaying])

  useEffect(() => {
    if (!sharedAudio.src) return

    if (playing) {
      sharedAudio.play().catch(() => setPlaying(false))
      return
    }

    sharedAudio.pause()
  }, [playing, setPlaying])

  useEffect(() => {
    sharedAudio.volume = volume
  }, [volume])

  useEffect(() => {
    const onTimeUpdate = () => syncProgress()
    const onDurationChange = () => syncProgress()
    const onEnded = () => {
      const { repeat, queue, queueIndex, nextSong, setPlaying } = usePlayerStore.getState()

      if (repeat === 'one') {
        sharedAudio.currentTime = 0
        sharedAudio.play().catch(() => {})
        syncProgress()
        return
      }

      if (repeat === 'all' || queueIndex < queue.length - 1) { nextSong() }
      else setPlaying(false)
    }

    sharedAudio.addEventListener('timeupdate', onTimeUpdate)
    sharedAudio.addEventListener('durationchange', onDurationChange)
    sharedAudio.addEventListener('ended', onEnded)

    return () => {
      sharedAudio.removeEventListener('timeupdate', onTimeUpdate)
      sharedAudio.removeEventListener('durationchange', onDurationChange)
      sharedAudio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.setActionHandler('play',          () => setPlaying(true))
    navigator.mediaSession.setActionHandler('pause',         () => setPlaying(false))
    navigator.mediaSession.setActionHandler('nexttrack',     () => usePlayerStore.getState().nextSong())
    navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().prevSong())
    navigator.mediaSession.setActionHandler('seekto',        (d) => {
      if (d.seekTime == null) return
      sharedAudio.currentTime = d.seekTime
      syncProgress()
    })

    return () => {
      ;(['play','pause','nexttrack','previoustrack','seekto'] as MediaSessionAction[])
        .forEach((a) => { try { navigator.mediaSession.setActionHandler(a, null) } catch {} })
    }
  }, [setPlaying])

  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration) return

    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: sharedAudio.playbackRate || 1,
        position: currentTime,
      })
    } catch {}
  }, [currentTime, duration])
}

export function useAudio() {
  const { progress, currentTime, duration, volume } = usePlayerStore((s) => ({
    progress: s.progress,
    currentTime: s.currentTime,
    duration: s.duration,
    volume: s.volume,
  }))

  const seek = useCallback((pct: number) => {
    if (!sharedAudio.duration) return

    sharedAudio.currentTime = pct * sharedAudio.duration
    syncProgress()
  }, [])

  const setVolume = useCallback((v: number) => {
    const next = Math.max(0, Math.min(1, v))
    sharedAudio.volume = next
    usePlayerStore.getState().setAudioState({ volume: next })
  }, [])

  return { progress, currentTime, duration, volume, seek, setVolume }
}

function updateMediaSession(song: { name: string; artist: string; artUrl: string | null }) {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = new MediaMetadata({
    title:   song.name,
    artist:  song.artist,
    album:   'Wavebox',
    artwork: song.artUrl ? [{ src: song.artUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
  })
}
