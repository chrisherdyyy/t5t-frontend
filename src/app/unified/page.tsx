'use client'

import { useQuery } from '@tanstack/react-query'
import { unified } from '@/lib/wbr-api'
import {
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  FileText,
  Target,
  ChevronRight,
  Loader2,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import type { EarlyWarning, T5THighlights, WBRHighlights } from '@/types/wbr'

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

function getStatusColor(status: string | null): string {
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

function EarlyWarningCard({ warning }: { warning: EarlyWarning }) {
  return (
    <div className={`rounded-lg border p-4 ${getSeverityColor(warning.severity)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium">{warning.person}</span>
        </div>
        <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-white/50">
          {warning.severity}
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <p><span className="opacity-70">T5T:</span> {warning.t5t_signal}</p>
        <p><span className="opacity-70">WBR:</span> {warning.wbr_signal}</p>
      </div>
      {warning.projects.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {warning.projects.map((p, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full bg-white/50 flex items-center gap-1"
            >
              <span className={`w-2 h-2 rounded-full ${getStatusColor(p.status)}`} />
              {p.name}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs mt-3 opacity-80 italic">{warning.recommendation}</p>
    </div>
  )
}

function T5THighlightsCard({ highlights }: { highlights: T5THighlights }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">T5T Highlights</h2>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View T5T
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-700">{highlights.recent_reports}</p>
          <p className="text-xs text-indigo-600">Reports This Week</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="flex justify-center gap-2 text-sm">
            {Object.entries(highlights.risk_distribution).map(([level, count]) => (
              <span key={level} className={`px-2 py-0.5 rounded ${
                level === 'high' || level === 'critical' ? 'bg-red-100 text-red-700' :
                level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {count} {level}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Risk Distribution</p>
        </div>
      </div>

      {/* High Risk Workers */}
      {highlights.high_risk_workers.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">High Risk Team Members</p>
          <div className="space-y-2">
            {highlights.high_risk_workers.map((worker, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 bg-red-50 rounded">
                <span className="font-medium text-gray-900">{worker.name}</span>
                <span className="text-red-600 text-xs">{worker.risk_level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {highlights.high_risk_workers.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <Users className="w-6 h-6 mx-auto mb-1 text-green-500" />
          No high-risk team members
        </div>
      )}
    </div>
  )
}

function WBRHighlightsCard({ highlights }: { highlights: WBRHighlights }) {
  const { project_status_distribution: dist, at_risk_projects } = highlights

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">WBR Highlights</h2>
        </div>
        <Link
          href="/wbr"
          className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          View WBR
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Project Status */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-700">{dist.green || 0} On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-700">{dist.yellow || 0} At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-gray-700">{dist.red || 0} Behind</span>
        </div>
      </div>

      {/* At Risk Projects */}
      {at_risk_projects.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase mb-2">Needs Attention</p>
          <div className="space-y-2">
            {at_risk_projects.map((project, i) => (
              <div key={i} className="p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                  <span className="text-sm font-medium text-gray-900">{project.project}</span>
                </div>
                {project.blocker && (
                  <p className="text-xs text-gray-500 pl-4">{project.blocker}</p>
                )}
                {project.owner && (
                  <p className="text-xs text-gray-400 pl-4">Owner: {project.owner}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {at_risk_projects.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          <FolderKanban className="w-6 h-6 mx-auto mb-1 text-green-500" />
          All projects on track
        </div>
      )}
    </div>
  )
}

export default function UnifiedDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['unified-dashboard'],
    queryFn: () => unified.getDashboard(),
  })

  const dashboard = data?.data

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Failed to load dashboard data</p>
          <p className="text-sm text-red-600 mt-1">
            Make sure both T5T and WBR modules are configured.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CEO Dashboard</h1>
          <p className="text-sm text-gray-500">
            Unified view combining T5T and WBR insights
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Generated: {dashboard?.generated_at ? new Date(dashboard.generated_at).toLocaleDateString() : 'N/A'}
        </div>
      </div>

      {/* Executive Summary */}
      {dashboard?.executive_summary && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Executive Summary</h2>
              <p className="text-white/90">{dashboard.executive_summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Early Warnings */}
      {dashboard?.early_warnings && dashboard.early_warnings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Cross-System Early Warnings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboard.early_warnings.map((warning, i) => (
              <EarlyWarningCard key={i} warning={warning} />
            ))}
          </div>
        </div>
      )}

      {/* T5T + WBR Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboard?.t5t_highlights && (
          <T5THighlightsCard highlights={dashboard.t5t_highlights} />
        )}
        {dashboard?.wbr_highlights && (
          <WBRHighlightsCard highlights={dashboard.wbr_highlights} />
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard"
            className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <FileText className="w-6 h-6 text-indigo-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">T5T Dashboard</span>
          </Link>
          <Link
            href="/wbr"
            className="flex flex-col items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Target className="w-6 h-6 text-amber-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">WBR Dashboard</span>
          </Link>
          <Link
            href="/wbr/projects"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FolderKanban className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">All Projects</span>
          </Link>
          <Link
            href="/unified/people"
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Users className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">People Directory</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
