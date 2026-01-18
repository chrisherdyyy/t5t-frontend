'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analytics, reports, intelligence, trends } from '@/lib/api'
import { formatWeekOf, formatPercentage } from '@/lib/utils'
import {
  Users,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap,
  Bot,
  Brain,
  ArrowRight,
  Filter,
  Building2,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [showOnlyMissing, setShowOnlyMissing] = useState(false)
  const { data: companyData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['company-analytics'],
    queryFn: () => analytics.getCompanyAnalytics(),
  })

  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: () => analytics.getSubmissions(),
  })

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['current-week-reports'],
    queryFn: () => reports.getCurrentWeek(),
  })

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['executive-summary'],
    queryFn: () => intelligence.getCompanySummary(),
  })

  const { data: themesSentimentData, isLoading: themesLoading } = useQuery({
    queryKey: ['themes-sentiment'],
    queryFn: () => analytics.getThemesSentiment(),
  })

  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends'],
    queryFn: () => trends.get(8),
  })

  const company = companyData?.data
  const themesSentiment = themesSentimentData?.data || []
  const submissions = submissionsData?.data
  const currentReports = reportsData?.data || []
  const summary = summaryData?.data
  const trendsInfo = trendsData?.data

  const isLoading = analyticsLoading || submissionsLoading || reportsLoading || summaryLoading || themesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {company && (
          <p className="text-gray-600">{formatWeekOf(company.week_of)}</p>
        )}
      </div>

      {/* Executive Summary Card */}
      {summary?.narrative && (
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary-100 shrink-0">
              <Brain className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">AI Executive Summary</h2>
                <Link
                  href="/dashboard/analytics"
                  className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Full Intelligence
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {summary.narrative}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Submission Rate"
          value={company ? formatPercentage(company.submission_rate) : '-'}
          subtext={company ? `${company.submitted_count} of ${company.total_workers}` : ''}
          color="blue"
        />
        <StatCard
          icon={Bot}
          label="AI Adoption"
          value={company ? formatPercentage(company.ai_adoption_rate) : '-'}
          subtext="of submissions use AI"
          color="purple"
        />
        <StatCard
          icon={Zap}
          label="Automations"
          value={company?.automation_mentions.toString() || '-'}
          subtext="mentioned this week"
          color="yellow"
        />
        <StatCard
          icon={AlertCircle}
          label="Blockers"
          value={company?.blockers.length.toString() || '-'}
          subtext="identified issues"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Themes with Sentiment */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Themes This Week
          </h2>
          {themesSentiment.length > 0 ? (
            <div className="space-y-3">
              {themesSentiment.slice(0, 8).map((theme) => {
                const total = theme.count
                const maxCount = themesSentiment[0]?.count || 1
                const positiveWidth = (theme.sentiment_breakdown.positive / total) * 100
                const neutralWidth = (theme.sentiment_breakdown.neutral / total) * 100
                const negativeWidth = (theme.sentiment_breakdown.negative / total) * 100
                const barWidth = (total / maxCount) * 100

                return (
                  <div key={theme.theme} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {theme.theme}
                        </span>
                        {theme.blocker_count > 0 && (
                          <span className="flex items-center gap-0.5 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {theme.blocker_count}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{theme.count}</span>
                    </div>
                    <div
                      className="h-2 bg-gray-100 rounded-full overflow-hidden flex"
                      style={{ width: `${Math.min(barWidth, 100)}%` }}
                      title={`Positive: ${theme.sentiment_breakdown.positive}, Neutral: ${theme.sentiment_breakdown.neutral}, Negative: ${theme.sentiment_breakdown.negative}`}
                    >
                      {positiveWidth > 0 && (
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${positiveWidth}%` }}
                        />
                      )}
                      {neutralWidth > 0 && (
                        <div
                          className="h-full bg-gray-400"
                          style={{ width: `${neutralWidth}%` }}
                        />
                      )}
                      {negativeWidth > 0 && (
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${negativeWidth}%` }}
                        />
                      )}
                    </div>
                    {/* Tooltip on hover */}
                    <div className="hidden group-hover:flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        {theme.sentiment_breakdown.positive} positive
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        {theme.sentiment_breakdown.neutral} neutral
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {theme.sentiment_breakdown.negative} negative
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : company?.top_themes.length ? (
            <div className="space-y-3">
              {company.top_themes.slice(0, 8).map((theme) => (
                <div key={theme.theme} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {theme.theme}
                      </span>
                      <span className="text-sm text-gray-500">{theme.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            (theme.count /
                              (company.top_themes[0]?.count || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No themes detected yet.</p>
          )}
        </div>

        {/* AI Tools */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            AI Tools in Use
          </h2>
          {company?.ai_tools.length ? (
            <div className="space-y-3">
              {company.ai_tools
                .sort((a, b) => b.count - a.count)
                .slice(0, 8)
                .map((tool) => {
                  const maxCount = company.ai_tools[0]?.count || 1
                  const barWidth = (tool.count / maxCount) * 100

                  return (
                    <div key={tool.tool} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {tool.tool}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{tool.count}</span>
                      </div>
                      <div
                        className="h-2 bg-gray-100 rounded-full overflow-hidden"
                        style={{ width: `${Math.min(barWidth, 100)}%` }}
                      >
                        <div className="h-full bg-purple-500 rounded-full" />
                      </div>
                      <div className="hidden group-hover:block mt-1 text-xs text-gray-500">
                        {tool.users.slice(0, 3).join(', ')}
                        {tool.users.length > 3 && ` +${tool.users.length - 3} more`}
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No AI tools reported yet.</p>
          )}
        </div>
      </div>

      {/* Trends Section */}
      {trendsInfo && (trendsInfo.emerging_themes.length > 0 || trendsInfo.declining_themes.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Theme Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emerging Themes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Emerging Themes
              </h3>
              {trendsInfo.emerging_themes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trendsInfo.emerging_themes.map((theme) => (
                    <span
                      key={theme}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No emerging themes detected</p>
              )}
            </div>
            {/* Declining Themes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Declining Themes
              </h3>
              {trendsInfo.declining_themes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {trendsInfo.declining_themes.map((theme) => (
                    <span
                      key={theme}
                      className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No declining themes detected</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Based on {trendsInfo.weeks_analyzed} weeks of data
          </p>
        </div>
      )}

      {/* Submission Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Submission Status
            </h2>
            <button
              onClick={() => setShowOnlyMissing(!showOnlyMissing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showOnlyMissing
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-3 h-3" />
              {showOnlyMissing ? 'Showing missing only' : 'Show missing only'}
            </button>
          </div>
          <Link
            href="/dashboard/reports"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View all reports &rarr;
          </Link>
        </div>
        {submissions?.submissions.length ? (
          <>
            {/* Team Summary Bar */}
            <div className="flex items-center gap-2 mb-4 pb-4 border-b overflow-x-auto">
              {(() => {
                const teamStats: Record<string, { submitted: number; total: number }> = {}
                submissions.submissions.forEach((sub) => {
                  const team = sub.team_name || 'No Team'
                  if (!teamStats[team]) teamStats[team] = { submitted: 0, total: 0 }
                  teamStats[team].total++
                  if (sub.submitted) teamStats[team].submitted++
                })
                return Object.entries(teamStats)
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 6)
                  .map(([team, stats]) => (
                    <div
                      key={team}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg shrink-0"
                    >
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700">{team}</span>
                      <span className={`text-xs font-bold ${
                        stats.submitted === stats.total ? 'text-green-600' :
                        stats.submitted / stats.total >= 0.5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {stats.submitted}/{stats.total}
                      </span>
                    </div>
                  ))
              })()}
            </div>
            <div className="flex flex-wrap gap-2">
              {submissions.submissions
                .filter((sub) => !showOnlyMissing || !sub.submitted)
                .map((sub) => (
                  <Link
                    key={sub.worker_id}
                    href={`/dashboard/workers/${sub.worker_id}`}
                    title={sub.team_name || 'No team'}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      sub.submitted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sub.submitted ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-current" />
                    )}
                    {sub.worker_name}
                  </Link>
                ))}
            </div>
            {showOnlyMissing && submissions.submissions.filter(s => !s.submitted).length === 0 && (
              <p className="text-green-600 text-sm text-center py-4">Everyone has submitted!</p>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-sm">No workers registered yet.</p>
        )}
      </div>

      {/* AI-Generated Wins & Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <Brain className="w-4 h-4 text-primary-500" />
            Wins This Week
          </h2>
          {(summary?.highlights?.length || company?.wins?.length) ? (
            <ul className="space-y-3">
              {(summary?.highlights || company?.wins || []).map((win, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No wins detected yet.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <Brain className="w-4 h-4 text-primary-500" />
            Blockers & Concerns
          </h2>
          {(summary?.concerns?.length || company?.blockers?.length) ? (
            <ul className="space-y-3">
              {(summary?.concerns || company?.blockers || []).map((blocker, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <span>{blocker}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No blockers detected.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string
  subtext: string
  color: 'blue' | 'purple' | 'yellow' | 'red'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtext}</p>
        </div>
      </div>
    </div>
  )
}
