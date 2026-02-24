import './App.css'
import { HarakatText } from './components/HarakatText'
import { AuthModal } from './components/AuthModal'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import { useProgress } from './context/ProgressContext'
import { useTheme } from './context/ThemeContext'
import { LetterCardList } from './components/LetterCard'
import { PositionComparisonList } from './components/PositionComparison'
import { HarakatDemoList } from './components/HarakatDemo'
import { ProgressDashboard } from './components/ProgressDashboard'
import type { Lesson, Level } from './data/curriculum'
import { curriculum } from './data/curriculum'

type ViewMode = 'lesson' | 'progress'

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
  const [viewMode, setViewMode] = useState<ViewMode>('lesson')

  return (
    <div className="min-h-screen bg-th-bg text-th-text overflow-x-hidden">
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
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Main Content Area */}
          {viewMode === 'lesson' ? (
            <LessonPanel
              active={active}
              setSelection={setSelection}
              onOpenMobileNav={() => setMobileNavOpen(true)}
            />
          ) : (
            <div className="rounded-xl sm:rounded-2xl border border-th-border bg-th-elevated p-3 sm:p-4 lg:p-5">
              <ProgressDashboard />
            </div>
          )}
        </main>

        {/* Mobile Navigation Drawer */}
        <MobileNavDrawer
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          active={active}
          setSelection={setSelection}
          setViewMode={setViewMode}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />

        <footer className="mt-4 border-t border-th-border pt-3 text-[0.65rem] text-th-muted font-arabic sm:mt-6 sm:pt-4 sm:text-xs lg:mt-8">
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
  const { isDark, toggleTheme } = useTheme()
  const completedCount = progress.lessonProgress.length
  const totalLessons = curriculum.reduce((s, l) => s + l.lessons.length, 0)

  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2 sm:gap-3 lg:gap-5 min-w-0">
        <img
          src="/logo.png"
          alt="Awwal Logo"
          className="h-10 w-10 sm:h-14 sm:w-14 lg:h-20 lg:w-20 flex-shrink-0 rounded-xl sm:rounded-2xl object-cover shadow-lg shadow-black/20 ring-1 ring-black/10 dark:ring-white/10 dark:shadow-black/40"
        />
        <div className="min-w-0">
          <p className="font-arabic text-sm sm:text-base lg:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            مركز أول للعربية
          </p>
          <p className="mt-0.5 sm:mt-1 max-w-2xl text-[0.7rem] sm:text-xs lg:text-sm text-th-text-2 hidden sm:block">
            From your first encounter with Arabic letters to confident, expert-level Qur&apos;anic reading.
          </p>
        </div>
      </div>

      {/* Top right: Auth + Theme toggle + Mobile menu + Progress stats */}
      <div className="flex items-start gap-2 sm:gap-3 flex-shrink-0">
        {/* Auth Button / User Info */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-th-text-2">{user?.name || user?.email}</span>
              <span className="text-[0.6rem] text-emerald-500 dark:text-emerald-400">{progress.streakDays > 0 && `${progress.streakDays}🔥`}</span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg bg-th-elevated hover:bg-rose-500/20 hover:text-rose-500 dark:hover:text-rose-300 px-3 py-2 text-xs font-medium text-th-text-2 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-xs font-medium transition"
          >
            Sign In
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-xl bg-th-elevated border border-th-border hover:border-emerald-500/50 px-2.5 py-2 text-th-muted hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          aria-label="Toggle theme"
        >
          {isDark ? (
            /* Sun icon */
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            /* Moon icon */
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          )}
        </button>

        {/* Mobile hamburger menu button */}
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden flex items-center gap-2 rounded-xl bg-th-elevated border border-th-border hover:bg-th-surface px-3 py-2 text-th-text-2 transition"
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
          <div className="rounded-xl lg:rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 to-emerald-400/5 px-3 py-2 lg:px-4 lg:py-3 text-[0.65rem] lg:text-xs text-emerald-800 dark:text-emerald-100 shadow-lg shadow-emerald-500/10">
            <p className="text-[0.6rem] lg:text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-emerald-700/80 dark:text-emerald-200/80">
              Progress
            </p>
            <p className="mt-0.5 lg:mt-1 text-[0.7rem] lg:text-[0.8rem] leading-relaxed text-emerald-900/90 dark:text-emerald-50/90">
              <span className="font-semibold text-emerald-700 dark:text-emerald-200">{completedCount}</span> / {totalLessons} lessons
              {progress.streakDays > 0 && (
                <> · <span className="font-semibold text-amber-600 dark:text-amber-200">{progress.streakDays}🔥</span></>
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
  viewMode?: ViewMode
  setViewMode?: (mode: ViewMode) => void
}

function DesktopSidebar({ active, setSelection, viewMode = 'lesson', setViewMode }: DesktopSidebarProps) {
  const { isCompleted } = useProgress()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className="hidden lg:block space-y-4">
      {/* Progress Dashboard Button */}
      <button
        onClick={() => setViewMode?.(viewMode === 'lesson' ? 'progress' : 'lesson')}
        className={[
          'w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
          viewMode === 'progress'
            ? 'bg-gradient-to-r from-emerald-500/20 to-sky-500/10 border border-emerald-500/30'
            : 'rounded-2xl border border-th-border bg-th-surface hover:border-emerald-500/30'
        ].join(' ')}
      >
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg">
          {viewMode === 'progress' ? '📖' : '📊'}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-th-text">
            {viewMode === 'progress' ? 'Back to Lessons' : 'Progress Dashboard'}
          </div>
          <div className="text-[0.65rem] text-th-text-2">
            {viewMode === 'progress' ? 'Continue learning' : 'View your stats'}
          </div>
        </div>
      </button>

      {/* Stages Section - Only show in lesson mode */}
      {viewMode === 'lesson' && (
      <div className="rounded-2xl border border-th-border bg-th-surface backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-th-text">Learning Stages</h2>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-th-elevated text-th-muted"
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
                    ? 'ring-2 ring-emerald-400/70 border border-white/30 dark:border-white/30 border-black/10'
                    : 'border border-transparent hover:border-black/10 dark:hover:border-white/10',
                ].join(' ')}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-slate-950/80 text-[0.7rem] font-bold text-emerald-700 dark:text-emerald-300">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-th-text truncate">{level.title}</span>
                    <span className="text-[0.6rem] text-th-muted">{completedInLevel}/{level.lessons.length}</span>
                  </div>
                  <p className="text-[0.65rem] text-th-muted truncate">{level.focus}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
      )}

      {/* Lessons Section - Only show in lesson mode */}
      {viewMode === 'lesson' && (
      <div className="rounded-2xl border border-th-border bg-th-surface backdrop-blur-sm p-4">
        <h2 className="text-sm font-semibold text-th-text mb-3">{active.level.title}</h2>
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
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-50 ring-1 ring-emerald-400/50'
                    : 'text-th-text-2 hover:bg-th-elevated',
                ].join(' ')}
              >
                <div className={[
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[0.6rem]',
                  completed ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-th-elevated text-th-muted'
                ].join(' ')}>
                  {completed ? '✓' : index + 1}
                </div>
                <span className="truncate">{lesson.title}</span>
              </button>
            )
          })}
        </div>
      </div>
      )}
    </aside>
  )
}

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  active: ActiveSelection
  setSelection: (levelId: string, lessonId?: string) => void
  setViewMode?: (mode: ViewMode) => void
}

