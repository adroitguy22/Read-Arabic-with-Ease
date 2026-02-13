import './App.css'
import { HarakatText } from './components/HarakatText'
import { AuthModal } from './components/AuthModal'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './context/AuthContext'
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 overflow-x-hidden">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-3 sm:px-4 sm:py-4 lg:py-6">
        <Header 
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        />
        <main className="mt-3 grid flex-1 gap-3 lg:mt-5 lg:gap-5 lg:grid-cols-[280px_1fr]">
          {/* Desktop Sidebar */}
          <DesktopSidebar 
            active={active} 
            setSelection={setSelection} 
          />
          
          {/* Main Content Area */}
          <LessonPanel 
            active={active} 
            setSelection={setSelection}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
        </main>
        
        {/* Mobile Navigation Drawer */}
        <MobileNavDrawer
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          active={active}
          setSelection={setSelection}
        />
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
        
        <footer className="mt-4 border-t border-white/5 pt-3 text-[0.65rem] text-slate-400 font-arabic sm:mt-6 sm:pt-4 sm:text-xs lg:mt-8">
          مركز أول للعربية — a gentle doorway into the language of the Qur&apos;an
        </footer>
      </div>
    </div>
  )
}

interface HeaderProps {
  onOpenMobileNav?: () => void
  onOpenAuth?: () => void
}

function Header({ onOpenMobileNav, onOpenAuth }: HeaderProps = {}) {
  const { progress } = useProgress()
  const { user, isAuthenticated, logout } = useAuth()
  const completedCount = progress.lessonProgress.length
  const totalLessons = curriculum.reduce((s, l) => s + l.lessons.length, 0)

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2 sm:gap-3 lg:gap-5 min-w-0">
        <img
          src="/logo.png"
          alt="Awwal Logo"
          className="h-10 w-10 sm:h-14 sm:w-14 lg:h-20 lg:w-20 flex-shrink-0 rounded-xl sm:rounded-2xl object-cover shadow-lg shadow-black/40 ring-1 ring-white/10"
        />
        <div className="min-w-0">
          <p className="font-arabic text-sm sm:text-base lg:text-xl font-bold text-emerald-400">
            مركز أول للعربية
          </p>
          <p className="mt-0.5 sm:mt-1 max-w-2xl text-[0.7rem] sm:text-xs lg:text-sm text-slate-300 hidden sm:block">
            From your first encounter with Arabic letters to confident, expert-level Qur&apos;anic reading.
          </p>
        </div>
      </div>
      
      {/* Top right: Auth + Mobile menu + Progress stats */}
      <div className="flex items-start gap-2 sm:gap-3 flex-shrink-0">
        {/* Auth Button / User Info */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-200">{user?.name || user?.email}</span>
              <span className="text-[0.6rem] text-emerald-400">{progress.streakDays > 0 && `${progress.streakDays}🔥`}</span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-300 px-3 py-2 text-xs font-medium text-slate-300 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-2 text-xs font-medium transition"
          >
            Sign In
          </button>
        )}

        {/* Mobile hamburger menu button - Top right */}
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 px-3 py-2 text-slate-200 transition"
            aria-label="Open navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium hidden sm:inline">Menu</span>
          </button>
        )}

        {/* Progress Stats - Desktop only */}
        <div className="hidden lg:flex flex-col gap-2 lg:gap-3 lg:flex-row lg:items-stretch lg:max-w-sm">
          <div className="rounded-xl lg:rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-emerald-400/5 px-3 py-2 lg:px-4 lg:py-3 text-[0.65rem] lg:text-xs text-emerald-100 shadow-lg shadow-emerald-500/15">
            <p className="text-[0.6rem] lg:text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-200/80">
              Progress
            </p>
            <p className="mt-0.5 lg:mt-1 text-[0.7rem] lg:text-[0.8rem] leading-relaxed text-emerald-50/90">
              <span className="font-semibold text-emerald-200">{completedCount}</span> / {totalLessons} lessons
              {progress.streakDays > 0 && (
                <> · <span className="font-semibold text-amber-200">{progress.streakDays}🔥</span></>
              )}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}

