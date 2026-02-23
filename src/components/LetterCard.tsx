import { getLetter } from '../data/letters'
import { AudioPlayer } from './AudioPlayer'

interface LetterCardProps {
  letterId: string
  /** Show isolated form only, or all forms */
  showForms?: 'isolated' | 'all'
  /** Show articulation tip */
  showArticulation?: boolean
  audioUrl?: string
  className?: string
}

export function LetterCard({
  letterId,
  showForms = 'isolated',
  showArticulation = true,
  audioUrl,
  className = '',
}: LetterCardProps) {
  const letter = getLetter(letterId)
  if (!letter) return null

  return (
    <div
      className={`rounded-2xl border border-th-border bg-th-surface backdrop-blur-sm p-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div dir="rtl" className="cursor-pointer font-arabic text-4xl text-emerald-700 dark:text-emerald-50 transition-all hover:scale-110 hover:text-emerald-500 dark:hover:text-emerald-300 active:scale-95">
            {showForms === 'all'
              ? `${letter.forms.isolated} ${letter.forms.initial} ${letter.forms.medial} ${letter.forms.final}`
              : letter.forms.isolated}
          </div>
          {audioUrl && (
            <AudioPlayer src={audioUrl} label="Listen" repeat slowOption />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-th-text">
            {letter.name}
            <span className="ml-2 text-th-muted">({letter.nameAr})</span>
          </p>
          <p className="text-[0.7rem] text-th-muted">Sound: {letter.soundHint}</p>
        </div>
        {showArticulation && (
          <p className="text-xs text-th-text-2 leading-relaxed">
            <span className="text-[0.65rem] uppercase tracking-wider text-emerald-600 dark:text-emerald-400/80">
              Pronunciation tip
            </span>
            <br />
            {letter.articulation}
          </p>
        )}
      </div>
    </div>
  )
}

interface LetterCardListProps {
  letterIds: string[]
  showArticulation?: boolean
  /** Backend API base URL */
  apiBaseUrl?: string
  className?: string
}

export function LetterCardList({
  letterIds,
  showArticulation = false,
  apiBaseUrl = 'https://read-arabic-with-ease-backend.onrender.com',
  className = '',
}: LetterCardListProps) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {letterIds.map((id) => (
        <LetterCard
          key={id}
          letterId={id}
          showForms="isolated"
          showArticulation={showArticulation}
          audioUrl={`${apiBaseUrl}/api/audio/letter/${id}`}
        />
      ))}
    </div>
  )
}
