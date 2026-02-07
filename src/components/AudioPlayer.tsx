import { useCallback, useRef, useState } from 'react'

interface AudioPlayerProps {
  src?: string
  label?: string
  /** Show repeat (loop) toggle */
  repeat?: boolean
  /** Show slow speed option (0.75x) */
  slowOption?: boolean
  className?: string
}

export function AudioPlayer({
  src,
  label = 'Play',
  repeat: showRepeat = true,
  slowOption = true,
  className = '',
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(false)
  const [slow, setSlow] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback(() => {
    if (!src) return
    const audio = audioRef.current ?? new Audio(src)
    if (!audioRef.current) {
      audioRef.current = audio
      audio.addEventListener('ended', () => setPlaying(false))
    }
    audio.playbackRate = slow ? 0.75 : 1
    audio.loop = loop
    audio.play().catch(() => setPlaying(false))
    setPlaying(true)
  }, [src, loop, slow])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
  }, [])

  const togglePlay = () => {
    if (playing) stop()
    else play()
  }

  if (!src) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-slate-700/50 px-3 py-1.5 text-xs text-slate-400 ${className}`}
        title="Audio not available"
      >
        <span className="opacity-60">🔇</span>
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs ring-1 ring-emerald-500/40 ${className}`}
    >
      <button
        type="button"
        onClick={togglePlay}
        className="inline-flex items-center gap-1.5 font-medium text-emerald-100 hover:text-emerald-50"
        aria-label={playing ? 'Stop' : 'Play'}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/80 text-[0.65rem] text-emerald-950">
          {playing ? '⏹' : '▶'}
        </span>
        {playing ? 'Stop' : label}
      </button>
      {showRepeat && (
        <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
            className="rounded border-slate-500 bg-slate-800 text-emerald-500"
          />
          <span className="text-[0.7rem]">Repeat</span>
        </label>
      )}
      {slowOption && (
        <label className="flex cursor-pointer items-center gap-1.5 text-slate-300">
          <input
            type="checkbox"
            checked={slow}
            onChange={(e) => setSlow(e.target.checked)}
            className="rounded border-slate-500 bg-slate-800 text-emerald-500"
          />
          <span className="text-[0.7rem]">Slower</span>
        </label>
      )}
    </div>
  )
}