interface DesktopSidebarProps {
  active: ActiveSelection
  setSelection: (levelId: string, lessonId?: string) => void
}

function DesktopSidebar({ active, setSelection }: DesktopSidebarProps) {
  const { isCompleted } = useProgress()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className="hidden lg:block space-y-4">
      {/* Stages Section */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">Learning Stages</h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
          >
            {isCollapsed ? '»' : '«'}
          </button>
        </div>
        
        <div className={`space-y-2 transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
          {curriculum.map((level, index) => {
            const isActive = level.id === active.level.id
            const completedInLevel = level.lessons.filter((l) => isCompleted(level.id, l.id)).length
            
            return (
              <button
                key={level.id}
                onClick={() => setSelection(level.id)}
                className={[
                  'w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                  level.colorClass,
                  isActive
                    ? 'ring-2 ring-emerald-400/70 border border-white/30'
                    : 'border border-transparent hover:border-white/10',
                ].join(' ')}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950/80 text-[0.7rem] font-bold text-emerald-300">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-100 truncate">{level.title}</span>
                    <span className="text-[0.6rem] text-slate-400">{completedInLevel}/{level.lessons.length}</span>
                  </div>
                  <p className="text-[0.65rem] text-slate-400 truncate">{level.focus}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lessons Section */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-100 mb-3">{active.level.title}</h2>
        <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
          {active.level.lessons.map((lesson, index) => {
            const isSelected = lesson.id === active.lesson.id
            const completed = isCompleted(active.level.id, lesson.id)
            
            return (
              <button
                key={lesson.id}
                onClick={() => setSelection(active.level.id, lesson.id)}
                className={[
                  'w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition',
                  isSelected
                    ? 'bg-emerald-500/15 text-emerald-50 ring-1 ring-emerald-400/50'
                    : 'text-slate-300 hover:bg-slate-800/50',
                ].join(' ')}
              >
                <div className={[
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[0.6rem]',
                  completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                ].join(' ')}>
                  {completed ? '✓' : index + 1}
                </div>
                <span className="truncate">{lesson.title}</span>
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  active: ActiveSelection
  setSelection: (levelId: string, lessonId?: string) => void
}

function MobileNavDrawer({ isOpen, onClose, active, setSelection }: MobileNavDrawerProps) {
  const { isCompleted } = useProgress()
  const [activeTab, setActiveTab] = useState<'stages' | 'lessons'>('stages')

  if (!isOpen) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-slate-900 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="font-arabic text-lg font-bold text-emerald-400">مركز أول</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4 p-1 bg-slate-800/50 rounded-xl">
            <button
              onClick={() => setActiveTab('stages')}
              className={[
                'flex-1 py-2 text-xs font-medium rounded-lg transition',
                activeTab === 'stages' 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : 'text-slate-400 hover:text-slate-200'
              ].join(' ')}
            >
              Stages ({curriculum.length})
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={[
                'flex-1 py-2 text-xs font-medium rounded-lg transition',
                activeTab === 'lessons' 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : 'text-slate-400 hover:text-slate-200'
              ].join(' ')}
            >
              Lessons ({active.level.lessons.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {activeTab === 'stages' ? (
            <div className="space-y-2">
              {curriculum.map((level, index) => {
                const isActive = level.id === active.level.id
                const completedInLevel = level.lessons.filter((l) => isCompleted(level.id, l.id)).length
                
                return (
                  <button
                    key={level.id}
                    onClick={() => {
                      setSelection(level.id)
                      setActiveTab('lessons')
                    }}
                    className={[
                      'w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-all',
                      level.colorClass,
                      isActive
                        ? 'ring-2 ring-emerald-400/70 border border-white/30'
                        : 'border border-transparent',
                    ].join(' ')}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-950/80 text-sm font-bold text-emerald-300">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-100">{level.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{level.stageLabel}</p>
                      <p className="text-[0.65rem] text-slate-500 mt-1">
                        {completedInLevel}/{level.lessons.length} completed
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-2 mb-2">
                <p className="text-xs text-slate-500">{active.level.title}</p>
                <p className="text-[0.65rem] text-slate-600">{active.level.focus}</p>
              </div>
              {active.level.lessons.map((lesson, index) => {
                const isSelected = lesson.id === active.lesson.id
                const completed = isCompleted(active.level.id, lesson.id)
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelection(active.level.id, lesson.id)
                      onClose()
                    }}
                    className={[
                      'w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition',
                      isSelected
                        ? 'bg-emerald-500/15 text-emerald-50 ring-1 ring-emerald-400/50'
                        : 'text-slate-300 hover:bg-slate-800/50',
                    ].join(' ')}
                  >
                    <div className={[
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs',
                      completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    ].join(' ')}>
                      {completed ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{lesson.title}</p>
                      <p className="text-[0.65rem] text-slate-500 truncate">{lesson.description.slice(0, 50)}...</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface LessonPanelProps {
  active: ActiveSelection
  setSelection: (levelId: string, lessonId?: string) => void
  onOpenMobileNav: () => void
}

function LessonPanel({ active, setSelection, onOpenMobileNav }: LessonPanelProps) {
  const { isCompleted: _isCompleted, completeLesson } = useProgress()

  return (
    <section
      aria-label="Lesson details and practice"
      className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-white/10 bg-slate-950/60 p-3 sm:p-4 lg:p-5"
    >
      {/* Mobile Header with Stage/Lesson Info */}
      <div className="lg:hidden">
        <button
          onClick={onOpenMobileNav}
          className="w-full flex items-center justify-between gap-2 rounded-xl bg-slate-900/70 px-3 py-2.5 text-left hover:bg-slate-800/80 transition"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400">
              {curriculum.findIndex(l => l.id === active.level.id) + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 truncate">{active.level.title}</p>
              <p className="text-sm font-medium text-slate-100 truncate">{active.lesson.title}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-300/90">Lesson Focus</p>
          <h2 className="text-lg font-semibold text-slate-50">{active.lesson.title}</h2>
        </div>
        <CategoryBadge category={active.lesson.category} />
      </div>

      {/* Mobile Category Badge */}
      <div className="lg:hidden">
        <CategoryBadge category={active.lesson.category} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <LessonOverview lesson={active.lesson} />
        <div className="mt-4">
          <LessonExercises
            lesson={active.lesson}
            levelId={active.level.id}
            onComplete={() => completeLesson(active.level.id, active.lesson.id)}
            onNextLesson={() => {
              // Find current lesson index
              const currentLessonIndex = active.level.lessons.findIndex(l => l.id === active.lesson.id)
              
              // If there's a next lesson in the same level
              if (currentLessonIndex < active.level.lessons.length - 1) {
                const nextLesson = active.level.lessons[currentLessonIndex + 1]
                setSelection(active.level.id, nextLesson.id)
              } else {
                // Find next level
                const currentLevelIndex = curriculum.findIndex(l => l.id === active.level.id)
                if (currentLevelIndex < curriculum.length - 1) {
                  const nextLevel = curriculum[currentLevelIndex + 1]
                  setSelection(nextLevel.id, nextLevel.lessons[0]?.id)
                }
              }
              // Scroll to top of page
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
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
    <div className="rounded-xl sm:rounded-2xl border border-white/8 bg-slate-950/80 p-3 sm:p-4 lg:p-5 text-xs sm:text-sm text-slate-200">
      <p className="text-[0.7rem] sm:text-xs text-slate-400 mb-2">{lesson.description}</p>

      {lesson.objectives.length > 0 && (
        <div className="mt-3 sm:mt-4 grid gap-1.5 sm:gap-2 text-[0.7rem] sm:text-xs text-slate-300 sm:grid-cols-2">
          {lesson.objectives.map((obj) => (
            <div key={obj} className="flex items-start gap-1.5">
              <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      )}

      {lesson.letterIds && lesson.letterIds.length > 0 && lesson.category === 'huruf' && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-emerald-300/90 mb-2">Letters in this lesson</p>
          <LetterCardList letterIds={lesson.letterIds} showArticulation className="mt-2" />
        </div>
      )}

      {lesson.letterIds && lesson.letterIds.length > 0 && lesson.category === 'positions' && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-sky-300/90 mb-2">Position forms</p>
          <PositionComparisonList letterIds={lesson.letterIds} className="mt-2" />
        </div>
      )}

      {lesson.harakaIds && lesson.harakaIds.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-2">Vowel marks (Arakat)</p>
          <HarakatDemoList harakaIds={lesson.harakaIds} className="mt-2" />
        </div>
      )}

      {lesson.practiceWords && lesson.practiceWords.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-violet-300/90 mb-2">Practice words</p>
          <div dir="rtl" className="mt-2 flex flex-wrap gap-2 font-arabic text-xl sm:text-2xl text-violet-100">
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
    huruf: 'Huruf',
    positions: 'Positions',
    harakat: 'Harakat',
    combination: 'Combination',
    reading: 'Reading',
    'quran-reading': 'Quran',
    tajweed: 'Tajweed',
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
        'inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] sm:text-xs font-medium ring-1',
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
  onNextLesson?: () => void
}

function LessonExercises({ lesson, levelId, onComplete, onNextLesson }: LessonExercisesProps) {
  const { isCompleted } = useProgress()
  const [index, setIndex] = useState(0)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [shuffledChoices, setShuffledChoices] = useState<typeof exercise.choices>([])

  const exercise = lesson.exercises[index]
  const isLast = index === lesson.exercises.length - 1
  const alreadyCompleted = isCompleted(levelId, lesson.id)

  // Shuffle choices when exercise changes using Fisher-Yates algorithm
  useEffect(() => {
    if (exercise) {
      // Proper Fisher-Yates shuffle for unbiased randomization
      const array = [...exercise.choices]
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      setShuffledChoices(array)
      setSelectedChoiceId(null)
      setAnswered(false)
    }
  }, [exercise])

  if (!exercise) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/70 p-6 text-xs text-slate-400">
        No exercises added yet for this lesson.
      </div>
    )
  }

  const correctChoice = shuffledChoices.find((c) => c.isCorrect)

  const handleCheck = () => {
    if (!selectedChoiceId) return
    setAnswered(true)
  }

  const handleNext = () => {
    if (!answered) return
    if (!isLast) {
      setIndex((prev) => prev + 1)
    }
  }

  const handleRestart = () => {
    setIndex(0)
  }

  const isCorrect = answered && selectedChoiceId && shuffledChoices.find((c) => c.id === selectedChoiceId)?.isCorrect

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl sm:rounded-2xl border border-white/8 bg-slate-950/90 p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[0.65rem] sm:text-xs text-slate-300">
          <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-900 text-[0.65rem] sm:text-xs font-semibold text-slate-100 ring-1 ring-slate-700">
            {index + 1}
          </span>
          <span>
            Exercise {index + 1} of {lesson.exercises.length}
          </span>
        </div>
        {answered && (
          <span
            className={[
              'rounded-full px-2.5 sm:px-3 py-1 text-[0.65rem] sm:text-xs font-medium',
              isCorrect
                ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/70'
                : 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/70',
            ].join(' ')}
          >
            {isCorrect ? 'Correct' : 'Keep trying'}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-3 rounded-xl sm:rounded-2xl bg-slate-900/70 p-3 sm:p-4">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-100">{exercise.prompt}</p>
          {exercise.promptNote && (
            <p className="mt-1 text-[0.7rem] sm:text-xs text-slate-300">{exercise.promptNote}</p>
          )}
        </div>
        {(exercise.promptArabic || exercise.audioUrl) && (
          <div className="mt-2 flex flex-col items-end gap-2">
            {exercise.promptArabic && (
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 px-4 sm:px-6 py-3 sm:py-4 text-right shadow-inner shadow-slate-900/80">
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
                    // Fail silently if audio is missing
                  })
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[0.65rem] sm:text-xs font-medium text-emerald-100 ring-1 ring-emerald-500/50 hover:bg-emerald-500/10"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/80 text-[0.55rem] text-emerald-950">
                  ▶
                </span>
                Play
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
        {shuffledChoices.map((choice) => {
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
                'group flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs sm:text-sm transition',
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
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 items-center justify-center rounded-lg bg-slate-900 text-[0.65rem] sm:text-xs text-slate-200">
                {getTransliterationOnly(choice.label).charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 text-slate-100 group-hover:text-white">{getTransliterationOnly(choice.label)}</span>
            </button>
          )
        })}
      </div>

      {/* Interactive Quiz Alert */}
      {answered && (
        <QuizAlert 
          isCorrect={!!isCorrect} 
          correctChoice={correctChoice}
        />
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[0.65rem] sm:text-xs text-slate-400">
          {answered && isCorrect && (
            <span className="text-emerald-400">Great job! Keep it up!</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!answered && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!selectedChoiceId}
              className="inline-flex items-center rounded-full bg-emerald-500 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200 disabled:shadow-none"
            >
              Check
            </button>
          )}
          {answered && !isLast && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center rounded-full bg-slate-800 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-50 ring-1 ring-slate-600 hover:bg-slate-700"
            >
              Next
            </button>
          )}
          {answered && isLast && (
            <>
              {!alreadyCompleted && (
                <button
                  type="button"
                  onClick={() => onComplete()}
                  className="inline-flex items-center rounded-full bg-emerald-500 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
                >
                  Complete
                </button>
              )}
              {alreadyCompleted && onNextLesson && (
                <button
                  type="button"
                  onClick={onNextLesson}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400"
                >
                  Next Lesson
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex items-center rounded-full bg-slate-800 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-slate-50 ring-1 ring-emerald-500/60 hover:bg-slate-700"
              >
                Restart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to extract only transliteration (remove Arabic characters and brackets)
function getTransliterationOnly(label: string): string {
  // Remove Arabic characters (Unicode range: \u0600-\u06FF)
  // Also remove Arabic presentation forms (\uFE70-\uFEFF) and Arabic punctuation
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g
  let cleaned = label.replace(arabicRegex, '').trim()
  // Remove empty parentheses
  cleaned = cleaned.replace(/\(\s*\)/g, '').trim()
  return cleaned
}

interface QuizAlertProps {
  isCorrect: boolean
  correctChoice?: { id: string; label: string; isCorrect: boolean }
}

function QuizAlert({ isCorrect, correctChoice }: QuizAlertProps) {
  return (
    <div 
      className={[
        'rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isCorrect 
          ? 'bg-emerald-500/10 border border-emerald-500/30' 
          : 'bg-rose-500/10 border border-rose-500/30'
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={[
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          isCorrect ? 'bg-emerald-500/20' : 'bg-rose-500/20'
        ].join(' ')}>
          {isCorrect ? (
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={[
            'font-semibold text-sm',
            isCorrect ? 'text-emerald-300' : 'text-rose-300'
          ].join(' ')}>
            {isCorrect ? 'Excellent!' : 'Not quite right'}
          </h4>
          
          <p className="mt-1 text-xs text-slate-300">
            {isCorrect 
              ? 'You got it right! Keep up the great work.'
              : `The correct answer is "${correctChoice ? getTransliterationOnly(correctChoice.label) : '...'}"`
            }
          </p>
          
          {/* Progress dots for visual appeal */}
          <div className="mt-3 flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className={[
                  'w-2 h-2 rounded-full transition-all duration-500',
                  isCorrect 
                    ? 'bg-emerald-400/60' 
                    : 'bg-rose-400/60',
                  i === 1 ? 'scale-125' : 'scale-100'
                ].join(' ')}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
