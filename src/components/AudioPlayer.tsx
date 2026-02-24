import { useCallback, useEffect, useRef, useState } from 'react'

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
  const [loading, setLoading] = useState(false)
  const [bufferProgress, setBufferProgress] = useState(0)
  const [loop, setLoop] = useState(false)
  const [slow, setSlow] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadingTimeoutRef = useRef<number | null>(null)

  // Clear loading timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  const play = useCallback(() => {
    if (!src) return
    setLoading(true)
    setBufferProgress(0)

    const audio = audioRef.current ?? new Audio(src)
    if (!audioRef.current) {
      audioRef.current = audio

      // Audio loading events
      const handleCanPlay = () => {
        setLoading(false)
        setBufferProgress(100)
      }

      const handleLoadStart = () => {
        setLoading(true)
        setBufferProgress(10)
      }

      const handleProgress = () => {
        if (audio.buffered.length > 0) {
          const buffered = audio.buffered.end(0)
          const duration = audio.duration || 1
          const progress = Math.min((buffered / duration) * 100, 90)
          setBufferProgress(progress)
        }
      }

      const handleWaiting = () => {
        setLoading(true)
      }

      const handlePlaying = () => {
        setLoading(false)
        setBufferProgress(100)
      }

      const handleEnded = () => {
        setPlaying(false)
        setLoading(false)
        setBufferProgress(0)
      }

      const handleError = () => {
        setPlaying(false)
        setLoading(false)
        setBufferProgress(0)
      }

      audio.addEventListener('canplay', handleCanPlay)
      audio.addEventListener('loadstart', handleLoadStart)
      audio.addEventListener('progress', handleProgress)
      audio.addEventListener('waiting', handleWaiting)
      audio.addEventListener('playing', handlePlaying)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('error', handleError)

      // Store cleanup function on the audio element
      ;(audio as any)._cleanup = () => {
        audio.removeEventListener('canplay', handleCanPlay)
        audio.removeEventListener('loadstart', handleLoadStart)
        audio.removeEventListener('progress', handleProgress)
        audio.removeEventListener('waiting', handleWaiting)
        audio.removeEventListener('playing', handlePlaying)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('error', handleError)
      }
    }

    audio.playbackRate = slow ? 0.75 : 1
    audio.loop = loop

    audio.play().catch(() => {
      setPlaying(false)
      setLoading(false)
    })

    setPlaying(true)

    // Fallback: clear loading state after 3 seconds max
    loadingTimeoutRef.current = window.setTimeout(() => {
      setLoading(false)
      setBufferProgress(100)
    }, 3000)
  }, [src, loop, slow])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlaying(false)
    setLoading(false)
    setBufferProgress(0)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  const togglePlay = () => {
    if (playing) stop()
    else play()
  }

  if (!src) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full bg-th-elevated border border-th-border px-3 py-1.5 text-xs text-th-muted ${className}`}
        title="Audio not available"
      >
        <span className="opacity-60">🔇</span>
        <span>{label}</span>
      </div>
    )
  }

  return (
    <div className={`inline-flex ${className}`}>
      <div
        className={`inline-flex flex-col items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs ring-1 ring-emerald-500/40`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            disabled={loading}
            className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-50 disabled:opacity-70 disabled:cursor-wait"
            aria-label={playing ? 'Stop' : 'Play'}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/80 text-[0.65rem] text-emerald-950">
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : playing ? (
                '⏹'
              ) : (
                '▶'
              )}
            </span>
            {loading ? 'Loading...' : playing ? 'Stop' : label}
          </button>
          {showRepeat && (
            <label className="flex cursor-pointer items-center gap-1.5 text-th-text-2">
              <input
                type="checkbox"
                checked={loop}
                onChange={(e) => setLoop(e.target.checked)}
                disabled={loading}
                className="rounded border-th-border bg-th-input text-emerald-500 disabled:opacity-50"
              />
              <span className="text-[0.7rem]">Repeat</span>
            </label>
          )}
          {slowOption && (
            <label className="flex cursor-pointer items-center gap-1.5 text-th-text-2">
              <input
                type="checkbox"
                checked={slow}
                onChange={(e) => setSlow(e.target.checked)}
                disabled={loading}
                className="rounded border-th-border bg-th-input text-emerald-500 disabled:opacity-50"
              />
              <span className="text-[0.7rem]">Slower</span>
            </label>
          )}
        </div>

        {/* Loading Progress Bar */}
        {loading && (
          <div className="w-full h-1 bg-emerald-950/20 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 ease-out rounded-full animate-pulse"
              style={{ width: `${bufferProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
