'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { actions } from '@/lib/api'
import { formatWeekOf } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import {
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
} from 'lucide-react'
import type { ActionItem } from '@/types'

function ActionCard({
  action,
  onToggle,
  isLoading,
}: {
  action: ActionItem
  onToggle: () => void
  isLoading: boolean
}) {
  const isCompleted = action.action_status === 'completed'

  return (
    <div
      className={`flex items-start gap-3 p-4 border rounded-lg ${
        isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200 hover:border-primary-200'
      } transition-colors`}
    >
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`flex-shrink-0 mt-0.5 ${isLoading ? 'opacity-50' : ''}`}
      >
        {isCompleted ? (
          <CheckSquare className="w-5 h-5 text-green-600" />
        ) : (
          <Square className="w-5 h-5 text-gray-400 hover:text-primary-600" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {action.content}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">
            {action.worker_name}
          </span>
          {action.team_name && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{action.team_name}</span>
            </>
          )}
          {action.is_blocker && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">
              <AlertTriangle className="w-3 h-3" />
              Blocker
            </span>
          )}
          {action.themes?.slice(0, 2).map((theme) => (
            <span
              key={theme}
              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function WeekSection({
  weekOf,
  actions,
  isExpanded,
  onToggle,
  onActionToggle,
  loadingAction,
}: {
  weekOf: string
  actions: ActionItem[]
  isExpanded: boolean
  onToggle: () => void
  onActionToggle: (action: ActionItem) => void
  loadingAction: number | null
}) {
  const pendingCount = actions.filter((a) => a.action_status === 'pending').length

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500" />
          )}
          <span className="font-medium text-gray-900">
            {formatWeekOf(weekOf)}
          </span>
        </div>
        <span className={`text-sm px-2 py-0.5 rounded-full ${
          pendingCount > 0
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'
        }`}>
          {pendingCount > 0 ? `${pendingCount} pending` : 'All complete'}
        </span>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          {actions.length > 0 ? (
            actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onToggle={() => onActionToggle(action)}
                isLoading={loadingAction === action.id}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No actions for this week.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ActionsPage() {
  const queryClient = useQueryClient()
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [showCompleted, setShowCompleted] = useState(false)
  const [loadingAction, setLoadingAction] = useState<number | null>(null)
  const hasInitializedRef = useRef(false)

  const { data: actionsData, isLoading } = useQuery({
    queryKey: ['actions'],
    queryFn: () => actions.getAll('all'),
  })

  const completeMutation = useMutation({
    mutationFn: (itemId: number) => actions.complete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] })
      setLoadingAction(null)
    },
    onError: () => setLoadingAction(null),
  })

  const reopenMutation = useMutation({
    mutationFn: (itemId: number) => actions.reopen(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] })
      setLoadingAction(null)
    },
    onError: () => setLoadingAction(null),
  })

  const handleActionToggle = (action: ActionItem) => {
    setLoadingAction(action.id)
    if (action.action_status === 'completed') {
      reopenMutation.mutate(action.id)
    } else {
      completeMutation.mutate(action.id)
    }
  }

  const toggleWeek = (weekOf: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(weekOf)) {
        next.delete(weekOf)
      } else {
        next.add(weekOf)
      }
      return next
    })
  }

  const data = actionsData?.data
  const pendingActions = data?.pending || []
  const completedActions = data?.completed || []
  const byWeek = data?.by_week || {}

  // Get weeks sorted by date (most recent first)
  const sortedWeeks = Object.keys(byWeek).sort((a, b) => b.localeCompare(a))

  // Auto-expand the most recent week on initial load only
  useEffect(() => {
    if (!hasInitializedRef.current && sortedWeeks.length > 0) {
      setExpandedWeeks(new Set([sortedWeeks[0]]))
      hasInitializedRef.current = true
    }
  }, [sortedWeeks])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Actions</h1>
          <p className="text-gray-600">
            Actionable items extracted from T5T reports
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-gray-700">{pendingActions.length} pending</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">{completedActions.length} completed</span>
          </div>
        </div>
      </div>

      {/* Pending Actions by Week */}
      {sortedWeeks.length > 0 ? (
        <div className="space-y-4 mb-8">
          {sortedWeeks.map((weekOf) => {
            const weekActions = (byWeek[weekOf] || []).filter(
              (a: ActionItem) => a.action_status === 'pending'
            )
            if (weekActions.length === 0) return null

            return (
              <WeekSection
                key={weekOf}
                weekOf={weekOf}
                actions={weekActions}
                isExpanded={expandedWeeks.has(weekOf)}
                onToggle={() => toggleWeek(weekOf)}
                onActionToggle={handleActionToggle}
                loadingAction={loadingAction}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border mb-8">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No actionable items found.</p>
          <p className="text-sm text-gray-400 mt-1">
            Actions are extracted from T5T submissions that mention blockers, friction points, or actionable requests.
          </p>
        </div>
      )}

      {/* Completed Section */}
      {completedActions.length > 0 && (
        <div className="border-t pt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            {showCompleted ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            <span className="font-medium">
              Completed ({completedActions.length})
            </span>
          </button>

          {showCompleted && (
            <div className="space-y-3">
              {completedActions.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onToggle={() => handleActionToggle(action)}
                  isLoading={loadingAction === action.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
