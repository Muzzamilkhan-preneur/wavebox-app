import { Plus, Music2 } from 'lucide-react'
import { useRef } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'

export function Header() {
  const inputRef = useRef<HTMLInputElement>(null)
  const { processFiles } = useFileUpload()

  return (
    <header className="relative z-10 flex shrink-0 items-start justify-between px-5 pb-3 pt-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-[radial-gradient(circle_at_35%_35%,rgba(150,255,214,0.95),rgba(95,197,255,0.62)_45%,rgba(17,19,27,0.9)_100%)] shadow-[0_0_40px_rgba(126,247,200,0.22)]">
          <Music2 size={17} color="#07120e" strokeWidth={2.4} />
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">Offline Player</p>
          <h1 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-white">Wavebox</h1>
          <p className="mt-1 text-sm text-white/42">Your saved library, tuned for late-night listening.</p>
        </div>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="group mt-1 inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-4 text-sm font-medium text-white/72 backdrop-blur transition-all hover:border-white/20 hover:bg-white/[0.1] hover:text-white active:scale-[0.98]"
        title="Add songs"
      >
        <Plus size={16} strokeWidth={2.2} className="transition-transform group-hover:rotate-90" />
        <span className="hidden sm:inline">Add Music</span>
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
