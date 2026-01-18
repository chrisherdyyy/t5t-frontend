'use client'

import { useQuery } from '@tanstack/react-query'
import { unified } from '@/lib/wbr-api'
import {
  ArrowLeft,
  User,
  FileText,
  Target,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function getAssessmentColor(status: string): string {
  switch (status) {
    case 'good':
      return 'bg-green-100 border-green-200 text-green-700'
    case 'needs_attention':
      return 'bg-yellow-100 border-yellow-200 text-yellow-700'
    case 'at_risk':
      return 'bg-red-100 border-red-200 text-red-700'
    default:
      return 'bg-gray-100 border-gray-200 text-gray-700'
  }
}

function getAssessmentIcon(status: string) {
  switch (status) {
    case 'good':
      return <CheckCircle className="w-5 h-5" />
    case 'needs_attention':
      return <AlertTriangle className="w-5 h-5" />
    case 'at_risk':
      return <XCircle className="w-5 h-5" />
    default:
      return <AlertCircle className="w-5 h-5" />
  }
}

export default function UnifiedPersonProfilePage() {
  const params = useParams()
  const email = decodeURIComponent(params.email as string)

  const { data, isLoading, error } = useQuery({
    queryKey: ['unified-person', email],
    queryFn: () => unified.getPersonProfile(email),
  })

  const profile = data?.data

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Link href="/unified/people" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to People
        </Link>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6 p-6">
        <Link href="/unified/people" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Back to People
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Person not found</p>
          <p className="text-sm text-red-600 mt-1">
            {email} is not in the T5T or WBR system.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back Link */}
      <Link href="/unified/people" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Back to People
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
          profile.unified_assessment?.has_t5t_data && profile.unified_assessment?.has_wbr_data
            ? 'bg-purple-500'
            : profile.t5t ? 'bg-indigo-500' : 'bg-amber-500'
        }`}>
          {profile.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name || 'Unknown'}</h1>
          <p className="text-gray-500">{profile.email}</p>
          <div className="flex gap-2 mt-2">
            {profile.t5t && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                <FileText className="w-3 h-3" />
                T5T
              </span>
            )}
            {profile.wbr && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                <Target className="w-3 h-3" />
                WBR
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Unified Assessment */}
      {profile.unified_assessment && profile.unified_assessment.status !== 'no_data' && (
        <div className={`rounded-lg border p-6 ${getAssessmentColor(profile.unified_assessment.status)}`}>
          <div className="flex items-start gap-3">
            {getAssessmentIcon(profile.unified_assessment.status)}
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Unified Assessment: {profile.unified_assessment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h2>
              {profile.unified_assessment.signals.length > 0 ? (
                <ul className="space-y-1">
                  {profile.unified_assessment.signals.map((signal, i) => (
                    <li key={i} className="text-sm">{signal}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">No concerning signals detected</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* T5T and WBR Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* T5T Data */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">T5T Data</h2>
          </div>

          {profile.t5t ? (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{profile.t5t.total_reports}</p>
                  <p className="text-xs text-indigo-600">Total Reports</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{profile.t5t.submission_streak}</p>
                  <p className="text-xs text-indigo-600">Week Streak</p>
                </div>
              </div>

              {/* Sentiment */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Sentiment Score</span>
                  <span className="font-semibold">{profile.t5t.sentiment_score ?? 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Level</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    profile.t5t.risk_level === 'high' || profile.t5t.risk_level === 'critical'
                      ? 'bg-red-100 text-red-700'
                      : profile.t5t.risk_level === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {profile.t5t.risk_level || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Recent Blockers */}
              {profile.t5t.recent_blockers.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Recent Blockers</p>
                  <ul className="space-y-1">
                    {profile.t5t.recent_blockers.map((blocker, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded p-2">
                        {blocker}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {profile.t5t.last_report_date && (
                <p className="text-xs text-gray-500">
                  Last report: {new Date(profile.t5t.last_report_date).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Not in T5T system</p>
            </div>
          )}
        </div>

        {/* WBR Data */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">WBR Data</h2>
          </div>

          {profile.wbr ? (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-bold text-amber-700">{profile.wbr.metrics_on_track}</p>
                    <span className="text-gray-400">/</span>
                    <p className="text-lg text-gray-500">{profile.wbr.metrics_owned}</p>
                  </div>
                  <p className="text-xs text-amber-600">Metrics On Track</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-bold text-amber-700">{profile.wbr.projects_on_track}</p>
                    <span className="text-gray-400">/</span>
                    <p className="text-lg text-gray-500">{profile.wbr.projects_owned}</p>
                  </div>
                  <p className="text-xs text-amber-600">Projects On Track</p>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Overall On Track</span>
                  <span className={`font-semibold ${
                    profile.wbr.on_track_pct >= 75 ? 'text-green-600' :
                    profile.wbr.on_track_pct >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {profile.wbr.on_track_pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      profile.wbr.on_track_pct >= 75 ? 'bg-green-500' :
                      profile.wbr.on_track_pct >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${profile.wbr.on_track_pct}%` }}
                  />
                </div>
              </div>

              {/* Current Blockers */}
              {profile.wbr.current_blockers.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Current Blockers</p>
                  <ul className="space-y-2">
                    {profile.wbr.current_blockers.map((item, i) => (
                      <li key={i} className="bg-gray-50 rounded p-2">
                        <p className="text-sm font-medium text-gray-900">{item.project}</p>
                        <p className="text-sm text-gray-600">{item.blocker}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Not in WBR system</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
