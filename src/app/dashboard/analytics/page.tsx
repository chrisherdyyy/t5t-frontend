'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { intelligence } from '@/lib/api'
import { formatPercentage } from '@/lib/utils'
import {
  Brain,
  Users,
  Bot,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Building2,
  ChevronRight,
} from 'lucide-react'

export default function AnalyticsPage() {
  const queryClient = useQueryClient()
  const [isRegenerating, setIsRegenerating] = useState(false)

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['executive-summary'],
    queryFn: () => intelligence.getCompanySummary(),
  })

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams-health'],
    queryFn: () => intelligence.getTeamsHealth(),
  })

  const regenerateMutation = useMutation({
    mutationFn: () => intelligence.regenerateSummary(),
    onMutate: () => setIsRegenerating(true),
    onSettled: () => {
      setIsRegenerating(false)
      queryClient.invalidateQueries({ queryKey: ['executive-summary'] })
    },
  })

  const summary = summaryData?.data
  const teams = teamsData?.data || []

  const isLoading = summaryLoading || teamsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const weekOf = summary?.week_of
    ? new Date(summary.week_of).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'This Week'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CEO Intelligence</h1>
        <p className="text-gray-600">Week of {weekOf}</p>
      </div>

      {/* Executive Summary - Hero Card */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary-100">
              <Brain className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Executive Summary</h2>
              <p className="text-sm text-gray-500">AI-generated insight from T5T submissions</p>
            </div>
          </div>
          <button
            onClick={() => regenerateMutation.mutate()}
            disabled={isRegenerating}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>

        {summary?.narrative ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{summary.narrative}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No submissions yet this week. The executive summary will appear once T5T reports are received.
          </p>
        )}

        {/* Quick Metrics */}
        {summary?.metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-primary-100">
            <div>
              <p className="text-sm text-gray-500">Submission Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(summary.metrics.submission_rate)}
              </p>
              <p className="text-xs text-gray-500">
                {summary.metrics.submitted_count} of {summary.metrics.total_workers}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">AI Adoption</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatPercentage(summary.metrics.ai_adoption_rate)}
              </p>
              <p className="text-xs text-gray-500">using AI tools</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Blockers</p>
              <p className="text-2xl font-bold text-red-600">{summary.metrics.blocker_count}</p>
              <p className="text-xs text-gray-500">need attention</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teams Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(summary.team_submissions || {}).length}
              </p>
              <p className="text-xs text-gray-500">with submissions</p>
            </div>
          </div>
        )}
      </div>

      {/* Highlights & Concerns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Highlights */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Key Highlights
          </h3>
          {summary?.highlights?.length ? (
            <ul className="space-y-3">
              {summary.highlights.map((highlight, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">&#x2713;</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Highlights will appear when submissions are analyzed.</p>
          )}
        </div>

        {/* Concerns */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Areas of Concern
          </h3>
          {summary?.concerns?.length ? (
            <ul className="space-y-3">
              {summary.concerns.map((concern, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5">!</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No concerns flagged this week.</p>
          )}
        </div>
      </div>

      {/* Top Themes */}
      {summary?.top_themes && summary.top_themes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Themes This Week</h3>
          <div className="flex flex-wrap gap-2">
            {summary.top_themes.map((theme) => (
              <span
                key={theme}
                className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Team Health Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-400" />
            Team Health
          </h3>
        </div>

        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.team_id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{team.team_name}</h4>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="space-y-2">
                  {/* Submission Rate Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Submissions</span>
                      <span>
                        {team.submitted_count}/{team.total_workers}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          team.submission_rate >= 0.8
                            ? 'bg-green-500'
                            : team.submission_rate >= 0.5
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${team.submission_rate * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 pt-2 text-xs">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Bot className="w-3 h-3" />
                      <span>{formatPercentage(team.ai_adoption_rate)} AI</span>
                    </div>
                    {team.blocker_count > 0 && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{team.blocker_count} blockers</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Team health data will appear once submissions are received.</p>
        )}
      </div>

      {/* Team Submissions Breakdown */}
      {summary?.team_submissions && Object.keys(summary.team_submissions).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            Submissions by Team
          </h3>
          <div className="space-y-3">
            {Object.entries(summary.team_submissions)
              .sort(([, a], [, b]) => b - a)
              .map(([teamName, count]) => (
                <div key={teamName} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{teamName}</span>
                  <span className="text-sm font-medium text-gray-900">{count} submissions</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
