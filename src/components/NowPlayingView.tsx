import {
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Music2,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react'
import { usePlayerStore } from '@/store/playerStore'
import { useAudio } from '@/hooks/useAudio'
import { Scrubber } from './Scrubber'

function roundButton(active = false) {
  return `flex h-11 w-11 items-center justify-center rounded-full transition-transform active:scale-95 ${
    active ? 'bg-white text-[#081018]' : 'bg-white/[0.05] text-white/76'
  }`
}

export function NowPlayingView() {
  const {
    queue,
    queueIndex,
    playing,
    setPlaying,
    nextSong,
    prevSong,
    shuffle,
    toggleShuffle,
    repeat,
    cycleRepeat,
  } = usePlayerStore()

  const { progress, currentTime, duration, volume, seek, setVolume } = useAudio()
  const song = queue[queueIndex] ?? null
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat

  if (!song) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/[0.04]">
          <Music2 size={24} className="text-white/20" />
        </div>
        <p className="mt-6 text-2xl font-semibold tracking-[-0.05em] text-white">Nothing playing</p>
        <p className="mt-2 max-w-[240px] text-sm leading-relaxed text-white/46">
          Pick a track from the library and the player will take over.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 pb-6 pt-2 sm:px-5">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-[320px]">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30">
            Player
          </p>

          <div className="mt-5 overflow-hidden rounded-[34px] bg-white/[0.04]">
            {song.artUrl ? (
              <img src={song.artUrl} alt="" className="aspect-square w-full object-cover" />
            ) : (
              <div className="album-fallback flex aspect-square w-full items-center justify-center">
                <Music2 size={72} className="text-white/14" />
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-[34px] font-semibold leading-none tracking-[-0.07em] text-white">
              {song.name}
            </h2>
            <p className="mt-2 text-sm text-white/46">{song.artist}</p>
          </div>

          <div className="mt-6">
            <Scrubber progress={progress} currentTime={currentTime} duration={duration} onSeek={seek} />
          </div>

          <div className="mt-7 flex items-center justify-center gap-3">
            <button
              onClick={toggleShuffle}
              className={roundButton(shuffle)}
              title="Shuffle"
            >
              <Shuffle size={17} />
            </button>

            <button
              onClick={prevSong}
              className={roundButton()}
              title="Previous"
            >
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button
              onClick={() => setPlaying(!playing)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#081018] transition-transform active:scale-95"
              title={playing ? 'Pause' : 'Play'}
            >
              {playing
                ? <Pause size={24} fill="currentColor" />
                : <Play size={24} fill="currentColor" className="translate-x-0.5" />
              }
            </button>

            <button
              onClick={nextSong}
              className={roundButton()}
              title="Next"
            >
              <SkipForward size={20} fill="currentColor" />
            </button>

            <button
              onClick={cycleRepeat}
              className={roundButton(repeat !== 'off')}
              title={repeat === 'one' ? 'Repeat one' : repeat === 'all' ? 'Repeat all' : 'Repeat off'}
            >
              <RepeatIcon size={17} />
            </button>
          </div>

          <div className="mt-7 grid grid-cols-[auto_1fr] items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-white/58"
              title={volume === 0 ? 'Unmute' : 'Mute'}
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 cursor-pointer appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
