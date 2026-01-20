'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekNavigatorProps {
  currentWeek: string
  availableWeeks: string[]
  onWeekChange: (week: string) => void
  isLoading?: boolean
}

function formatWeekLabel(weekOf: string): string {
  const date = new Date(weekOf + 'T00:00:00')
  return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function WeekNavigator({
  currentWeek,
  availableWeeks,
  onWeekChange,
  isLoading = false,
}: WeekNavigatorProps) {
  // Sort weeks in descending order (newest first)
  const sortedWeeks = [...availableWeeks].sort((a, b) => b.localeCompare(a))
  const currentIndex = sortedWeeks.indexOf(currentWeek)

  // Can go to newer week (lower index) or older week (higher index)
  const canGoNewer = currentIndex > 0
  const canGoOlder = currentIndex < sortedWeeks.length - 1

  const goNewer = () => {
    if (canGoNewer && !isLoading) {
      onWeekChange(sortedWeeks[currentIndex - 1])
    }
  }

  const goOlder = () => {
    if (canGoOlder && !isLoading) {
      onWeekChange(sortedWeeks[currentIndex + 1])
    }
  }

  // Don't show if only one week
  if (availableWeeks.length <= 1) {
    return (
      <p className="text-gray-600">{formatWeekLabel(currentWeek)}</p>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={goNewer}
        disabled={!canGoNewer || isLoading}
        className={`p-1 rounded-md transition-colors ${
          canGoNewer && !isLoading
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={canGoNewer ? 'Newer week' : 'Most recent week'}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className={`text-gray-600 min-w-[130px] text-center ${isLoading ? 'opacity-50' : ''}`}>
        {formatWeekLabel(currentWeek)}
      </span>

      <button
        onClick={goOlder}
        disabled={!canGoOlder || isLoading}
        className={`p-1 rounded-md transition-colors ${
          canGoOlder && !isLoading
            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title={canGoOlder ? 'Older week' : 'Oldest week'}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
