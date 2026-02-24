import { useEffect, useState } from 'react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
}

interface AchievementNotificationProps {
  achievement: Achievement | null
  visible: boolean
  onClose: () => void
}

export function AchievementNotification({ achievement, visible, onClose }: AchievementNotificationProps) {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (visible && achievement) {
      setShouldShow(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShouldShow(false)
        setTimeout(onClose, 300) // Wait for animation
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [visible, achievement, onClose])

  if (!visible || !achievement || !shouldShow) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-500">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-[2px] shadow-2xl shadow-amber-500/30">
        <div className="rounded-xl bg-slate-900 p-4">
          <div className="flex items-start gap-4">
            {/* Achievement Icon */}
            <div className="flex-shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-3xl shadow-lg">
                {achievement.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Achievement Unlocked!
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>
              <h3 className="mt-1 text-lg font-bold text-white">
                {achievement.title}
              </h3>
              <p className="text-sm text-slate-300">
                {achievement.description}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShouldShow(false)
                setTimeout(onClose, 300)
              }}
              className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sparkle effects */}
          <div className="absolute top-2 right-2 text-yellow-300 text-lg animate-pulse">✨</div>
          <div className="absolute bottom-3 left-3 text-yellow-300 text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>✨</div>
        </div>

        {/* Shine effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

// Multiple achievements notification
interface AchievementPopupProps {
  achievements: Achievement[]
  onClose: () => void
}

export function AchievementPopup({ achievements, onClose }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (achievements.length > 0) {
      // Auto advance every 3 seconds
      const timer = setInterval(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          clearInterval(timer)
        }
      }, 3000)

      return () => clearInterval(timer)
    }
  }, [currentIndex, achievements.length])

  if (achievements.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="mx-4 max-w-sm w-full animate-in zoom-in-95 duration-300">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-[3px] shadow-2xl shadow-amber-500/30">
          <div className="rounded-2xl bg-slate-900 p-6">
            {/* Header */}
            <div className="text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1.5">
                <span className="text-amber-400">
                  {achievements.length > 1 ? `${currentIndex + 1} of ${achievements.length}` : 'New Achievement!'}
                </span>
              </div>

              {/* Achievement Icon */}
              <div className="mb-4 flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-5xl shadow-xl animate-bounce">
                  {achievements[currentIndex].icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {achievements[currentIndex].title}
              </h3>
              <p className="text-slate-300">
                {achievements[currentIndex].description}
              </p>

              {/* Progress dots */}
              {achievements.length > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  {achievements.map((_, i) => (
                    <div
                      key={i}
                      className={['h-2 rounded-full transition-all duration-300', i === currentIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-600'].join(' ')}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-semibold text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400 transition"
            >
              {achievements.length > 1 && currentIndex < achievements.length - 1 ? 'Showing All...' : 'Continue'}
            </button>

            {/* Sparkle effects */}
            <div className="absolute top-4 right-4 text-yellow-300 text-xl animate-pulse">✨</div>
            <div className="absolute bottom-8 left-6 text-yellow-300 text-lg animate-pulse" style={{ animationDelay: '0.3s' }}>✨</div>
            <div className="absolute top-12 left-8 text-yellow-300 text-sm animate-pulse" style={{ animationDelay: '0.6s' }}>✨</div>
          </div>

          {/* Shine effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  )
}

// Hook to manage achievement notifications
export function useAchievements() {
  const [showAchievements, setShowAchievements] = useState(false)
  const [newAchievements, setNewAchievements] = useState<any[]>([])

  const showUnlockedAchievements = (achievements: any[]) => {
    if (achievements.length > 0) {
      setNewAchievements(achievements)
      setShowAchievements(true)
    }
  }

  const closeAchievements = () => {
    setShowAchievements(false)
    setTimeout(() => setNewAchievements([]), 300)
  }

  return {
    showAchievements,
    newAchievements,
    showUnlockedAchievements,
    closeAchievements,
    AchievementPopupComponent: () => (
      <AchievementPopup
        achievements={newAchievements}
        onClose={closeAchievements}
      />
    )
  }
}
