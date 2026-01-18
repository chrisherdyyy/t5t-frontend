'use client'

import { useQuery } from '@tanstack/react-query'
import { intelligence } from '@/lib/api'
import { formatPercentage } from '@/lib/utils'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import type { TeamHealth } from '@/types'

interface TeamHealthScorecardProps {
  weekOf?: string
  maxTeams?: number
}

function getRiskStatus(team: TeamHealth): 'green' | 'yellow' | 'red' {
  // Calculate risk based on submission rate, blocker count, AI adoption
  const score = team.submission_rate * 0.5
    + (team.blocker_count <= 2 ? 0.3 : team.blocker_count <= 5 ? 0.15 : 0)
    + team.ai_adoption_rate * 0.2

  if (score >= 0.65) return 'green'
  if (score >= 0.4) return 'yellow'
  return 'red'
}

function getSubmissionColor(rate: number): string {
  if (rate >= 0.8) return 'bg-green-500'
  if (rate >= 0.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getSubmissionTextColor(rate: number): string {
  if (rate >= 0.8) return 'text-green-600'
  if (rate >= 0.5) return 'text-yellow-600'
  return 'text-red-600'
}

export function TeamHealthScorecard({ weekOf, maxTeams = 8 }: TeamHealthScorecardProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teams-health-scorecard', weekOf],
    queryFn: () => intelligence.getTeamsHealth(weekOf),
    staleTime: 5 * 60 * 1000,
  })

  const teams = data?.data || []

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">Team Health Scorecard</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !teams.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">Team Health Scorecard</h2>
        </div>
        <p className="text-sm text-gray-500">
          {error ? 'Unable to load team health data.' : 'No team data available yet.'}
        </p>
      </div>
    )
  }

  // Sort teams by risk (red first, then yellow, then green)
  const sortedTeams = [...teams]
    .sort((a, b) => {
      const statusOrder = { red: 0, yellow: 1, green: 2 }
      return statusOrder[getRiskStatus(a)] - statusOrder[getRiskStatus(b)]
    })
    .slice(0, maxTeams)

  const riskColors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900">Team Health Scorecard</h2>
        </div>
        <Link
          href="/dashboard/analytics"
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="pb-2 pr-4 font-medium">Team</th>
              <th className="pb-2 pr-4 font-medium">Submissions</th>
              <th className="pb-2 pr-4 text-center font-medium">Trend</th>
              <th className="pb-2 pr-4 text-center font-medium">Health</th>
              <th className="pb-2 pr-4 text-center font-medium">AI</th>
              <th className="pb-2 text-center font-medium">Blockers</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team) => {
              const riskStatus = getRiskStatus(team)

              return (
                <tr
                  key={team.team_id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                >
                  {/* Team Name */}
                  <td className="py-3 pr-4">
                    <Link
                      href={`/dashboard/teams/${team.team_id}`}
                      className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {team.team_name}
                    </Link>
                  </td>

                  {/* Submission Rate with Progress Bar */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getSubmissionColor(team.submission_rate)}`}
                          style={{ width: `${team.submission_rate * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium min-w-[36px] ${getSubmissionTextColor(team.submission_rate)}`}>
                        {formatPercentage(team.submission_rate)}
                      </span>
                    </div>
                  </td>

                  {/* Sentiment Trend */}
                  <td className="py-3 pr-4 text-center">
                    {team.submission_rate >= 0.7 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                    ) : team.submission_rate >= 0.4 ? (
                      <Minus className="w-4 h-4 text-gray-400 mx-auto" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                    )}
                  </td>

                  {/* Health Status Badge */}
                  <td className="py-3 pr-4 text-center">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${riskColors[riskStatus]}`}
                      title={`Health: ${riskStatus}`}
                    />
                  </td>

                  {/* AI Adoption */}
                  <td className="py-3 pr-4 text-center">
                    <span className="text-xs text-gray-600">
                      {formatPercentage(team.ai_adoption_rate)}
                    </span>
                  </td>

                  {/* Blocker Count */}
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      team.blocker_count > 3 ? 'text-red-600' :
                      team.blocker_count > 0 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {team.blocker_count > 3 && <AlertCircle className="w-3 h-3" />}
                      {team.blocker_count}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note if more teams exist */}
      {teams.length > maxTeams && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Showing {maxTeams} of {teams.length} teams
        </p>
      )}
    </div>
  )
}
