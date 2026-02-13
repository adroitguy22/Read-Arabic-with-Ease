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
      className={`rounded-2xl border border-white/10 bg-slate-900/60 p-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div dir="rtl" className="cursor-pointer font-arabic text-4xl text-emerald-50 transition-all hover:scale-110 hover:text-emerald-300 active:scale-95">
            {showForms === 'all'
              ? `${letter.forms.isolated} ${letter.forms.initial} ${letter.forms.medial} ${letter.forms.final}`
              : letter.forms.isolated}
          </div>
          {audioUrl && (
            <AudioPlayer src={audioUrl} label="Listen" repeat slowOption />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">
            {letter.name}
            <span className="ml-2 text-slate-400">({letter.nameAr})</span>
          </p>
          <p className="text-[0.7rem] text-slate-400">Sound: {letter.soundHint}</p>
        </div>
        {showArticulation && (
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="text-[0.65rem] uppercase tracking-wider text-emerald-400/80">
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
  /** Backend API base URL (e.g., 'http://localhost:3001') */
  apiBaseUrl?: string
  className?: string
}

export function LetterCardList({
  letterIds,
  showArticulation = false,
  apiBaseUrl = 'http://localhost:3001',
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
