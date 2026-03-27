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
      if (e.code === 'Space')      { e.preventDefault(); setPlaying(!playing) }
      if (e.code === 'ArrowRight') { e.preventDefault(); nextSong() }
      if (e.code === 'ArrowLeft')  { e.preventDefault(); prevSong() }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [playing, nextSong, prevSong, setPlaying])

  if (!hasHydrated) {
    return (
      <div className="min-h-dvh bg-app text-white">
        <div className="app-ambient app-ambient-a" />
        <div className="app-ambient app-ambient-b" />

        <div className="mx-auto flex h-dvh max-w-[460px] items-center justify-center px-6">
          <div className="w-full rounded-[32px] border border-white/10 bg-white/[0.04] px-8 py-16 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="mx-auto mb-5 h-14 w-14 rounded-[20px] bg-[radial-gradient(circle_at_35%_35%,rgba(150,255,214,0.95),rgba(95,197,255,0.55)_45%,rgba(255,255,255,0.04)_100%)] shadow-[0_0_45px_rgba(126,247,200,0.4)]" />
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/55">Wavebox</p>
            <p className="mt-4 text-lg font-semibold text-white/90">Restoring your library</p>
            <p className="mt-2 text-sm leading-relaxed text-white/45">
              Bringing back your songs, queue, and playback setup.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-app text-white">
      <div className="app-ambient app-ambient-a" />
      <div className="app-ambient app-ambient-b" />

      <div className="mx-auto flex h-dvh max-w-[520px] items-stretch px-3 py-3 sm:px-5 sm:py-5">
        <div className="glass-shell relative flex h-full w-full flex-col overflow-hidden rounded-[30px] border border-white/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(138,255,209,0.12),transparent_68%)]" />

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
