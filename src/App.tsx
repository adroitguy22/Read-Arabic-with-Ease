import './App.css'
import { HarakatText } from './components/HarakatText'
import { useEffect, useMemo, useState } from 'react'
import { useProgress } from './context/ProgressContext'
import { LetterCardList } from './components/LetterCard'
import { PositionComparisonList } from './components/PositionComparison'
import { HarakatDemoList } from './components/HarakatDemo'
import type { Lesson, Level } from './data/curriculum'
import { curriculum } from './data/curriculum'

type ActiveSelection = {
  level: Level
  lesson: Lesson
}

function useActiveSelection(): [ActiveSelection, (levelId: string, lessonId?: string) => void] {
  const initialLevel = curriculum[0]
  const initialLesson = initialLevel.lessons[0]

  const [selectedLevelId, setSelectedLevelId] = useState<string>(initialLevel.id)
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLesson.id)

  const active = useMemo<ActiveSelection>(() => {
    const level = curriculum.find((l) => l.id === selectedLevelId) ?? curriculum[0]
    const lesson =
      level.lessons.find((lsn) => lsn.id === selectedLessonId) ?? level.lessons[0]
    return { level, lesson }
  }, [selectedLevelId, selectedLessonId])

  const setSelection = (levelId: string, lessonId?: string) => {
    const level = curriculum.find((l) => l.id === levelId)
    if (!level) return
    setSelectedLevelId(levelId)
    setSelectedLessonId(lessonId ?? level.lessons[0]?.id ?? '')
  }

  return [active, setSelection]
}

function App() {
  const [active, setSelection] = useActiveSelection()
  const [levelsExpanded, setLevelsExpanded] = useState(true)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 lg:py-10">
        <Header />
        <main className="mt-6 grid flex-1 gap-6 lg:mt-8 lg:grid-cols-[auto_1fr]">
          <LevelsPanel
            active={active}
            setSelection={setSelection}
            isExpanded={levelsExpanded}
            toggleExpanded={() => setLevelsExpanded(!levelsExpanded)}
          />
          <LessonPanel active={active} />
        </main>
        <footer className="mt-8 border-t border-white/5 pt-4 text-xs text-slate-400 font-arabic">
          مركز أول للعربية — a gentle doorway into the language of the Qur&apos;an. From first letters to confident, expert-level reading.
        </footer>
      </div>
    </div>
  )
}

