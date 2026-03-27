import { usePlayerStore } from '@/store/playerStore'
import { Tab } from '@/types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'library', label: 'Library' },
  { id: 'nowplaying', label: 'Now Playing' },
  { id: 'queue', label: 'Queue' },
]

export function TabBar() {
  const { activeTab, setTab } = usePlayerStore()

  return (
    <nav className="relative z-10 flex shrink-0 px-5 pb-4">
      <div className="flex w-full items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              flex-1 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-[0.01em] transition-all
              ${activeTab === t.id
                ? 'bg-white text-[#07120e] shadow-[0_8px_24px_rgba(255,255,255,0.14)]'
                : 'text-white/36 hover:text-white/70'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
