import { usePlayerStore } from '@/store/playerStore'
import { Tab } from '@/types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'library', label: 'Library' },
  { id: 'nowplaying', label: 'Player' },
]

export function TabBar() {
  const { activeTab, setTab } = usePlayerStore()

  return (
    <nav className="relative z-10 flex shrink-0 px-4 pb-3 sm:px-5">
      <div className="flex w-full items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-white text-[#081018]'
                : 'text-white/42 hover:text-white/78'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