function Header() {
  const { progress } = useProgress()
  const completedCount = progress.lessonProgress.length
  const totalLessons = curriculum.reduce((s, l) => s + l.lessons.length, 0)

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-5">
        <img
          src="/logo.jpg"
          alt="Awwal Logo"
          className="h-20 w-20 rounded-2xl object-cover shadow-lg shadow-black/40 ring-1 ring-white/10"
        />
        <div>
          <p className="font-arabic text-xl font-bold text-emerald-400">
            مركز أول للعربية
          </p>
          <h1 className="mt-1 text-balance text-3xl font-semibold tracking-tight text-white lg:text-4xl">
            A gentle doorway into the language of the Qur&apos;an
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            From your first encounter with Arabic letters to confident, expert-level Qur&apos;anic reading — structured, intuitive, and mastery-focused.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch lg:max-w-sm">
        <div className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-emerald-400/5 px-4 py-3 text-xs text-emerald-100 shadow-lg shadow-emerald-500/15">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
            Your progress
          </p>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-emerald-50/90">
            <span className="font-semibold text-emerald-200">{completedCount}</span> of {totalLessons} lessons completed
            {progress.streakDays > 0 && (
              <> · <span className="font-semibold text-amber-200">{progress.streakDays} day streak</span></>
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Learning path
          </p>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-slate-200">
            Huruf → Positions → Arakat → Sound → Combination → Practice
          </p>
        </div>
      </div>
    </header>
  )
}

interface LevelsPanelProps {
  active: ActiveSelection
  setSelection: (levelId: string, lessonId?: string) => void
  isExpanded: boolean
  toggleExpanded: () => void
}

function LevelsPanel({ active, setSelection, isExpanded, toggleExpanded }: LevelsPanelProps) {
  const { isCompleted } = useProgress()

  return (
    <section aria-label="Learning levels" className={`space-y-4 transition-all duration-300 ${isExpanded ? 'w-full lg:w-80' : 'w-full lg:w-20'}`}>
      <div className="flex items-center justify-between gap-2">
        {isExpanded && (
          <div>
            <h2 className="text-sm font-medium text-slate-100">Learning path</h2>
            <p className="text-xs text-slate-400">
              Start where you are.
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          {isExpanded && (
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-medium text-emerald-300 ring-1 ring-emerald-500/30">
              {curriculum.length} stages
            </span>
          )}
          <button onClick={toggleExpanded} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            {isExpanded ? '«' : '»'}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
        {curriculum.map((level, index) => {
          const isActive = level.id === active.level.id
          const completedInLevel = level.lessons.filter((l) => isCompleted(level.id, l.id)).length

          if (!isExpanded) {
            return (
              <button
                key={level.id}
                title={level.title}
                onClick={() => setSelection(level.id)}
                className={[
                  'flex h-12 w-12 items-center justify-center rounded-2xl border transition-all',
                  level.colorClass,
                  isActive ? 'border-white/80 ring-2 ring-emerald-400/70' : 'border-white/10 hover:border-emerald-400/60'
                ].join(' ')}
              >
                <span className="text-xs font-bold text-slate-100">{index + 1}</span>
              </button>
            )
          }

          return (
            <button
              key={level.id}
              type="button"
              onClick={() => setSelection(level.id)}
              className={[
                'group flex w-full items-start gap-3 rounded-2xl border bg-gradient-to-br px-4 py-3 text-left transition-all',
                level.colorClass,
                isActive
                  ? 'border-white/80 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400/70'
                  : 'border-white/10 hover:border-emerald-400/60 hover:ring-1 hover:ring-emerald-400/40',
              ].join(' ')}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950/80 text-[0.7rem] font-semibold text-emerald-300 ring-1 ring-emerald-500/40">
                {index + 1}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
                      {level.stageLabel}
                    </p>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-50">
                      {level.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-black/30 px-2.5 py-1 text-[0.65rem] text-slate-200">
                    {completedInLevel}/{level.lessons.length}
                  </span>
                </div>
                <p className="mt-1 text-[0.8rem] text-slate-200/90">{level.description}</p>
                <p className="mt-1 text-[0.75rem] text-emerald-100/90">
                  Focus: <span className="font-medium">{level.focus}</span>
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

interface LessonPanelProps {
  active: ActiveSelection
}

function LessonPanel({ active }: LessonPanelProps) {
  const { isCompleted, completeLesson } = useProgress()
  const [currentLessonId, setCurrentLessonId] = useState<string>(active.lesson.id)

  const lesson =
    active.level.lessons.find((lsn) => lsn.id === currentLessonId) ?? active.level.lessons[0]

  useEffect(() => {
    setCurrentLessonId(active.lesson.id)
  }, [active.level.id, active.lesson.id])

  return (
    <section
      aria-label="Lesson details and practice"
      className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.85)] lg:p-5"
    >
      <div className="flex flex-col gap-3 border-b border-white/5 pb-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">
            {active.level.title}{' '}
            <span className="ml-2 rounded-full bg-white/5 px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-emerald-200/90">
              {active.level.stageLabel}
            </span>
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400">
            Choose a lesson, review the goal, then complete the guided practice exercises.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-900/70 px-3 py-2 text-[0.7rem] text-slate-300">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium text-slate-100">Recommended order</span>
          <span className="text-slate-400">Work from left to right, one lesson at a time.</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        <aside className="w-full max-w-xs space-y-2 border-r border-white/5 pr-3 text-xs lg:w-52">
          {active.level.lessons.map((lsn, index) => {
            const isSelected = lsn.id === lesson.id
            return (
              <button
                key={lsn.id}
                type="button"
                onClick={() => setCurrentLessonId(lsn.id)}
                className={[
                  'flex w-full items-start gap-2 rounded-2xl px-3 py-2 text-left transition',
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-50 ring-1 ring-emerald-400/70'
                    : 'bg-slate-900/60 text-slate-200 hover:bg-slate-800/90 hover:text-white',
                ].join(' ')}
              >
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-black/40 text-[0.65rem] text-slate-200">
                  {isCompleted(active.level.id, lsn.id) ? '✓' : index + 1}
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-[0.8rem] font-semibold">{lsn.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[0.7rem] text-slate-300">
                    {lsn.description}
                  </p>
                </div>
              </button>
            )
          })}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:pl-1">
          <LessonOverview lesson={lesson} />
          <LessonExercises
            lesson={lesson}
            levelId={active.level.id}
            onComplete={() => completeLesson(active.level.id, lesson.id)}
          />
        </div>
      </div>
    </section>
  )
}

interface LessonOverviewProps {
  lesson: Lesson
}

function LessonOverview({ lesson }: LessonOverviewProps) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/80 p-4 text-xs text-slate-200 lg:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300/90">
            Lesson focus
          </p>
          <h3 className="mt-1 text-[0.95rem] font-semibold text-slate-50">{lesson.title}</h3>
        </div>
        <CategoryBadge category={lesson.category} />
      </div>
      <p className="mt-2 text-[0.78rem] text-slate-300">{lesson.description}</p>

      {lesson.objectives.length > 0 && (
        <div className="mt-3 grid gap-1.5 text-[0.75rem] text-slate-300 sm:grid-cols-2">
          {lesson.objectives.map((obj) => (
            <div key={obj} className="flex items-start gap-1.5">
              <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      )}

      {lesson.letterIds && lesson.letterIds.length > 0 && lesson.category === 'huruf' && (
        <div className="mt-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-emerald-300/90">Letters in this lesson</p>
          <LetterCardList letterIds={lesson.letterIds} showArticulation className="mt-2" />
        </div>
      )}

      {lesson.letterIds && lesson.letterIds.length > 0 && lesson.category === 'positions' && (
        <div className="mt-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-sky-300/90">Position forms</p>
          <PositionComparisonList letterIds={lesson.letterIds} className="mt-2" />
        </div>
      )}

      {lesson.harakaIds && lesson.harakaIds.length > 0 && (
        <div className="mt-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-amber-300/90">Vowel marks (Arakat)</p>
          <HarakatDemoList harakaIds={lesson.harakaIds} className="mt-2" />
        </div>
      )}

      {lesson.practiceWords && lesson.practiceWords.length > 0 && (
        <div className="mt-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-violet-300/90">Practice words</p>
          <div dir="rtl" className="mt-2 flex flex-wrap gap-2 font-arabic text-2xl text-violet-100">
            {lesson.practiceWords.map((w, i) => (
              <span key={i} className="cursor-pointer rounded-xl bg-slate-800/80 px-3 py-1.5 transition-colors hover:bg-slate-700 hover:text-white">{w}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface CategoryBadgeProps {
  category: Lesson['category']
}

function CategoryBadge({ category }: CategoryBadgeProps) {
  const labelMap: Record<Lesson['category'], string> = {
    huruf: 'Huruf recognition',
    positions: 'Word positions',
    harakat: 'Harakat & vowels',
    combination: 'Combining letters',
    reading: 'Reading practice',
    'quran-reading': 'Qur\'anic reading',
    tajweed: 'Tajweed rules',
  }

  const colorMap: Record<Lesson['category'], string> = {
    huruf: 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/60',
    positions: 'bg-sky-500/15 text-sky-200 ring-sky-400/60',
    harakat: 'bg-amber-500/15 text-amber-200 ring-amber-400/60',
    combination: 'bg-violet-500/15 text-violet-200 ring-violet-400/60',
    reading: 'bg-fuchsia-500/15 text-fuchsia-200 ring-fuchsia-400/60',
    'quran-reading': 'bg-rose-500/15 text-rose-200 ring-rose-400/60',
    tajweed: 'bg-yellow-500/15 text-yellow-200 ring-yellow-400/60',
  }

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-medium ring-1',
        colorMap[category],
      ].join(' ')}
    >
      {labelMap[category]}
    </span>
  )
}

interface LessonExercisesProps {
  lesson: Lesson
  levelId: string
  onComplete: () => void
}

function LessonExercises({ lesson, levelId, onComplete }: LessonExercisesProps) {
  const { isCompleted } = useProgress()
  const [index, setIndex] = useState(0)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)

  const exercise = lesson.exercises[index]
  const isLast = index === lesson.exercises.length - 1
  const alreadyCompleted = isCompleted(levelId, lesson.id)

  if (!exercise) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/70 p-6 text-xs text-slate-400">
        No exercises added yet for this lesson.
      </div>
    )
  }

  const correctChoice = exercise.choices.find((c) => c.isCorrect)

  const handleCheck = () => {
    if (!selectedChoiceId) return
    setAnswered(true)
  }

  const handleNext = () => {
    if (!answered) return
    if (!isLast) {
      setIndex((prev) => prev + 1)
      setSelectedChoiceId(null)
      setAnswered(false)
    }
  }

  const handleRestart = () => {
    setIndex(0)
    setSelectedChoiceId(null)
    setAnswered(false)
  }

  const isCorrect = answered && selectedChoiceId && exercise.choices.find((c) => c.id === selectedChoiceId)?.isCorrect

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-white/8 bg-slate-950/90 p-4 text-xs sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[0.7rem] text-slate-300">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[0.7rem] font-semibold text-slate-100 ring-1 ring-slate-700">
            {index + 1}
          </span>
          <span>
            Exercise {index + 1} of {lesson.exercises.length}
          </span>
        </div>
        {answered && (
          <span
            className={[
              'rounded-full px-3 py-1 text-[0.7rem] font-medium',
              isCorrect
                ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/70'
                : 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/70',
            ].join(' ')}
          >
            {isCorrect ? 'Correct' : 'Try to notice the pattern'}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-3 rounded-2xl bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-[0.8rem] font-medium text-slate-100">{exercise.prompt}</p>
          {exercise.promptNote && (
            <p className="mt-1 text-[0.75rem] text-slate-300">{exercise.promptNote}</p>
          )}
        </div>
        {(exercise.promptArabic || exercise.audioUrl) && (
          <div className="mt-2 flex flex-col items-end gap-2 sm:mt-0">
            {exercise.promptArabic && (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 px-6 py-4 text-right shadow-inner shadow-slate-900/80">
                <HarakatText
                  text={exercise.promptArabic}
                  size="2xl"
                  className="text-emerald-50 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                />
              </div>
            )}
            {exercise.audioUrl && (
              <button
                type="button"
                onClick={() => {
                  const audio = new Audio(exercise.audioUrl)
                  audio.play().catch(() => {
                    // Fail silently if audio is missing or cannot be played
                  })
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[0.7rem] font-medium text-emerald-100 ring-1 ring-emerald-500/50 hover:bg-emerald-500/10"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/80 text-[0.55rem] text-emerald-950">
                  ▶
                </span>
                Play sound
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {exercise.choices.map((choice) => {
          const isSelected = choice.id === selectedChoiceId
          const showAsCorrect = answered && choice.isCorrect
          const showAsIncorrect = answered && isSelected && !choice.isCorrect

          return (
            <button
              key={choice.id}
              type="button"
              onClick={() => {
                setSelectedChoiceId(choice.id)
                if (answered) {
                  setAnswered(false)
                }
              }}
              className={[
                'group flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-[0.8rem] transition',
                'bg-slate-950/80 hover:bg-slate-900',
                'border-slate-700/80 hover:border-emerald-400/50',
                isSelected && !answered && 'border-emerald-400/80 bg-emerald-500/10',
                showAsCorrect &&
                'border-emerald-400 bg-emerald-500/15 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]',
                showAsIncorrect && 'border-rose-400 bg-rose-500/10',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[0.7rem] text-slate-200">
                {choice.label.charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 text-slate-100 group-hover:text-white">{choice.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[0.7rem] text-slate-400">
          {correctChoice && (
            <span>
              Tip:{' '}
              <span className="text-slate-200">
                pay attention to how {correctChoice.label} is written.
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!answered && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!selectedChoiceId}
              className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-1.5 text-[0.78rem] font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200 disabled:shadow-none"
            >
              Check answer
            </button>
          )}
          {answered && !isLast && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center rounded-full bg-slate-800 px-4 py-1.5 text-[0.78rem] font-medium text-slate-50 ring-1 ring-slate-600 hover:bg-slate-700"
            >
              Next exercise
            </button>
          )}
          {answered && isLast && (
            <>
              {!alreadyCompleted && (
                <button
                  type="button"
                  onClick={() => onComplete()}
                  className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-1.5 text-[0.78rem] font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
                >
                  Mark as complete
                </button>
              )}
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center rounded-full bg-slate-800 px-4 py-1.5 text-[0.78rem] font-medium text-slate-50 ring-1 ring-emerald-500/60 hover:bg-slate-700"
              >
                Restart lesson
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
