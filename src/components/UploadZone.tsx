import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { useFileUpload } from '@/hooks/useFileUpload'

export function UploadZone() {
  const { processFiles } = useFileUpload()
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    processFiles(e.dataTransfer.files)
  }

  return (
    <>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`
          relative mx-5 mb-6 mt-2 cursor-pointer overflow-hidden rounded-[28px] border p-6 transition-all select-none
          ${drag
            ? 'border-accent/60 bg-[rgba(129,255,210,0.16)] shadow-[0_0_0_1px_rgba(132,255,212,0.16),0_25px_70px_rgba(56,161,125,0.18)]'
            : 'border-white/10 bg-white/[0.05] hover:border-white/18 hover:bg-white/[0.07]'}
        `}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,255,212,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(111,168,255,0.12),transparent_38%)]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="max-w-[230px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Import Library</p>
            <h2 className="mt-3 text-[28px] font-semibold leading-[1.05] tracking-[-0.05em] text-white">
              Drop tracks and build your offline stack.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/48">
              Bring in MP3, AAC, FLAC, WAV, OGG, or M4A and keep everything on this device.
            </p>
          </div>

          <div className="mt-1 flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/12 bg-white/[0.08] text-white shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <Upload size={20} />
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          {['MP3', 'AAC', 'FLAC', 'WAV', 'OGG', 'M4A'].map((type) => (
            <span
              key={type}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/42"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
      />
    </>
  )
}
