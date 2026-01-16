'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { reports, teams } from '@/lib/api'
import { formatDate, formatWeekOf } from '@/lib/utils'
import { useState } from 'react'
import { FileText, Filter, Bot, Zap, AlertTriangle } from 'lucide-react'

export default function ReportsPage() {
  const router = useRouter()
  const [teamFilter, setTeamFilter] = useState<string>('')

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['current-week-reports', teamFilter],
    queryFn: () =>
      reports.getCurrentWeek(teamFilter ? parseInt(teamFilter) : undefined),
  })

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teams.list(),
  })

  const currentReports = reportsData?.data || []
  const allTeams = teamsData?.data || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">This week&apos;s T5T submissions</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Teams</option>
            {allTeams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {currentReports.length > 0 ? (
        <div className="space-y-6">
          {currentReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/reports/${report.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-lg">
                    {report.worker.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {report.worker.name}
                    </h3>
                    <p className="text-sm text-gray-500">{report.worker.email}</p>
                    <p className="text-xs text-gray-400">
                      Submitted {formatDate(report.submitted_at)}
                    </p>
                  </div>
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>

              {/* Top 5 Items */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Top 5 This Week
                </h4>
                <ol className="space-y-2">
                  {report.top5_items
                    .sort((a, b) => a.item_number - b.item_number)
                    .map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          {item.item_number}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-700">{item.content}</p>
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
              </div>

              {/* AI & Automation */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {report.ai_usage && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Bot className="w-4 h-4 text-purple-500" />
                      AI Usage
                    </div>
                    {report.ai_usage.tools_normalized?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {report.ai_usage.tools_normalized.map((tool) => (
                          <span
                            key={tool}
                            className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">{report.ai_usage.tools}</p>
                    )}
                  </div>
                )}

                {report.automation && report.automation.workflow && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Automation
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {report.automation.workflow}
                    </p>
                    {report.automation.category && (
                      <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-xs rounded-full">
                        {report.automation.category}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No reports submitted this week yet.</p>
        </div>
      )}
    </div>
  )
}
