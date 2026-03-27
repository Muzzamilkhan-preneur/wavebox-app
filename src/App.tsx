import { useEffect } from 'react'
import { usePlayerStore } from '@/store/playerStore'
import { useAudioEngine } from '@/hooks/useAudio'
import { usePlayerPersistence } from '@/hooks/usePlayerPersistence'
import { Header } from '@/components/Header'
import { TabBar } from '@/components/TabBar'
import { PlayerBar } from '@/components/PlayerBar'
import { LibraryView } from '@/components/LibraryView'
import { NowPlayingView } from '@/components/NowPlayingView'
import { QueueView } from '@/components/QueueView'
import { ToastProvider } from '@/components/Toast'

function AppShell() {
  const { activeTab, nextSong, prevSong, setPlaying, playing, hasHydrated } = usePlayerStore()

  useAudioEngine()
  usePlayerPersistence()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.code === 'Space') {
        e.preventDefault()
        setPlaying(!playing)
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault()
        nextSong()
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        prevSong()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [playing, nextSong, prevSong, setPlaying])

  if (!hasHydrated) {
    return (
      <div className="min-h-[100svh] bg-app text-white">
        <div className="mx-auto flex min-h-[100svh] max-w-[560px] items-center justify-center px-6 py-10">
          <div className="w-full max-w-[280px] text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">Wavebox</p>
            <p className="mt-4 text-2xl font-semibold tracking-[-0.05em] text-white">Restoring your library</p>
            <p className="mt-3 text-sm leading-relaxed text-white/48">
              Loading your saved songs and player state.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100svh] bg-app text-white">
      <div className="mx-auto flex min-h-[100svh] max-w-[560px] items-stretch sm:p-4">
        <div className="glass-shell relative flex min-h-[100svh] w-full flex-col overflow-hidden sm:min-h-0 sm:rounded-[28px] sm:border sm:border-white/10">
          <Header />
          <TabBar />

          <div className="relative flex-1 overflow-hidden">
            <div className={`absolute inset-0 ${activeTab === 'library' ? 'block' : 'hidden'}`}>
              <LibraryView />
            </div>
            <div className={`absolute inset-0 ${activeTab === 'nowplaying' ? 'block' : 'hidden'}`}>
              <NowPlayingView />
            </div>
            <div className={`absolute inset-0 ${activeTab === 'queue' ? 'block' : 'hidden'}`}>
              <QueueView />
            </div>
          </div>

          <PlayerBar />
          <ToastProvider />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
