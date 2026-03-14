import { useEffect, useState } from 'react'
import { API_URL } from '../context/ProgressContext'

interface AnalyticsOverview {
  totalLessonsCompleted: number
  streakDays: number
  totalStudyTime: number
  thisWeekStudyTime: number
  averageAccuracy: number
  averageTimePerExercise: number
  lastActivityDate: string | null
}

interface WeakArea {
  id: string
  topicId: string
  topicLabel: string
  missCount: number
  correctCount: number
  accuracy: number
  improvementRate: number
}

interface StudySession {
  id: string
  startTime: string
  endTime: string | null
  duration: number
  exercisesCompleted: number
  lessonsCompleted: string[]
}

interface AnalyticsData {
  overview: AnalyticsOverview
  weakAreas: WeakArea[]
  recentSessions: StudySession[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked?: boolean
}

export function ProgressDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [calendar, setCalendar] = useState<Record<string, { duration: number; lessons: number }>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'weakness'>('overview')

  useEffect(() => {
    fetchAnalytics()
    fetchAchievements()
    fetchCalendar()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/api/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAchievements = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/api/achievements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setAchievements(data.achievements)
        setAllAchievements(data.allAchievements)
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error)
    }
  }

  const fetchCalendar = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/api/analytics/calendar?days=90`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCalendar(data.calendar)
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error)
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    const hours = Math.floor(seconds / 3600)
    const mins = Math.round((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getStreakColor = (days: number) => {
    if (days >= 30) return 'from-purple-500 to-pink-500'
    if (days >= 7) return 'from-orange-500 to-red-500'
    return 'from-yellow-500 to-orange-500'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-emerald-500'
    if (accuracy >= 60) return 'text-yellow-500'
    return 'text-rose-500'
  }

  // Generate last 7 days for calendar
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-th-muted">Loading progress...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-th-text">Your Progress</h2>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Lessons Completed */}
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/10 border border-emerald-500/30 p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {analytics?.overview.totalLessonsCompleted || 0}
          </div>
          <div className="text-[0.65rem] sm:text-xs text-th-text-2 mt-1">Lessons Done</div>
        </div>

        {/* Streak */}
        <div className={`rounded-xl bg-gradient-to-br ${getStreakColor(analytics?.overview.streakDays || 0)} border border-white/20 p-3 sm:p-4`}>
          <div className="flex items-center gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              {analytics?.overview.streakDays || 0}
            </span>
            <span className="text-lg">🔥</span>
          </div>
          <div className="text-[0.65rem] sm:text-xs text-white/80 mt-1">Day Streak</div>
        </div>

        {/* Study Time */}
        <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 p-3 sm:p-4">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatTime(analytics?.overview.totalStudyTime || 0)}
          </div>
          <div className="text-[0.65rem] sm:text-xs text-th-text-2 mt-1">Total Study Time</div>
        </div>

        {/* Accuracy */}
        <div className="rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 p-3 sm:p-4">
          <div className={`text-2xl sm:text-3xl font-bold ${getAccuracyColor(analytics?.overview.averageAccuracy || 0)}`}>
            {analytics?.overview.averageAccuracy || 0}%
          </div>
          <div className="text-[0.65rem] sm:text-xs text-th-text-2 mt-1">Avg. Accuracy</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-th-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={[
            'px-4 py-2 text-sm font-medium transition border-b-2 -mb-px',
            activeTab === 'overview'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-th-text-2 hover:text-th-text'
          ].join(' ')}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={[
            'px-4 py-2 text-sm font-medium transition border-b-2 -mb-px',
            activeTab === 'achievements'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-th-text-2 hover:text-th-text'
          ].join(' ')}
        >
          Achievements ({achievements.length}/{allAchievements.length})
        </button>
        <button
          onClick={() => setActiveTab('weakness')}
          className={[
            'px-4 py-2 text-sm font-medium transition border-b-2 -mb-px',
            activeTab === 'weakness'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-th-text-2 hover:text-th-text'
          ].join(' ')}
        >
          Focus Areas
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* This Week's Activity */}
          <div className="rounded-xl bg-th-surface border border-th-border p-4">
            <h3 className="text-sm font-semibold text-th-text mb-3">This Week's Activity</h3>
            <div className="flex gap-2">
              {last7Days.map((day) => {
                const dayData = calendar[day]
                const hasActivity = dayData && dayData.duration > 0
                const intensity = hasActivity ? (dayData.duration > 300 ? 'high' : dayData.duration > 120 ? 'medium' : 'low') : 'none'

                const dayName = new Date(day).toLocaleDateString('en-US', { weekday: 'short' })
                const isToday = day === new Date().toISOString().split('T')[0]

                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <span className={['text-[0.65rem] text-th-text-2', isToday && 'font-semibold text-emerald-500'].join(' ')}>
                      {dayName}
                    </span>
                    <div
                      className={[
                        'w-full aspect-square rounded-lg transition',
                        intensity === 'high' && 'bg-emerald-500 shadow-lg shadow-emerald-500/30',
                        intensity === 'medium' && 'bg-emerald-400/70',
                        intensity === 'low' && 'bg-emerald-300/50',
                        intensity === 'none' && 'bg-th-input'
                      ].join(' ')}
                    />
                    {hasActivity && (
                      <span className="text-[0.6rem] text-th-text-2">{formatTime(dayData.duration)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Sessions */}
          {analytics?.recentSessions && analytics.recentSessions.length > 0 && (
            <div className="rounded-xl bg-th-surface border border-th-border p-4">
              <h3 className="text-sm font-semibold text-th-text mb-3">Recent Study Sessions</h3>
              <div className="space-y-2">
                {analytics.recentSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg bg-th-elevated border border-th-border px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600">
                        📖
                      </div>
                      <div>
                        <div className="text-xs font-medium text-th-text">
                          {session.exercisesCompleted} exercises completed
                        </div>
                        <div className="text-[0.65rem] text-th-text-2">
                          {formatDate(session.startTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-th-text-2">
                      {formatTime(session.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allAchievements.map((achievement) => {
              const isUnlocked = achievement.unlocked
              return (
                <div
                  key={achievement.id}
                  className={[
                    'rounded-xl border p-4 text-center transition',
                    isUnlocked
                      ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-500/30'
                      : 'bg-th-surface border-th-border opacity-50'
                  ].join(' ')}
                >
                  <div className={['text-3xl mb-2', isUnlocked ? '' : 'grayscale'].join(' ')}>
                    {achievement.icon}
                  </div>
                  <div className={['text-xs font-semibold mb-1', isUnlocked ? 'text-amber-600 dark:text-amber-400' : 'text-th-text-2'].join(' ')}>
                    {achievement.title}
                  </div>
                  <div className="text-[0.65rem] text-th-text-2">
                    {achievement.description}
                  </div>
                  {isUnlocked && (
                    <div className="mt-2 inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[0.6rem] font-medium text-emerald-600">
                      ✓ Unlocked
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {achievements.length === 0 && (
            <div className="rounded-xl bg-th-surface border border-th-border p-8 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <div className="text-sm font-medium text-th-text mb-1">No achievements yet</div>
              <div className="text-xs text-th-text-2">Complete lessons and maintain streaks to unlock achievements!</div>
            </div>
          )}
        </div>
      )}

      {/* Focus Areas Tab */}
      {activeTab === 'weakness' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {analytics?.weakAreas && analytics.weakAreas.length > 0 ? (
            <>
              <div className="rounded-xl bg-th-surface border border-th-border p-4">
                <h3 className="text-sm font-semibold text-th-text mb-3">Areas to Focus On</h3>
                <div className="space-y-3">
                  {analytics.weakAreas.map((area) => (
                    <div key={area.id} className="rounded-lg bg-th-elevated border border-th-border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-th-text">{area.topicLabel}</div>
                        <div className="text-[0.65rem] text-th-text-2">
                          {area.missCount} mistake{area.missCount > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-th-input overflow-hidden">
                          <div
                            className={['h-full rounded-full transition-all', area.accuracy >= 70 ? 'bg-emerald-500' : area.accuracy >= 40 ? 'bg-yellow-500' : 'bg-rose-500'].join(' ')}
                            style={{ width: `${area.accuracy}%` }}
                          />
                        </div>
                        <div className={['text-xs font-semibold', area.accuracy >= 70 ? 'text-emerald-500' : area.accuracy >= 40 ? 'text-yellow-500' : 'text-rose-500'].join(' ')}>
                          {area.accuracy}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
                      Practice makes perfect
                    </div>
                    <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                      Focus on these areas during your next practice session. Repeating exercises will help improve your accuracy!
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-th-surface border border-th-border p-8 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-sm font-medium text-th-text mb-1">Looking great!</div>
              <div className="text-xs text-th-text-2">Keep practicing to identify areas you can improve on.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
