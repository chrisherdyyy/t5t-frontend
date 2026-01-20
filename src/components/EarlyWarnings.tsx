'use client'

import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, TrendingDown, Users, ChevronRight, Activity } from 'lucide-react'
import Link from 'next/link'
import { risks } from '@/lib/api'
import type { WorkerRisk, TeamRisk } from '@/types'

function getRiskColor(riskLevel: string | number) {
  if (typeof riskLevel === 'number') {
    if (riskLevel >= 7) return 'text-red-600 bg-red-50'
    if (riskLevel >= 5) return 'text-amber-600 bg-amber-50'
    return 'text-green-600 bg-green-50'
  }
  switch (riskLevel) {
    case 'critical':
    case 'high':
      return 'text-red-600 bg-red-50'
    case 'medium':
      return 'text-amber-600 bg-amber-50'
    default:
      return 'text-green-600 bg-green-50'
  }
}

function getSentimentIcon(trend: string) {
  if (trend === 'declining' || trend.includes('down') || trend.includes('-')) {
    return <TrendingDown className="w-3 h-3 text-red-500" />
  }
  return null
}

function WorkerRiskCard({ worker }: { worker: WorkerRisk }) {
  const riskScore = Math.round(worker.burnout_risk * 10) / 10

  return (
    <Link
      href={`/dashboard/workers/${worker.worker_id}`}
      className="block p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-sm truncate">
              {worker.worker_name}
            </span>
            {getSentimentIcon(worker.sentiment_trend)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {worker.team_name || 'No Team'}
            {worker.job_title && ` · ${worker.job_title}`}
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(riskScore)}`}>
          {riskScore}/10
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
        {worker.assessment_summary}
      </p>
      {worker.recommended_actions && worker.recommended_actions.length > 0 && (
        <div className="mt-2 text-xs text-primary-600 flex items-center gap-1">
          <span>Suggested: {worker.recommended_actions[0]}</span>
        </div>
      )}
    </Link>
  )
}

function TeamRiskCard({ team }: { team: TeamRisk }) {
  const healthScore = Math.round(team.health_score * 10) / 10

  return (
    <Link
      href={`/dashboard/teams/${team.team_id}`}
      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
    >
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-900">{team.team_name}</span>
        {team.at_risk_workers > 0 && (
          <span className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
            {team.at_risk_workers} at risk
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getRiskColor(10 - healthScore)}`}>
          Health: {healthScore}/10
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  )
}

interface EarlyWarningsProps {
  weekOf?: string
}

export function EarlyWarnings({ weekOf }: EarlyWarningsProps = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['risks', weekOf],
    queryFn: () => risks.getAssessment(weekOf),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const riskData = data?.data

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Early Warnings</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-100 rounded"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !riskData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Early Warnings</h2>
        </div>
        <p className="text-sm text-gray-500">Unable to load risk assessment data.</p>
      </div>
    )
  }

  const hasHighRisk = riskData.high_risk_workers?.length > 0
  const hasMediumRisk = riskData.medium_risk_workers?.length > 0
  const hasTeamRisks = riskData.team_risks?.some(t => t.health_score < 7)

  if (!hasHighRisk && !hasMediumRisk && !hasTeamRisks) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">Early Warnings</h2>
        </div>
        <div className="text-center py-4">
          <div className="text-green-600 font-medium">All Clear</div>
          <p className="text-sm text-gray-500 mt-1">No risk signals detected this week</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Early Warnings</h2>
        </div>
        <span className="text-xs text-gray-500">Week of {riskData.week_of}</span>
      </div>

      {/* High Risk Workers */}
      {hasHighRisk && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="text-sm font-medium text-red-700">
              High Risk ({riskData.high_risk_workers.length})
            </span>
          </div>
          <div className="space-y-2">
            {riskData.high_risk_workers.slice(0, 3).map((worker) => (
              <WorkerRiskCard key={worker.worker_id} worker={worker} />
            ))}
          </div>
        </div>
      )}

      {/* Medium Risk Workers */}
      {hasMediumRisk && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-sm font-medium text-amber-700">
              Watch ({riskData.medium_risk_workers.length})
            </span>
          </div>
          <div className="space-y-2">
            {riskData.medium_risk_workers.slice(0, 2).map((worker) => (
              <WorkerRiskCard key={worker.worker_id} worker={worker} />
            ))}
          </div>
        </div>
      )}

      {/* Team Risks */}
      {hasTeamRisks && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Team Health</span>
          </div>
          <div className="space-y-1">
            {riskData.team_risks
              .filter(t => t.health_score < 7)
              .slice(0, 3)
              .map((team) => (
                <TeamRiskCard key={team.team_id} team={team} />
              ))}
          </div>
        </div>
      )}

      {/* Top Interventions */}
      {riskData.top_interventions?.length > 0 && (
        <div className="border-t pt-3 mt-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Suggested Interventions
          </div>
          <ul className="space-y-1">
            {riskData.top_interventions.slice(0, 3).map((intervention, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-primary-500 mt-1">→</span>
                {intervention}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Company Risk Summary */}
      {riskData.company_risk_summary && (
        <div className="border-t pt-3 mt-3">
          <p className="text-xs text-gray-600 italic">{riskData.company_risk_summary}</p>
        </div>
      )}
    </div>
  )
}
