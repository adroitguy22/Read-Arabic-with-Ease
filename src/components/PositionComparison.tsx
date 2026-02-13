import { getLetter } from '../data/letters'
import { AudioPlayer } from './AudioPlayer'

interface PositionComparisonProps {
  letterId: string
  audioUrl?: string
  className?: string
}

const POSITIONS = [
  { key: 'isolated', label: 'Isolated' },
  { key: 'initial', label: 'Beginning' },
  { key: 'medial', label: 'Middle' },
  { key: 'final', label: 'End' },
] as const

export function PositionComparison({
  letterId,
  audioUrl,
  className = '',
}: PositionComparisonProps) {
  const letter = getLetter(letterId)
  if (!letter) return null

  const forms = letter.forms

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-slate-900/60 p-4 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-100">
          {letter.name} — all positions
        </p>
        {audioUrl && (
          <AudioPlayer src={audioUrl} label="Listen to forms" repeat slowOption />
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {POSITIONS.map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col items-center rounded-xl bg-slate-950/80 py-3"
          >
            <p className="mb-1 text-[0.65rem] uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <p dir="rtl" className="cursor-pointer font-arabic text-3xl text-emerald-50 transition-all hover:scale-125 hover:text-emerald-300 active:scale-95">
              {forms[key]}
            </p>
          </div>
        ))}
      </div>
      {!letter.connectsForward && (
        <p className="mt-2 text-[0.7rem] text-slate-400">
          This letter does not connect to the next letter — so its “initial” and
          “medial” shapes look like the isolated form.
        </p>
      )}
    </div>
  )
}

interface PositionComparisonListProps {
  letterIds: string[]
  /** Backend API base URL */
  apiBaseUrl?: string
  className?: string
}

export function PositionComparisonList({
  letterIds,
  apiBaseUrl = 'http://localhost:3001',
  className = '',
}: PositionComparisonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {letterIds.map((id) => (
        <PositionComparison
          key={id}
          letterId={id}
          audioUrl={`${apiBaseUrl}/api/audio/position/${id}`}
        />
      ))}
    </div>
  )
}
