import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import {
  isLessonCompleted,
  loadProgress,
  recordLessonComplete,
  saveProgress,
  type LearnerProgress,
} from '../types/progress'

const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : 'https://read-arabic-with-ease-backend.onrender.com'

interface ProgressContextValue {
  progress: LearnerProgress
  completeLesson: (levelId: string, lessonId: string, score?: number) => void
  isCompleted: (levelId: string, lessonId: string) => boolean
  refresh: () => void
  isLoading: boolean
  // Exercise tracking
  recordAttempt: (data: {
    levelId: string
    lessonId: string
    exerciseId: string
    selectedChoiceId: string
    isCorrect: boolean
    timeSpent?: number
    attempts?: number
  }) => Promise<void>
  // Study session tracking
  startStudySession: () => Promise<string | null>
  endStudySession: (sessionId: string) => Promise<void>
  updateStudySession: (sessionId: string, updates: { exercisesCompleted?: number; lessonsCompleted?: string[] }) => Promise<void>
  // Achievements
  checkAchievements: (actions?: { perfectLesson?: boolean; correctStreak?: number; speedDemon?: boolean }) => Promise<any[]>
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth()
  const [progress, setProgress] = useState<LearnerProgress>(loadProgress)
  const [isLoading, setIsLoading] = useState(false)

  // Load progress from backend when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadBackendProgress()
    }
  }, [isAuthenticated, token])

  const loadBackendProgress = async () => {
    if (!token) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Convert backend progress format to local format
        const backendProgress: LearnerProgress = {
          lessonProgress: data.progress.map((p: any) => ({
            levelId: p.levelId,
            lessonId: p.lessonId,
            completedAt: new Date(p.completedAt).getTime(),
            score: 100
          })),
          weakAreas: [],
          streakDays: data.stats?.streakDays || 0,
          lastActivityDate: data.stats?.lastActivityDate ? new Date(data.stats.lastActivityDate).toISOString().slice(0, 10) : '',
          totalLessonsCompleted: data.stats?.totalLessonsCompleted || 0
        }

        // Merge with local progress (backend takes priority)
        const mergedProgress = mergeProgress(loadProgress(), backendProgress)
        setProgress(mergedProgress)
        saveProgress(mergedProgress)

        // Sync any local-only progress to backend
        await syncLocalProgressToBackend(mergedProgress, backendProgress)
      }
    } catch (err) {
      console.error('Failed to load progress from backend:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Sync local progress items that don't exist in backend
  const syncLocalProgressToBackend = async (local: LearnerProgress, backend: LearnerProgress) => {
    if (!token || !isAuthenticated) return

    const backendLessonKeys = new Set(
      backend.lessonProgress.map(p => `${p.levelId}-${p.lessonId}`)
    )

    const lessonsToSync = local.lessonProgress.filter(
      p => !backendLessonKeys.has(`${p.levelId}-${p.lessonId}`)
    )

    for (const lesson of lessonsToSync) {
      try {
        await fetch(`${API_URL}/api/progress/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ levelId: lesson.levelId, lessonId: lesson.lessonId })
        })
      } catch (err) {
        console.error('Failed to sync lesson to backend:', err)
      }
    }
  }

  const mergeProgress = (local: LearnerProgress, backend: LearnerProgress): LearnerProgress => {
    const combined = [...local.lessonProgress]
    
    // Add backend lessons that aren't in local
    backend.lessonProgress.forEach(backendLesson => {
      const exists = combined.some(
        localLesson => 
          localLesson.levelId === backendLesson.levelId && 
          localLesson.lessonId === backendLesson.lessonId
      )
      if (!exists) {
        combined.push(backendLesson)
      }
    })

    return {
      lessonProgress: combined,
      weakAreas: local.weakAreas,
      streakDays: Math.max(local.streakDays, backend.streakDays),
      lastActivityDate: backend.lastActivityDate || local.lastActivityDate,
      totalLessonsCompleted: combined.length
    }
  }

  const syncWithBackend = async (levelId: string, lessonId: string) => {
    if (!token || !isAuthenticated) return

    try {
      const response = await fetch(`${API_URL}/api/progress/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ levelId, lessonId })
      })

      if (!response.ok) {
        console.error('Failed to sync progress with backend')
      }
    } catch (err) {
      console.error('Error syncing progress:', err)
    }
  }

  const refresh = useCallback(() => {
    setProgress(loadProgress())
    if (isAuthenticated) {
      loadBackendProgress()
    }
  }, [isAuthenticated])

  const completeLesson = useCallback(
    async (levelId: string, lessonId: string, score?: number) => {
      // Update local state first
      setProgress((prev) => {
        const next = recordLessonComplete(prev, levelId, lessonId, score)
        saveProgress(next)
        return next
      })

      // Sync with backend if authenticated
      if (isAuthenticated && token) {
        await syncWithBackend(levelId, lessonId)
      }
    },
    [isAuthenticated, token]
  )

  const isCompleted = useCallback(
    (levelId: string, lessonId: string) =>
      isLessonCompleted(progress, levelId, lessonId),
    [progress]
  )

  // Record exercise attempt
  const recordAttempt = useCallback(async (data: {
    levelId: string
    lessonId: string
    exerciseId: string
    selectedChoiceId: string
    isCorrect: boolean
    timeSpent?: number
    attempts?: number
  }) => {
    if (!token || !isAuthenticated) return

    try {
      await fetch(`${API_URL}/api/exercises/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
    } catch (err) {
      console.error('Failed to record attempt:', err)
    }
  }, [token, isAuthenticated])

  // Start study session
  const startStudySession = useCallback(async () => {
    if (!token || !isAuthenticated) return null

    try {
      const response = await fetch(`${API_URL}/api/sessions/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        return data.session.id
      }
    } catch (err) {
      console.error('Failed to start session:', err)
    }
    return null
  }, [token, isAuthenticated])

  // End study session
  const endStudySession = useCallback(async (sessionId: string) => {
    if (!token || !isAuthenticated) return

    try {
      await fetch(`${API_URL}/api/sessions/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      })
    } catch (err) {
      console.error('Failed to end session:', err)
    }
  }, [token, isAuthenticated])

  // Update study session
  const updateStudySession = useCallback(async (sessionId: string, updates: { exercisesCompleted?: number; lessonsCompleted?: string[] }) => {
    if (!token || !isAuthenticated) return

    try {
      await fetch(`${API_URL}/api/sessions/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId, ...updates })
      })
    } catch (err) {
      console.error('Failed to update session:', err)
    }
  }, [token, isAuthenticated])

  // Check achievements
  const checkAchievements = useCallback(async (actions: { perfectLesson?: boolean; correctStreak?: number; speedDemon?: boolean } = {}) => {
    if (!token || !isAuthenticated) return []

    try {
      const response = await fetch(`${API_URL}/api/achievements/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stats: {
            streakDays: progress.streakDays,
            totalLessonsCompleted: progress.totalLessonsCompleted
          },
          actions
        })
      })

      if (response.ok) {
        const data = await response.json()
        return data.newlyUnlocked || []
      }
    } catch (err) {
      console.error('Failed to check achievements:', err)
    }
    return []
  }, [token, isAuthenticated, progress])

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      completeLesson,
      isCompleted,
      refresh,
      isLoading,
      recordAttempt,
      startStudySession,
      endStudySession,
      updateStudySession,
      checkAchievements
    }),
    [progress, completeLesson, isCompleted, refresh, isLoading, recordAttempt, startStudySession, endStudySession, updateStudySession, checkAchievements]
  )

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
