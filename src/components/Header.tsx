import { LibraryBig, Plus } from 'lucide-react'
import { useRef } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import { usePlayerStore } from '@/store/playerStore'

export function Header() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { processFiles } = useFileUpload()
  const libraryCount = usePlayerStore((s) => s.library.length)

  return (
    <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] text-white/72">
          <LibraryBig size={18} />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/36">Wavebox</p>
          <p className="mt-1 text-sm text-white/58">
          {libraryCount ? `${libraryCount} saved track${libraryCount === 1 ? '' : 's'}` : 'Personal offline player'}
          </p>
        </div>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/82 transition-colors hover:bg-white/[0.08]"
        title="Add songs"
      >
        <Plus size={16} strokeWidth={2.2} />
        <span>Add songs</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />
    </header>
  )
}
