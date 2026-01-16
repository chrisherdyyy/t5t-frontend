'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { workers, teams, reports } from '@/lib/api'
import { OrgChart, OrgChartList } from '@/components/OrgChart'
import { WorkerModal } from '@/components/WorkerModal'
import { formatDate, formatWeekOf } from '@/lib/utils'
import type { OrgChartNode, Worker } from '@/types'
import { X, FileText, Calendar, LayoutGrid, List, ZoomIn, ZoomOut, RotateCcw, Pencil } from 'lucide-react'

export default function OrgChartPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('visual')
  const [zoom, setZoom] = useState(100)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { data: orgChartData, isLoading } = useQuery({
    queryKey: ['org-chart'],
    queryFn: () => workers.getOrgChart(),
  })

  const { data: workersData } = useQuery({
    queryKey: ['workers'],
    queryFn: () => workers.list(),
  })

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teams.list(),
  })

  const { data: reportsData } = useQuery({
    queryKey: ['worker-history', selectedNode?.id],
    queryFn: () => reports.getWorkerHistory(selectedNode!.id),
    enabled: !!selectedNode,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Worker> }) =>
      workers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['org-chart'] })
      setIsEditModalOpen(false)
    },
  })

  const handleNodeClick = (node: OrgChartNode) => {
    setSelectedNode(node)
    setIsEditModalOpen(false)
  }

  const closePanel = () => {
    setSelectedNode(null)
    setIsEditModalOpen(false)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 20, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 20, 40))
  }

  const handleZoomReset = () => {
    setZoom(100)
  }

  // Try to find the full worker data from the workers list
  const fullWorkerData = selectedNode
    ? workersData?.data?.find((w) => w.id === selectedNode.id) || null
    : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organization Chart</h1>
            <p className="text-gray-600">
              Click on a person to view their T5T history
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('visual')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Visual
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Org Chart */}
        <div className={`flex-1 transition-all ${selectedNode ? 'mr-80' : ''}`}>
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-400" />
                  <span>Submitted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-300" />
                  <span>Not submitted</span>
                </div>
              </div>

              {/* Zoom Controls - only show in visual mode */}
              {viewMode === 'visual' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-1"
                    title="Reset zoom"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {/* Chart Content */}
            <div className="p-6 overflow-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {viewMode === 'visual' ? (
                <div
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <OrgChart
                    nodes={orgChartData?.data || []}
                    onNodeClick={handleNodeClick}
                  />
                </div>
              ) : (
                <OrgChartList
                  nodes={orgChartData?.data || []}
                  onNodeClick={handleNodeClick}
                />
              )}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        {selectedNode && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg border-l overflow-y-auto z-50">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedNode.name}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit worker"
                >
                  <Pencil className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={closePanel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
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
                    {selectedNode.job_title && (
                      <p className="text-sm text-gray-600">{selectedNode.job_title}</p>
                    )}
                    <p className="text-sm text-gray-400">
                      {selectedNode.team_name || selectedNode.role}
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

      {/* Edit Worker Modal */}
      {isEditModalOpen && fullWorkerData && (
        <WorkerModal
          worker={fullWorkerData}
          workers={workersData?.data || []}
          teams={teamsData?.data || []}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(data) => {
            updateMutation.mutate({ id: fullWorkerData.id, data })
          }}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  )
}
