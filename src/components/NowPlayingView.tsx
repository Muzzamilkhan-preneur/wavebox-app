import {
  Heart,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Music2,
} from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useAudio } from '@/hooks/useAudio'
import { Scrubber } from './Scrubber'

export function NowPlayingView() {
  const {
    queue, queueIndex, playing, setPlaying,
    shuffle, toggleShuffle, repeat, cycleRepeat,
    toggleLike, nextSong, prevSong,
  } = usePlayerStore()

  const { progress, currentTime, duration, volume, seek, setVolume } = useAudio()
  const song = queue[queueIndex] ?? null

  if (!song) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.06] shadow-[0_25px_80px_rgba(0,0,0,0.24)]">
          <Music2 size={24} className="text-white/20" />
        </div>
        <p className="mt-6 text-[26px] font-semibold tracking-[-0.05em] text-white">Nothing playing</p>
        <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-white/42">
          Pick a track from your library and this space becomes your listening room.
        </p>
      </div>
    )
  }

  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-2">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] px-5 pb-6 pt-5 shadow-[0_30px_90px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(137,255,211,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(97,152,255,0.18),transparent_30%)]" />

        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/40">Now Playing</p>
            <p className="mt-2 text-sm text-white/44">{playing ? 'In motion' : 'Paused and waiting'}</p>
          </div>

          <button
            onClick={() => toggleLike(song.id)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              song.liked
                ? 'border-accent/40 bg-accent/12 text-accent'
                : 'border-white/10 bg-white/[0.05] text-white/40 hover:text-white/70'
            }`}
          >
            <Heart size={20} fill={song.liked ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>

        <div className="relative mt-5 flex justify-center">
          <div className="absolute inset-x-10 top-8 h-40 rounded-full bg-[radial-gradient(circle,rgba(137,255,211,0.28),transparent_68%)] blur-3xl" />

          <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] shadow-[0_35px_95px_rgba(0,0,0,0.34)]">
            {song.artUrl ? (
              <img src={song.artUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="album-fallback flex h-full w-full items-center justify-center">
                <Music2 size={88} className="text-white/16" />
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-6">
          <h2 className="truncate text-[34px] font-semibold leading-none tracking-[-0.065em] text-white">
            {song.name}
          </h2>
          <p className="mt-3 truncate text-base text-white/48">{song.artist}</p>
        </div>

        <div className="mt-6">
          <Scrubber progress={progress} currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              shuffle
                ? 'border-accent/40 bg-accent/12 text-accent'
                : 'border-white/10 bg-white/[0.05] text-white/34 hover:text-white/72'
            }`}
          >
            <Shuffle size={18} />
          </button>

          <button
            onClick={prevSong}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/78 transition-colors hover:text-white active:scale-95"
          >
            <SkipBack size={24} fill="currentColor" />
          </button>

          <button
            onClick={() => setPlaying(!playing)}
            className="flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#a4ffd9,#5ed3ff)] text-[#04100d] shadow-[0_22px_55px_rgba(102,228,198,0.38)] transition-all hover:scale-[1.02] active:scale-[0.97]"
          >
            {playing
              ? <Pause size={30} fill="currentColor" />
              : <Play  size={30} fill="currentColor" className="translate-x-0.5" />
            }
          </button>

          <button
            onClick={nextSong}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/78 transition-colors hover:text-white active:scale-95"
          >
            <SkipForward size={24} fill="currentColor" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              repeat !== 'off'
                ? 'border-accent/40 bg-accent/12 text-accent'
                : 'border-white/10 bg-white/[0.05] text-white/34 hover:text-white/72'
            }`}
          >
            <RepeatIcon size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">Listening Controls</p>
            <p className="mt-2 text-sm text-white/46">Dial in the room before the next track lands.</p>
          </div>

          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/50 transition-colors hover:text-white/78"
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.18em] text-white/26">Quiet</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 cursor-pointer appearance-none"
          />
          <span className="text-xs uppercase tracking-[0.18em] text-white/26">Full</span>
        </div>
      </div>
    </div>
  )
}
