/**
 * Progress tracking and spaced repetition types for Awwal Arabic Hub.
 */

export interface LessonProgress {
  lessonId: string
  levelId: string
  completedAt: number
  score?: number
  /** For spaced repetition: next recommended review timestamp */
  nextReviewAt?: number
}

export interface WeakArea {
  topicId: string
  topicLabel: string
  missCount: number
  lastAttempt: number
}

export interface LearnerProgress {
  lessonProgress: LessonProgress[]
  weakAreas: WeakArea[]
  streakDays: number
  lastActivityDate: string // YYYY-MM-DD
  totalLessonsCompleted: number
}

const STORAGE_KEY = 'awwal-arabic-hub-progress'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadProgress(): LearnerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultProgress()
    const parsed = JSON.parse(raw) as LearnerProgress
    return {
      lessonProgress: parsed.lessonProgress ?? [],
      weakAreas: parsed.weakAreas ?? [],
      streakDays: parsed.streakDays ?? 0,
      lastActivityDate: parsed.lastActivityDate ?? '',
      totalLessonsCompleted: parsed.totalLessonsCompleted ?? 0,
    }
  } catch {
    return getDefaultProgress()
  }
}

function getDefaultProgress(): LearnerProgress {
  return {
    lessonProgress: [],
    weakAreas: [],
    streakDays: 0,
    lastActivityDate: '',
    totalLessonsCompleted: 0,
  }
}

export function saveProgress(progress: LearnerProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore
  }
}

/** Update streak: if user was active yesterday, increment; if gap > 1 day, reset. */
export function updateStreak(progress: LearnerProgress): LearnerProgress {
  const today = todayStr()
  if (progress.lastActivityDate === today) return progress
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  let streakDays = progress.streakDays
  if (progress.lastActivityDate === yesterdayStr) {
    streakDays += 1
  } else if (progress.lastActivityDate !== today) {
    streakDays = 1
  }
  return {
    ...progress,
    streakDays,
    lastActivityDate: today,
    totalLessonsCompleted: progress.totalLessonsCompleted + 1,
  }
}

export function recordLessonComplete(
  progress: LearnerProgress,
  levelId: string,
  lessonId: string,
  score?: number
): LearnerProgress {
  const updated = updateStreak(progress)
  const nextReviewAt = Date.now() + 24 * 60 * 60 * 1000 // 1 day later for simple spaced repetition
  const lessonProgress = updated.lessonProgress.filter(
    (p) => !(p.levelId === levelId && p.lessonId === lessonId)
  )
  lessonProgress.push({
    lessonId,
    levelId,
    completedAt: Date.now(),
    score,
    nextReviewAt,
  })
  return {
    ...updated,
    lessonProgress,
    totalLessonsCompleted: lessonProgress.length,
  }
}

export function isLessonCompleted(
  progress: LearnerProgress,
  levelId: string,
  lessonId: string
): boolean {
  return progress.lessonProgress.some(
    (p) => p.levelId === levelId && p.lessonId === lessonId
  )
}
