'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { workers, reports } from '@/lib/api'
import { OrgChart } from '@/components/OrgChart'
import { formatDate, formatWeekOf } from '@/lib/utils'
import type { OrgChartNode, ReportWithDetails } from '@/types'
import { X, FileText, Bot, Zap, Calendar } from 'lucide-react'

export default function OrgChartPage() {
  const router = useRouter()
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null)

  const { data: orgChartData, isLoading } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => workers.getOrgChart(),
  })

  const { data: reportsData } = useQuery({
    queryKey: ['worker-history', selectedNode?.id],
    queryFn: () => reports.getWorkerHistory(selectedNode!.id),
    enabled: !!selectedNode,
  })

  const handleNodeClick = (node: OrgChartNode) => {
    setSelectedNode(node)
  }

  const closePanel = () => {
    setSelectedNode(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization Chart</h1>
        <p className="text-gray-600">
          Click on a person to view their T5T history
        </p>
      </div>

      <div className="flex gap-6">
        {/* Org Chart */}
        <div className={`flex-1 transition-all ${selectedNode ? 'mr-80' : ''}`}>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-300" />
                <span>Submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-300" />
                <span>Not submitted</span>
              </div>
            </div>

            <OrgChart
              nodes={orgChartData?.data || []}
              onNodeClick={handleNodeClick}
            />
          </div>
        </div>

        {/* Details Panel */}
        {selectedNode && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l overflow-y-auto z-50">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedNode.name}
              </h2>
              <button
                onClick={closePanel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4">
              {/* Worker Info */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-semibold">
                    {selectedNode.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedNode.name}
                    </p>
                    <p className="text-sm text-gray-500">{selectedNode.email}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedNode.role}
                      {selectedNode.team_name && ` - ${selectedNode.team_name}`}
                    </p>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-lg ${
                    selectedNode.has_submitted_this_week
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {selectedNode.has_submitted_this_week
                    ? 'Submitted this week'
                    : 'Not yet submitted this week'}
                </div>
              </div>

              {/* Report History */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Report History
                </h3>

                {reportsData?.data?.length ? (
                  <div className="space-y-3">
                    {reportsData.data.slice(0, 12).map((report) => (
                      <button
                        key={report.id}
                        onClick={() => router.push(`/dashboard/reports/${report.id}`)}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {formatWeekOf(report.week_of)}
                          </span>
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-500">
                          Submitted {formatDate(report.submitted_at)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No reports yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
