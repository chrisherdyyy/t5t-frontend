'use client'

import { useQuery } from '@tanstack/react-query'
import { scorecard } from '@/lib/wbr-api'
import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronRight,
  FolderKanban,
} from 'lucide-react'
import Link from 'next/link'
import type {
  NorthStarMetricSummary,
  OKRSummary,
  ProjectStatusSummary,
  FunctionHealthSummary,
  OwnerAccountabilitySummary,
} from '@/types/wbr'

function formatValue(value: number | null | undefined, unit: string | null | undefined): string {
  if (value === null || value === undefined) return '-'
  if (unit === '$') return `$${value.toFixed(2)}`
  if (unit === '%') return `${value}%`
  return value.toString()
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'green':
      return 'bg-green-100 text-green-700'
    case 'yellow':
      return 'bg-yellow-100 text-yellow-700'
    case 'red':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getStatusDot(status: string | null): string {
  switch (status) {
    case 'green':
      return 'bg-green-500'
    case 'yellow':
      return 'bg-yellow-500'
    case 'red':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
}

function NorthStarCard({ metric }: { metric: NorthStarMetricSummary }) {
  const progress = metric.target_value && metric.current_value
    ? (metric.current_value / metric.target_value) * 100
    : 0

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{metric.name}</h3>
        {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />}
        {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 shrink-0" />}
        {metric.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400 shrink-0" />}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {formatValue(metric.current_value, metric.unit)}
          </span>
          <span className="text-sm text-gray-500">
            / {formatValue(metric.target_value, metric.unit)}
          </span>
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${progress >= 75 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {metric.gap !== null && metric.gap !== undefined && (
          <p className="text-xs text-gray-500">
            Gap: {formatValue(metric.gap, metric.unit)}
          </p>
        )}
      </div>

      {metric.owner_name && (
        <p className="text-xs text-gray-500 mt-2">Owner: {metric.owner_name}</p>
      )}
    </div>
  )
}

function OKRCard({ okr }: { okr: OKRSummary }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full ${getStatusDot(okr.status)}`} />
        <span className="text-sm font-medium text-gray-900">{okr.okr_group}</span>
      </div>
      <div className="text-sm text-gray-600">
        {okr.on_track_count}/{okr.metrics_count} on track
      </div>
    </div>
  )
}

function ProjectsOverview({ projects }: { projects: ProjectStatusSummary }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
        </div>
        <Link
          href="/wbr/projects"
          className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-700">{projects.green_count} On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-700">{projects.yellow_count} At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-700">{projects.red_count} Behind</span>
        </div>
      </div>

      {/* At risk projects */}
      {projects.at_risk_projects.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase">Needs Attention</p>
          {projects.at_risk_projects.slice(0, 5).map((project) => (
            <Link
              key={project.id}
              href={`/wbr/projects/${project.id}`}
              className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <span className={`w-2 h-2 mt-1.5 rounded-full ${getStatusDot(project.status)}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{project.name}</span>
                  {project.completion_pct !== null && (
                    <span className="text-xs text-gray-500">({project.completion_pct}%)</span>
                  )}
                </div>
                {project.blocker && (
                  <p className="text-xs text-gray-500 line-clamp-1">{project.blocker}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {projects.at_risk_projects.length === 0 && (
        <div className="text-center py-4">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">All projects on track</p>
        </div>
      )}
    </div>
  )
}

function FunctionHealthCard({ func }: { func: FunctionHealthSummary }) {
  return (
    <Link
      href={`/wbr/functions/${func.id}`}
      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-gray-900">{func.name}</p>
        <p className="text-xs text-gray-500">
          {func.kpi_count} KPIs, {func.project_count} Projects
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  )
}

function OwnerCard({ owner }: { owner: OwnerAccountabilitySummary }) {
  return (
    <div className="flex items-center justify-between p-3 border-b last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{owner.name}</p>
        <p className="text-xs text-gray-500">
          {owner.metrics_owned} metrics, {owner.projects_owned} projects
        </p>
      </div>
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        owner.on_track_pct >= 75 ? 'bg-green-100 text-green-700' :
        owner.on_track_pct >= 50 ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
      }`}>
        {Math.round(owner.on_track_pct)}% on track
      </div>
    </div>
  )
}

export default function WBRDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['wbr-scorecard'],
    queryFn: () => scorecard.get(),
  })

  const scorecardData = data?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">WBR Dashboard</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">WBR Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Failed to load WBR data</p>
          <p className="text-sm text-red-600 mt-1">
            Make sure you have uploaded a WBR document first.
          </p>
          <Link
            href="/wbr/upload"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Upload WBR
          </Link>
        </div>
      </div>
    )
  }

  if (!scorecardData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">WBR Dashboard</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <Target className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-700">No WBR data available</p>
          <p className="text-sm text-amber-600 mt-1">
            Upload your first WBR document to get started.
          </p>
          <Link
            href="/wbr/upload"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Upload WBR
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WBR Dashboard</h1>
          <p className="text-sm text-gray-500">
            Week of {new Date(scorecardData.week_of).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <Link
          href="/wbr/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
        >
          Upload WBR
        </Link>
      </div>

      {/* North Star Metrics */}
      {scorecardData.north_stars.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            North Star Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scorecardData.north_stars.map((metric) => (
              <NorthStarCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>
      )}

      {/* OKRs */}
      {scorecardData.okrs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">OKRs Summary</h2>
          <div className="space-y-2">
            {scorecardData.okrs.map((okr) => (
              <OKRCard key={okr.okr_group} okr={okr} />
            ))}
          </div>
        </div>
      )}

      {/* Projects and Functions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects */}
        <ProjectsOverview projects={scorecardData.projects} />

        {/* Functions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Functions</h2>
          <div className="space-y-1">
            {scorecardData.functions.map((func) => (
              <FunctionHealthCard key={func.id} func={func} />
            ))}
          </div>
        </div>
      </div>

      {/* Owner Accountability */}
      {scorecardData.owners.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Owner Accountability</h2>
          <div>
            {scorecardData.owners.map((owner) => (
              <OwnerCard key={owner.id} owner={owner} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
