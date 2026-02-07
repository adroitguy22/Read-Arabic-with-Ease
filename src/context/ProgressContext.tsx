import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  isLessonCompleted,
  loadProgress,
  recordLessonComplete,
  saveProgress,
  type LearnerProgress,
} from '../types/progress'

interface ProgressContextValue {
  progress: LearnerProgress
  completeLesson: (levelId: string, lessonId: string, score?: number) => void
  isCompleted: (levelId: string, lessonId: string) => boolean
  refresh: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<LearnerProgress>(loadProgress)

  const refresh = useCallback(() => {
    setProgress(loadProgress())
  }, [])

  const completeLesson = useCallback(
    (levelId: string, lessonId: string, score?: number) => {
      setProgress((prev) => {
        const next = recordLessonComplete(prev, levelId, lessonId, score)
        saveProgress(next)
        return next
      })
    },
    []
  )

  const isCompleted = useCallback(
    (levelId: string, lessonId: string) =>
      isLessonCompleted(progress, levelId, lessonId),
    [progress]
  )

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, completeLesson, isCompleted, refresh }),
    [progress, completeLesson, isCompleted, refresh]
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
