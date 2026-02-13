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

const API_URL = 'http://localhost:3001'

interface ProgressContextValue {
  progress: LearnerProgress
  completeLesson: (levelId: string, lessonId: string, score?: number) => void
  isCompleted: (levelId: string, lessonId: string) => boolean
  refresh: () => void
  isLoading: boolean
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
      }
    } catch (err) {
      console.error('Failed to load progress from backend:', err)
    } finally {
      setIsLoading(false)
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
      if (isAuthenticated) {
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

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, completeLesson, isCompleted, refresh, isLoading }),
    [progress, completeLesson, isCompleted, refresh, isLoading]
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
