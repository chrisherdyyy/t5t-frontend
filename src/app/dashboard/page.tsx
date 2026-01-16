'use client'

import { useQuery } from '@tanstack/react-query'
import { analytics, reports } from '@/lib/api'
import { formatWeekOf, formatPercentage } from '@/lib/utils'
import {
  Users,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Zap,
  Bot,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
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

  const company = companyData?.data
  const submissions = submissionsData?.data
  const currentReports = reportsData?.data || []

  const isLoading = analyticsLoading || submissionsLoading || reportsLoading

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
        {/* Top Themes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Themes This Week
          </h2>
          {company?.top_themes.length ? (
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
              {company.ai_tools.map((tool) => (
                <div
                  key={tool.tool}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tool.tool}</p>
                    <p className="text-sm text-gray-500">
                      {tool.users.slice(0, 3).join(', ')}
                      {tool.users.length > 3 && ` +${tool.users.length - 3} more`}
                    </p>
                  </div>
                  <span className="text-lg font-semibold text-primary-600">
                    {tool.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No AI tools reported yet.</p>
          )}
        </div>
      </div>

      {/* Submission Status */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Submission Status
          </h2>
          <Link
            href="/dashboard/reports"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View all reports &rarr;
          </Link>
        </div>
        {submissions?.submissions.length ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {submissions.submissions.map((sub) => (
              <div
                key={sub.worker_id}
                className={`p-3 rounded-lg text-center ${
                  sub.submitted
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                  {sub.submitted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {sub.worker_name}
                </p>
                {sub.team_name && (
                  <p className="text-xs text-gray-500 truncate">{sub.team_name}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No workers registered yet.</p>
        )}
      </div>

      {/* Wins & Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Wins This Week
          </h2>
          {company?.wins.length ? (
            <ul className="space-y-2">
              {company.wins.map((win, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-1">&#x2022;</span>
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
            Blockers & Concerns
          </h2>
          {company?.blockers.length ? (
            <ul className="space-y-2">
              {company.blockers.map((blocker, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-red-500 mt-1">&#x2022;</span>
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
