'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recommendations } from '@/lib/api'
import { formatWeekOf } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import {
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  Lightbulb,
  User,
  AlertCircle,
  Building2,
  Globe,
} from 'lucide-react'
import type { RecommendationItem, WeeklyRecommendations, TeamRecommendations } from '@/types'

function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = {
    this_week: { bg: 'bg-red-50', text: 'text-red-700', label: 'This Week' },
    next_week: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Next Week' },
    this_month: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'This Month' },
  }[urgency] || { bg: 'bg-gray-50', text: 'text-gray-700', label: urgency }

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

function RecommendationCard({
  recommendation,
  onToggle,
  isLoading,
}: {
  recommendation: RecommendationItem
  onToggle: () => void
  isLoading: boolean
}) {
  const isCompleted = recommendation.status === 'completed'

  return (
    <div
      className={`p-4 border rounded-lg ${
        isCompleted
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200 hover:border-primary-200 hover:shadow-sm'
      } transition-all`}
    >
      <div className="flex items-start gap-3">
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
          <p className={`text-sm font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
            {recommendation.action}
          </p>
          <p className={`mt-1 text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
            {recommendation.why}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span>{recommendation.owner}</span>
            </div>
            <UrgencyBadge urgency={recommendation.urgency} />
            {isCompleted && recommendation.completed_at && (
              <span className="text-xs text-gray-400">
                Completed {new Date(recommendation.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function RecommendationList({
  recommendations: recs,
  onToggle,
  loadingKey,
  keyPrefix,
}: {
  recommendations: RecommendationItem[]
  onToggle: (index: number, status: string) => void
  loadingKey: string | null
  keyPrefix: string
}) {
  const [showCompleted, setShowCompleted] = useState(false)
  const pending = recs.filter((r) => r.status === 'pending')
  const completed = recs.filter((r) => r.status === 'completed')

  if (recs.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-2">No recommendations for this period</p>
    )
  }

  return (
    <div>
      {pending.length > 0 ? (
        <div className="space-y-3">
          {pending.map((rec) => (
            <RecommendationCard
              key={`${keyPrefix}-${rec.index}`}
              recommendation={rec}
              onToggle={() => onToggle(rec.index, rec.status)}
              isLoading={loadingKey === `${keyPrefix}-${rec.index}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <CheckCircle className="w-6 h-6 mx-auto mb-1 text-green-500" />
          <p className="text-sm text-gray-500">All done!</p>
        </div>
      )}

      {completed.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-sm font-medium">Completed ({completed.length})</span>
          </button>
          {showCompleted && (
            <div className="space-y-3">
              {completed.map((rec) => (
                <RecommendationCard
                  key={`${keyPrefix}-${rec.index}`}
                  recommendation={rec}
                  onToggle={() => onToggle(rec.index, rec.status)}
                  isLoading={loadingKey === `${keyPrefix}-${rec.index}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TeamSection({
  team,
  weekOf,
  onToggle,
  loadingKey,
}: {
  team: TeamRecommendations
  weekOf: string
  onToggle: (index: number, status: string, teamId: number) => void
  loadingKey: string | null
}) {
  const [isExpanded, setIsExpanded] = useState(team.pending_count > 0)
  const keyPrefix = `${weekOf}-team-${team.team_id}`

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-800">{team.team_name}</span>
        </div>
        <div className="flex items-center gap-2">
          {team.pending_count > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {team.pending_count} pending
            </span>
          )}
          {team.completed_count > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {team.completed_count} done
            </span>
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="p-4">
          <RecommendationList
            recommendations={team.recommendations}
            onToggle={(index, status) => onToggle(index, status, team.team_id)}
            loadingKey={loadingKey}
            keyPrefix={keyPrefix}
          />
        </div>
      )}
    </div>
  )
}

function WeekSection({
  weekData,
  isExpanded,
  onToggle,
  onCompanyToggle,
  onTeamToggle,
  loadingKey,
  isCurrent,
}: {
  weekData: WeeklyRecommendations
  isExpanded: boolean
  onToggle: () => void
  onCompanyToggle: (weekOf: string, index: number, status: string) => void
  onTeamToggle: (weekOf: string, index: number, status: string, teamId: number) => void
  loadingKey: string | null
  isCurrent: boolean
}) {
  const companyKeyPrefix = `${weekData.week_of}-company`
  const companyRecs = weekData.company || []
  const teamRecs = weekData.teams || []

  return (
    <div className={`border rounded-lg overflow-hidden ${isCurrent ? 'ring-2 ring-primary-200' : ''}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 ${
          isCurrent ? 'bg-primary-50 hover:bg-primary-100' : 'bg-gray-50 hover:bg-gray-100'
        } transition-colors`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
          <span className="font-medium text-gray-900">{formatWeekOf(weekData.week_of)}</span>
          {isCurrent && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
              Current
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {weekData.pending_count > 0 && (
            <span className="text-sm px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {weekData.pending_count} pending
            </span>
          )}
          {weekData.completed_count > 0 && (
            <span className="text-sm px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              {weekData.completed_count} done
            </span>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 bg-white space-y-6">
          {/* Company-wide recommendations */}
          {companyRecs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-primary-600" />
                <h3 className="text-sm font-semibold text-gray-700">Company-Wide</h3>
              </div>
              <RecommendationList
                recommendations={companyRecs}
                onToggle={(index, status) => onCompanyToggle(weekData.week_of, index, status)}
                loadingKey={loadingKey}
                keyPrefix={companyKeyPrefix}
              />
            </div>
          )}

          {/* Team recommendations */}
          {teamRecs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">By Team</h3>
              </div>
              <div className="space-y-3">
                {teamRecs.map((team) => (
                  <TeamSection
                    key={team.team_id}
                    team={team}
                    weekOf={weekData.week_of}
                    onToggle={(index, status, teamId) => onTeamToggle(weekData.week_of, index, status, teamId)}
                    loadingKey={loadingKey}
                  />
                ))}
              </div>
            </div>
          )}

          {companyRecs.length === 0 && teamRecs.length === 0 && (
            <div className="text-center py-6">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-500">No recommendations for this week</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RecommendationsPage() {
  const queryClient = useQueryClient()
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [loadingKey, setLoadingKey] = useState<string | null>(null)
  const hasInitializedRef = useRef(false)

  const { data: recsData, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendations.getAll(8),
  })

  const completeMutation = useMutation({
    mutationFn: ({ weekOf, index, scope, teamId }: { weekOf: string; index: number; scope: 'company' | 'team'; teamId?: number }) =>
      recommendations.complete(weekOf, index, scope, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      setLoadingKey(null)
    },
    onError: () => setLoadingKey(null),
  })

  const reopenMutation = useMutation({
    mutationFn: ({ weekOf, index, scope, teamId }: { weekOf: string; index: number; scope: 'company' | 'team'; teamId?: number }) =>
      recommendations.reopen(weekOf, index, scope, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      setLoadingKey(null)
    },
    onError: () => setLoadingKey(null),
  })

  const handleCompanyToggle = (weekOf: string, index: number, currentStatus: string) => {
    setLoadingKey(`${weekOf}-company-${index}`)
    if (currentStatus === 'completed') {
      reopenMutation.mutate({ weekOf, index, scope: 'company' })
    } else {
      completeMutation.mutate({ weekOf, index, scope: 'company' })
    }
  }

  const handleTeamToggle = (weekOf: string, index: number, currentStatus: string, teamId: number) => {
    setLoadingKey(`${weekOf}-team-${teamId}-${index}`)
    if (currentStatus === 'completed') {
      reopenMutation.mutate({ weekOf, index, scope: 'team', teamId })
    } else {
      completeMutation.mutate({ weekOf, index, scope: 'team', teamId })
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

  const data = recsData?.data
  const currentWeek = data?.current_week
  const previousWeeks = data?.previous_weeks || []
  const allWeeks = currentWeek ? [currentWeek, ...previousWeeks] : previousWeeks

  useEffect(() => {
    if (!hasInitializedRef.current && currentWeek) {
      setExpandedWeeks(new Set([currentWeek.week_of]))
      hasInitializedRef.current = true
    }
  }, [currentWeek])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-gray-700">Failed to load recommendations</p>
        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-7 h-7 text-amber-500" />
            Recommendations
          </h1>
          <p className="text-gray-600 mt-1">
            AI-generated strategic actions based on T5T submissions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-gray-700">{data?.total_pending || 0} pending</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">{data?.total_completed || 0} completed</span>
          </div>
        </div>
      </div>

      {allWeeks.length > 0 ? (
        <div className="space-y-4">
          {allWeeks.map((weekData) => {
            const isCurrent = currentWeek && weekData.week_of === currentWeek.week_of
            return (
              <WeekSection
                key={weekData.week_of}
                weekData={weekData}
                isExpanded={expandedWeeks.has(weekData.week_of)}
                onToggle={() => toggleWeek(weekData.week_of)}
                onCompanyToggle={handleCompanyToggle}
                onTeamToggle={handleTeamToggle}
                loadingKey={loadingKey}
                isCurrent={!!isCurrent}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No recommendations yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Recommendations are generated from T5T submissions each week.
            They&apos;ll appear here once reports are processed.
          </p>
        </div>
      )}
    </div>
  )
}
