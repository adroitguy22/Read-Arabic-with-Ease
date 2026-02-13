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
      className={`rounded-2xl border border-white/10 bg-slate-900/60 p-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div dir="rtl" className="cursor-pointer font-arabic text-4xl text-amber-50 transition-all hover:scale-110 hover:text-amber-300 active:scale-95">
            {withHaraka}
          </div>
          {audioUrl && (
            <AudioPlayer src={audioUrl} label="Listen" repeat slowOption />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">
            {haraka.name}
            <span className="ml-2 text-slate-400">({haraka.nameAr})</span>
          </p>
          <p className="text-xs text-amber-200/90">{haraka.exampleSound}</p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {haraka.description}
        </p>
        <p className="text-[0.7rem] text-emerald-300/90">
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
  apiBaseUrl = 'http://localhost:3001',
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
