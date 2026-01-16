'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { reportsByWeek, reports } from '@/lib/api'
import { formatWeekOf } from '@/lib/utils'
import { useState } from 'react'
import {
  FileText,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Bot,
  Zap,
  Calendar,
  Users,
} from 'lucide-react'
import type { WeekSummary, ReportWithDetails } from '@/types'

function WeekRow({
  week,
  isExpanded,
  onToggle,
}: {
  week: WeekSummary
  isExpanded: boolean
  onToggle: () => void
}) {
  const completionPercent = Math.round(week.completion_rate * 100)

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onToggle}
    >
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          <span className="font-medium text-gray-900">
            {formatWeekOf(week.week_of)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span className="text-gray-900">
          {week.submission_count}/{week.expected_count}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <span
          className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
            completionPercent >= 80
              ? 'bg-green-100 text-green-800'
              : completionPercent >= 50
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {completionPercent}%
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {week.top_themes.slice(0, 3).map((theme) => (
            <span
              key={theme}
              className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
            >
              {theme}
            </span>
          ))}
          {week.top_themes.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{week.top_themes.length - 3}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

function WeekDetailView({
  weekOf,
  onBack,
}: {
  weekOf: string
  onBack: () => void
}) {
  const router = useRouter()
  const [expandedReport, setExpandedReport] = useState<number | null>(null)

  const { data: weekReports, isLoading } = useQuery({
    queryKey: ['week-reports', weekOf],
    queryFn: () =>
      reports.list({ week_of: weekOf } as { week_of?: string }),
  })

  // We need to get full details - let's use the existing getCurrentWeek pattern or fetch individually
  const { data: fullReportsData } = useQuery({
    queryKey: ['week-reports-full', weekOf],
    queryFn: async () => {
      // Fetch reports with details using the /reports endpoint with week filter
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://t5t-backend-production.up.railway.app/api'}/reports/week/${encodeURIComponent(weekOf)}`
      )
      if (!response.ok) throw new Error('Failed to fetch reports')
      return response.json() as Promise<ReportWithDetails[]>
    },
  })

  const reportsData = fullReportsData || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to all weeks
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          Week of {formatWeekOf(weekOf)}
        </h2>
      </div>

      {reportsData.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top 5 Summary
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  AI/Auto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsData.map((report) => (
                <>
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() =>
                      setExpandedReport(
                        expandedReport === report.id ? null : report.id
                      )
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {expandedReport === report.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium text-sm">
                          {report.worker.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {report.worker.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(report.worker as any).team?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {report.top5_items
                        .slice(0, 2)
                        .map((item) =>
                          item.content.length > 60
                            ? item.content.substring(0, 60) + '...'
                            : item.content
                        )
                        .join(' • ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {report.ai_usage?.tools && (
                          <Bot className="w-4 h-4 text-purple-500" />
                        )}
                        {report.automation?.workflow && (
                          <Zap className="w-4 h-4 text-yellow-500" />
                        )}
                        {report.top5_items.some((i) => i.is_blocker) && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded row with full T5T */}
                  {expandedReport === report.id && (
                    <tr key={`${report.id}-expanded`}>
                      <td colSpan={4} className="bg-gray-50 px-8 py-4">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-gray-700">
                            Top 5 This Week
                          </h4>
                          <ol className="space-y-3">
                            {report.top5_items
                              .sort((a, b) => a.item_number - b.item_number)
                              .map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-start gap-3"
                                >
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs font-medium text-gray-600">
                                    {item.item_number}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700">
                                      {item.content}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {item.themes?.map((theme) => (
                                        <span
                                          key={theme}
                                          className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full"
                                        >
                                          {theme}
                                        </span>
                                      ))}
                                      {item.is_blocker && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded-full">
                                          <AlertTriangle className="w-3 h-3" />
                                          Blocker
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                          </ol>

                          {/* AI & Automation */}
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            {report.ai_usage?.tools && (
                              <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                  <Bot className="w-4 h-4 text-purple-500" />
                                  AI Usage
                                </div>
                                {report.ai_usage.tools_normalized?.length ? (
                                  <div className="flex flex-wrap gap-1">
                                    {report.ai_usage.tools_normalized.map(
                                      (tool) => (
                                        <span
                                          key={tool}
                                          className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full"
                                        >
                                          {tool}
                                        </span>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">
                                    {report.ai_usage.tools}
                                  </p>
                                )}
                              </div>
                            )}

                            {report.automation?.workflow && (
                              <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                  <Zap className="w-4 h-4 text-yellow-500" />
                                  Automation
                                </div>
                                <p className="text-sm text-gray-600">
                                  {report.automation.workflow}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/dashboard/reports/${report.id}`)
                              }}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              View full report →
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No reports for this week.</p>
        </div>
      )}
    </div>
  )
}

export default function ReportsPage() {
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null)
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())

  const { data: weeksData, isLoading } = useQuery({
    queryKey: ['reports-by-week'],
    queryFn: () => reportsByWeek.getWeeks(),
  })

  const weeks = weeksData?.data || []

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Show week detail view if a week is selected
  if (selectedWeek) {
    return (
      <WeekDetailView
        weekOf={selectedWeek}
        onBack={() => setSelectedWeek(null)}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">T5T submissions by week</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{weeks.length} weeks of data</span>
        </div>
      </div>

      {weeks.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Top Themes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeks.map((week) => (
                <>
                  <WeekRow
                    key={week.week_of}
                    week={week}
                    isExpanded={expandedWeeks.has(week.week_of)}
                    onToggle={() => toggleWeek(week.week_of)}
                  />

                  {/* Expanded view with team breakdown */}
                  {expandedWeeks.has(week.week_of) && (
                    <tr key={`${week.week_of}-expanded`}>
                      <td colSpan={4} className="bg-gray-50 px-8 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Team Breakdown
                          </h4>
                          <button
                            onClick={() => setSelectedWeek(week.week_of)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View all submissions →
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {week.teams.map((team) => (
                            <div
                              key={team.team_id}
                              className="bg-white border rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {team.team_name}
                                </span>
                                <span
                                  className={`text-xs font-medium ${
                                    team.submitted === team.expected
                                      ? 'text-green-600'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {team.submitted}/{team.expected}
                                </span>
                              </div>
                              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    team.submitted === team.expected
                                      ? 'bg-green-500'
                                      : team.submitted > 0
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-300'
                                  }`}
                                  style={{
                                    width: `${
                                      team.expected > 0
                                        ? (team.submitted / team.expected) * 100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No reports submitted yet.</p>
        </div>
      )}
    </div>
  )
}