function MobileNavDrawer({ isOpen, onClose, active, setSelection, setViewMode }: MobileNavDrawerProps) {
  const { isCompleted } = useProgress()
  const [activeTab, setActiveTab] = useState<'stages' | 'lessons' | 'progress'>('stages')

  if (!isOpen) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-th-elevated border-r border-th-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-th-border">
          <div className="flex items-center justify-between">
            <h2 className="font-arabic text-lg font-bold text-emerald-600 dark:text-emerald-400">مركز أول</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-th-surface text-th-muted"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 p-1 bg-th-surface rounded-xl">
            <button
              onClick={() => setActiveTab('stages')}
              className={[
                'flex-1 py-2 text-xs font-medium rounded-lg transition',
                activeTab === 'stages'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  : 'text-th-muted hover:text-th-text'
              ].join(' ')}
            >
              Stages ({curriculum.length})
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={[
                'flex-1 py-2 text-xs font-medium rounded-lg transition',
                activeTab === 'lessons'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  : 'text-th-muted hover:text-th-text'
              ].join(' ')}
            >
              Lessons ({active.level.lessons.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('progress')
                setViewMode?.('progress')
                onClose()
              }}
              className={[
                'flex-1 py-2 text-xs font-medium rounded-lg transition',
                activeTab === 'progress'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                  : 'text-th-muted hover:text-th-text'
              ].join(' ')}
            >
              Progress
            </button>
          </div>
        </div>

        {/* Content - Progress Tab */}
        {activeTab === 'progress' && (
          <div className="flex-1 overflow-y-auto p-3">
            <button
              onClick={() => {
                setViewMode?.('lesson')
                onClose()
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-sky-500/10 border border-emerald-500/30"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white">
                📖
              </div>
              <div>
                <div className="text-sm font-semibold text-th-text">Back to Lessons</div>
                <div className="text-[0.65rem] text-th-text-2">Continue learning</div>
              </div>
            </button>
          </div>
        )}

        {/* Content - Stages and Lessons Tabs */}
        {activeTab !== 'progress' && (
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
                        ? 'ring-2 ring-emerald-400/70 border border-black/10 dark:border-white/30'
                        : 'border border-transparent',
                    ].join(' ')}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-slate-950/80 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-th-text">{level.title}</span>
                      </div>
                      <p className="text-xs text-th-muted mt-0.5">{level.stageLabel}</p>
                      <p className="text-[0.65rem] text-th-muted mt-1">
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
                <p className="text-xs text-th-muted">{active.level.title}</p>
                <p className="text-[0.65rem] text-th-muted">{active.level.focus}</p>
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
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-50 ring-1 ring-emerald-400/50'
                        : 'text-th-text-2 hover:bg-th-surface',
                    ].join(' ')}
                  >
                    <div className={[
                      'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs',
                      completed ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-th-surface text-th-muted'
                    ].join(' ')}>
                      {completed ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{lesson.title}</p>
                      <p className="text-[0.65rem] text-th-muted truncate">{lesson.description.slice(0, 50)}...</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        )}
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
      className="flex flex-col gap-3 rounded-2xl sm:rounded-3xl border border-th-border bg-th-surface backdrop-blur-sm p-3 sm:p-4 lg:p-5"
    >
      {/* Mobile Header with Stage/Lesson Info */}
      <div className="lg:hidden">
        <button
          onClick={onOpenMobileNav}
          className="w-full flex items-center justify-between gap-2 rounded-xl bg-th-elevated px-3 py-2.5 text-left hover:bg-th-input transition"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {curriculum.findIndex(l => l.id === active.level.id) + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs text-th-muted truncate">{active.level.title}</p>
              <p className="text-sm font-medium text-th-text truncate">{active.lesson.title}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-th-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between gap-2 border-b border-th-border pb-3">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300/90">Lesson Focus</p>
          <h2 className="text-lg font-semibold text-th-text">{active.lesson.title}</h2>
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
              const currentLessonIndex = active.level.lessons.findIndex(l => l.id === active.lesson.id)
              if (currentLessonIndex < active.level.lessons.length - 1) {
                const nextLesson = active.level.lessons[currentLessonIndex + 1]
                setSelection(active.level.id, nextLesson.id)
              } else {
                const currentLevelIndex = curriculum.findIndex(l => l.id === active.level.id)
                if (currentLevelIndex < curriculum.length - 1) {
                  const nextLevel = curriculum[currentLevelIndex + 1]
                  setSelection(nextLevel.id, nextLevel.lessons[0]?.id)
                }
              }
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
    <div className="rounded-xl sm:rounded-2xl border border-th-border bg-th-elevated p-3 sm:p-4 lg:p-5 text-xs sm:text-sm text-th-text">
      <p className="text-[0.7rem] sm:text-xs text-th-muted mb-2">{lesson.description}</p>

      {lesson.objectives.length > 0 && (
        <div className="mt-3 sm:mt-4 grid gap-1.5 sm:gap-2 text-[0.7rem] sm:text-xs text-th-text-2 sm:grid-cols-2">
          {lesson.objectives.map((obj) => (
            <div key={obj} className="flex items-start gap-1.5">
              <span className="mt-1 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
              <span>{obj}</span>
            </div>
          ))}
        </div>
      )}

      {lesson.letterIds && lesson.letterIds.length > 0 && lesson.category === 'huruf' && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-300/90 mb-2">Letters in this lesson</p>
          <LetterCardList letterIds={lesson.letterIds} showArticulation className="mt-2" />
        </div>
      )}

      {lesson.letterIds && lesson.letterIds.length > 0 && lesson.category === 'positions' && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-300/90 mb-2">Position forms</p>
          <PositionComparisonList letterIds={lesson.letterIds} className="mt-2" />
        </div>
      )}

      {lesson.harakaIds && lesson.harakaIds.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300/90 mb-2">Vowel marks (Arakat)</p>
          <HarakatDemoList harakaIds={lesson.harakaIds} className="mt-2" />
        </div>
      )}

      {lesson.practiceWords && lesson.practiceWords.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <p className="text-[0.65rem] sm:text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300/90 mb-2">Practice words</p>
          <div dir="rtl" className="mt-2 flex flex-wrap gap-2 font-arabic text-xl sm:text-2xl text-violet-800 dark:text-violet-100">
            {lesson.practiceWords.map((w, i) => (
              <span key={i} className="cursor-pointer rounded-xl bg-th-elevated border border-th-border px-3 py-1.5 transition-colors hover:bg-th-input hover:text-th-text">{w}</span>
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
    huruf: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-emerald-400/60',
    positions: 'bg-sky-500/15 text-sky-700 dark:text-sky-200 ring-sky-400/60',
    harakat: 'bg-amber-500/15 text-amber-700 dark:text-amber-200 ring-amber-400/60',
    combination: 'bg-violet-500/15 text-violet-700 dark:text-violet-200 ring-violet-400/60',
    reading: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200 ring-fuchsia-400/60',
    'quran-reading': 'bg-rose-500/15 text-rose-700 dark:text-rose-200 ring-rose-400/60',
    tajweed: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-200 ring-yellow-400/60',
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
  const { isCompleted, recordAttempt, startStudySession, endStudySession, updateStudySession, checkAchievements } = useProgress()
  const [index, setIndex] = useState(0)
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [shuffledChoices, setShuffledChoices] = useState<typeof exercise.choices>([])
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(Date.now())
  const [correctStreak, setCorrectStreak] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const exerciseAudioRef = useRef<HTMLAudioElement | null>(null)

  const exercise = lesson.exercises[index]
  const isLast = index === lesson.exercises.length - 1
  const alreadyCompleted = isCompleted(levelId, lesson.id)

  // Start study session on first exercise
  useEffect(() => {
    if (index === 0 && exercise) {
      startStudySession().then(id => {
        if (id) setSessionId(id)
      })
    }
  }, [])

  useEffect(() => {
    if (exercise) {
      const array = [...exercise.choices]
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
          ;[array[i], array[j]] = [array[j], array[i]]
      }
      setShuffledChoices(array)
      setSelectedChoiceId(null)
      setAnswered(false)
      setExerciseStartTime(Date.now())
    }
  }, [exercise])

  if (!exercise) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-th-border bg-th-elevated p-6 text-xs text-th-muted">
        No exercises added yet for this lesson.
      </div>
    )
  }

  const correctChoice = shuffledChoices.find((c) => c.isCorrect)

  const handleCheck = async () => {
    if (!selectedChoiceId) return
    setAnswered(true)

    const isCorrectChoice = correctChoice?.id === selectedChoiceId
    const timeSpent = Math.round((Date.now() - exerciseStartTime) / 1000)

    // Update correct streak
    if (isCorrectChoice) {
      setCorrectStreak(prev => prev + 1)
    } else {
      setCorrectStreak(0)
    }

    // Record attempt
    await recordAttempt({
      levelId,
      lessonId: lesson.id,
      exerciseId: exercise.id,
      selectedChoiceId,
      isCorrect: isCorrectChoice,
      timeSpent,
      attempts: 1
    })

    // Update session progress
    if (sessionId) {
      updateStudySession(sessionId, { exercisesCompleted: index + 1 })
    }
  }

  const handleNext = () => {
    if (!answered) return
    if (!isLast) {
      setIndex((prev) => prev + 1)
    } else {
      // End study session when lesson is complete
      if (sessionId) {
        endStudySession(sessionId)
      }
    }
  }

  const handlePrevious = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1)
    }
  }

  const handleRestart = () => {
    setIndex(0)
    setCorrectStreak(0)
    // Start new session
    startStudySession().then(id => {
      if (id) setSessionId(id)
    })
  }

  const isCorrect = answered && selectedChoiceId && shuffledChoices.find((c) => c.id === selectedChoiceId)?.isCorrect

  return (
    <div className="flex flex-1 flex-col gap-3 rounded-xl sm:rounded-2xl border border-th-border bg-th-elevated p-3 sm:p-4 lg:p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[0.65rem] sm:text-xs text-th-text-2">
          <span className="inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-th-input text-[0.65rem] sm:text-xs font-semibold text-th-text ring-1 ring-th-border">
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
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-400/70'
                : 'bg-rose-500/15 text-rose-700 dark:text-rose-200 ring-1 ring-rose-400/70',
            ].join(' ')}
          >
            {isCorrect ? 'Correct' : 'Keep trying'}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-3 rounded-xl sm:rounded-2xl bg-th-surface border border-th-border p-3 sm:p-4">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-th-text">{exercise.prompt}</p>
          {exercise.promptNote && (
            <p className="mt-1 text-[0.7rem] sm:text-xs text-th-text-2">{exercise.promptNote}</p>
          )}
        </div>
        {(exercise.promptArabic || exercise.audioUrl) && (
          <div className="mt-2 flex flex-col items-end gap-2">
            {exercise.promptArabic && (
              <div className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 px-4 sm:px-6 py-3 sm:py-4 text-right shadow-inner shadow-black/10 dark:shadow-slate-900/80">
                <HarakatText
                  text={exercise.promptArabic}
                  size="2xl"
                  className="text-emerald-800 dark:text-emerald-50 drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                />
              </div>
            )}
            {exercise.audioUrl && (
              <div className="inline-flex flex-col items-center gap-1">
                <button
                  type="button"
                  disabled={audioLoading}
                  onClick={() => {
                    setAudioLoading(true)
                    const audio = exerciseAudioRef.current ?? new Audio(exercise.audioUrl)
                    exerciseAudioRef.current = audio

                    const handleLoadStart = () => setAudioLoading(true)
                    const handleCanPlay = () => setAudioLoading(false)
                    const handlePlaying = () => setAudioLoading(false)
                    const handleEnded = () => setAudioLoading(false)
                    const handleError = () => setAudioLoading(false)

                    audio.addEventListener('loadstart', handleLoadStart)
                    audio.addEventListener('canplay', handleCanPlay)
                    audio.addEventListener('playing', handlePlaying)
                    audio.addEventListener('ended', handleEnded)
                    audio.addEventListener('error', handleError)

                    audio.play().catch(() => {
                      setAudioLoading(false)
                    })

                    // Fallback timeout
                    setTimeout(() => setAudioLoading(false), 3000)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-th-input border border-th-border px-3 py-1.5 text-[0.65rem] sm:text-xs font-medium text-emerald-700 dark:text-emerald-100 ring-1 ring-emerald-500/50 hover:bg-emerald-500/10 disabled:opacity-70 disabled:cursor-wait"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/80 text-[0.55rem] text-emerald-950">
                    {audioLoading ? (
                      <span className="animate-spin text-[0.5rem]">⟳</span>
                    ) : (
                      '▶'
                    )}
                  </span>
                  {audioLoading ? 'Loading...' : 'Play'}
                </button>
                {audioLoading && (
                  <div className="w-16 h-0.5 bg-emerald-950/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 animate-pulse rounded-full w-3/4" />
                  </div>
                )}
              </div>
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
                if (!answered) {
                  setSelectedChoiceId(choice.id)
                }
              }}
              disabled={answered}
              className={[
                'group flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs sm:text-sm transition',
                'bg-th-elevated hover:bg-th-input',
                'border-th-border hover:border-emerald-400/50',
                !answered && 'hover:bg-th-input hover:border-emerald-400/50',
                isSelected && !answered && 'border-emerald-400/80 bg-emerald-500/10',
                showAsCorrect &&
                'border-emerald-400 bg-emerald-500/15 shadow-[0_0_0_1px_rgba(16,185,129,0.4)]',
                showAsIncorrect && 'border-rose-400 bg-rose-500/10',
                answered && 'cursor-default opacity-90',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="flex h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 items-center justify-center rounded-lg bg-th-input text-[0.65rem] sm:text-xs text-th-text-2">
                {getTransliterationOnly(choice.label).charAt(0).toUpperCase()}
              </span>
              <span className="flex-1 text-th-text group-hover:text-th-text">{getTransliterationOnly(choice.label)}</span>
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
        <div className="flex items-center gap-2 text-[0.65rem] sm:text-xs text-th-muted">
          {answered && isCorrect && (
            <span className="text-emerald-600 dark:text-emerald-400">Great job! Keep it up!</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="inline-flex items-center gap-1 rounded-full bg-th-input px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-th-text ring-1 ring-th-border hover:bg-th-elevated"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          )}
          {!answered && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={!selectedChoiceId}
              className="inline-flex items-center rounded-full bg-emerald-500 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-th-elevated disabled:text-th-muted disabled:shadow-none"
            >
              Check
            </button>
          )}
          {answered && !isLast && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center rounded-full bg-th-input px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-th-text ring-1 ring-th-border hover:bg-th-elevated"
            >
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          {answered && isLast && (
            <>
              {!alreadyCompleted && (
                <button
                  type="button"
                  onClick={async () => {
                    // Check if lesson was perfect (all correct)
                    const perfectLesson = true // TODO: track per-exercise correctness
                    await checkAchievements({ perfectLesson, correctStreak })
                    onComplete()
                  }}
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
                className="inline-flex items-center rounded-full bg-th-input px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-th-text ring-1 ring-emerald-500/60 hover:bg-th-elevated"
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
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g
  let cleaned = label.replace(arabicRegex, '').trim()
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
            <svg className="w-6 h-6 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-rose-500 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={[
            'font-semibold text-sm',
            isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
          ].join(' ')}>
            {isCorrect ? 'Excellent!' : 'Not quite right'}
          </h4>

          <p className="mt-1 text-xs text-th-text-2">
            {isCorrect
              ? 'You got it right! Keep up the great work.'
              : `The correct answer is "${correctChoice ? getTransliterationOnly(correctChoice.label) : '...'}"`
            }
          </p>

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
