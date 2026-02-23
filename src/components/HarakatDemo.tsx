import { getHaraka } from '../data/harakat'
import { getLetter } from '../data/letters'
import { AudioPlayer } from './AudioPlayer'

interface HarakatDemoProps {
  harakaId: string
  /** Optional: show on a specific letter (e.g. ب) */
  letterId?: string
  audioUrl?: string
  className?: string
}

export function HarakatDemo({
  harakaId,
  letterId = 'baa',
  audioUrl,
  className = '',
}: HarakatDemoProps) {
  const haraka = getHaraka(harakaId)
  const letter = getLetter(letterId)
  if (!haraka) return null

  const displayLetter = letter ? letter.forms.isolated : 'ب'
  const withHaraka = displayLetter + haraka.symbol

  return (
    <div
      className={`rounded-2xl border border-th-border bg-th-surface backdrop-blur-sm p-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div dir="rtl" className="cursor-pointer font-arabic text-4xl text-amber-700 dark:text-amber-50 transition-all hover:scale-110 hover:text-amber-500 dark:hover:text-amber-300 active:scale-95">
            {withHaraka}
          </div>
          {audioUrl && (
            <AudioPlayer src={audioUrl} label="Listen" repeat slowOption />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-th-text">
            {haraka.name}
            <span className="ml-2 text-th-muted">({haraka.nameAr})</span>
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-200/90">{haraka.exampleSound}</p>
        </div>
        <p className="text-xs text-th-text-2 leading-relaxed">
          {haraka.description}
        </p>
        <p className="text-[0.7rem] text-emerald-600 dark:text-emerald-300/90">
          <strong>Tip:</strong> {haraka.tip}
        </p>
      </div>
    </div>
  )
}

interface HarakatDemoListProps {
  harakaIds: string[]
  letterId?: string
  /** Backend API base URL */
  apiBaseUrl?: string
  className?: string
}

export function HarakatDemoList({
  harakaIds,
  letterId = 'baa',
  apiBaseUrl = 'https://read-arabic-with-ease-backend.onrender.com',
  className = '',
}: HarakatDemoListProps) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {harakaIds.map((id) => (
        <HarakatDemo
          key={id}
          harakaId={id}
          letterId={letterId}
          audioUrl={`${apiBaseUrl}/api/audio/haraka/${id}`}
        />
      ))}
    </div>
  )
}
