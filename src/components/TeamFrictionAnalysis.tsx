'use client'

import { useQuery } from '@tanstack/react-query'
import { risks } from '@/lib/api'
import {
  Brain,
  AlertTriangle,
  ArrowRight,
  Link2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react'
import { useState } from 'react'
import type { CrossTeamAnalysis } from '@/types'

interface TeamFrictionAnalysisProps {
  weekOf?: string
  compact?: boolean
}

const riskColors: Record<string, string> = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-red-600 bg-red-50 border-red-200',
}

const riskBadgeColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export function TeamFrictionAnalysis({ weekOf, compact = true }: TeamFrictionAnalysisProps) {
  const [expanded, setExpanded] = useState(!compact)

  const { data, isLoading, error } = useQuery({
    queryKey: ['cross-team-analysis', weekOf],
    queryFn: () => risks.getCrossTeam(weekOf),
    staleTime: 5 * 60 * 1000,
  })

  const analysis = data?.data as CrossTeamAnalysis | undefined

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Cross-Team Dynamics</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-24 bg-gray-100 rounded"></div>
          <div className="h-16 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Cross-Team Dynamics</h2>
        </div>
        <p className="text-sm text-gray-500">
          {error ? 'Unable to load cross-team analysis.' : 'No cross-team data available yet.'}
        </p>
      </div>
    )
  }

  const hasFriction = analysis.friction_points?.length > 0
  const hasDependencies = analysis.dependency_chains?.length > 0
  const hasIssues = analysis.systemic_issues?.length > 0

  // All clear state
  if (!hasFriction && !hasDependencies && !hasIssues && !analysis.narrative) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">Cross-Team Dynamics</h2>
        </div>
        <div className="text-center py-4">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <div className="text-green-600 font-medium">Teams Aligned</div>
          <p className="text-sm text-gray-500 mt-1">No friction points detected this week</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Cross-Team Dynamics</h2>
        </div>
        {compact && (hasFriction || hasDependencies || hasIssues) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            {expanded ? 'Collapse' : 'Expand'}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* AI Narrative Summary - Always Visible */}
      {analysis.narrative && (
        <div className="bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-100 p-4 mb-4">
          <div className="flex items-start gap-3">
            <Brain className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 leading-relaxed">
              {compact && !expanded && analysis.narrative.length > 200
                ? `${analysis.narrative.slice(0, 200)}...`
                : analysis.narrative}
            </p>
          </div>
        </div>
      )}

      {/* Expandable Content */}
      {(expanded || !compact) && (
        <>
          {/* Friction Points & Dependency Chains Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Friction Points */}
            {hasFriction && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Friction Points
                </h3>
                <div className="space-y-2">
                  {analysis.friction_points.slice(0, compact ? 3 : undefined).map((fp, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-red-700">
                          {fp.teams_involved.join(' ↔ ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{fp.description}</p>
                      <div className="flex items-start gap-1 text-xs text-primary-600">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{fp.recommended_action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dependency Chains */}
            {hasDependencies && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Link2 className="w-4 h-4 text-amber-500" />
                  Dependency Chains
                </h3>
                <div className="space-y-2">
                  {analysis.dependency_chains.slice(0, compact ? 3 : undefined).map((dc, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${riskColors[dc.risk_level] || riskColors.medium}`}
                    >
                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        {dc.chain.map((team, j) => (
                          <span key={j} className="flex items-center">
                            <span className="text-sm font-medium">{team}</span>
                            {j < dc.chain.length - 1 && (
                              <ArrowRight className="w-3 h-3 mx-1 text-gray-400" />
                            )}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">{dc.description}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                        riskBadgeColors[dc.risk_level] || riskBadgeColors.medium
                      }`}>
                        {dc.risk_level} risk
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Systemic Issues */}
          {hasIssues && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Systemic Issues
              </h3>
              <div className="space-y-2">
                {analysis.systemic_issues.slice(0, compact ? 2 : undefined).map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded border border-amber-100">
                    <span className="text-amber-500 font-bold mt-0.5">!</span>
                    <div className="flex-1">
                      <span className="text-sm text-gray-700 font-medium">{issue.issue}</span>
                      <div className="text-xs text-gray-500 mt-1">
                        Affecting: {issue.affected_teams.join(', ')} ({issue.mention_count} mentions)
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      riskBadgeColors[issue.severity] || riskBadgeColors.medium
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          {hasFriction && (
            <div className="border-t pt-3 mt-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Recommended Actions
              </div>
              <ul className="space-y-1">
                {analysis.friction_points.slice(0, 3).map((fp, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-primary-500 mt-0.5">→</span>
                    {fp.recommended_action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Footer with week info */}
      <p className="text-xs text-gray-500 mt-3">
        Week of {new Date(analysis.week_of).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        {analysis.teams_analyzed && ` · ${analysis.teams_analyzed.length} teams analyzed`}
        {analysis.total_items_analyzed && ` · ${analysis.total_items_analyzed} items`}
      </p>
    </div>
  )
}
