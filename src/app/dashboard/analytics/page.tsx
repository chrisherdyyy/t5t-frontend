'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { intelligence, teams as teamsApi, workers as workersApi } from '@/lib/api'
import { formatPercentage } from '@/lib/utils'
import type { TimeRange, IntelligenceScope, Team, Worker } from '@/types'
import {
  Brain,
  Users,
  Bot,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Building2,
  ChevronRight,
  Calendar,
  User,
  ChevronDown,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  )
}

function AnalyticsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Initialize state from URL params
  const [scope, setScope] = useState<IntelligenceScope>(() => {
    const urlScope = searchParams.get('scope')
    return (urlScope === 'team' || urlScope === 'worker') ? urlScope : 'company'
  })
  const [teamId, setTeamId] = useState<number | undefined>(() => {
    const urlTeamId = searchParams.get('team_id')
    return urlTeamId ? parseInt(urlTeamId) : undefined
  })
  const [workerId, setWorkerId] = useState<number | undefined>(() => {
    const urlWorkerId = searchParams.get('worker_id')
    return urlWorkerId ? parseInt(urlWorkerId) : undefined
  })
  const [timeRange, setTimeRange] = useState<TimeRange>(() => {
    const urlTime = searchParams.get('time')
    return (urlTime === 'all_time' || urlTime === 'specific_week') ? urlTime : 'this_week'
  })
  const [weekOf, setWeekOf] = useState<string | undefined>(() => {
    return searchParams.get('week_of') || undefined
  })

  // Dropdown states
  const [showWeekPicker, setShowWeekPicker] = useState(false)
  const [showTeamPicker, setShowTeamPicker] = useState(false)
  const [showWorkerPicker, setShowWorkerPicker] = useState(false)

  // URL Sync
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('scope', scope)
    params.set('time', timeRange)
    if (scope === 'team' && teamId) params.set('team_id', teamId.toString())
    if (scope === 'worker' && workerId) params.set('worker_id', workerId.toString())
    if (timeRange === 'specific_week' && weekOf) params.set('week_of', weekOf)
    router.replace(`/dashboard/analytics?${params.toString()}`, { scroll: false })
  }, [scope, teamId, workerId, timeRange, weekOf, router])

  // Data fetching for selectors
  const { data: availableWeeksData } = useQuery({
    queryKey: ['available-weeks', scope, scope === 'team' ? teamId : scope === 'worker' ? workerId : undefined],
    queryFn: () => intelligence.getAvailableWeeks(scope, scope === 'team' ? teamId : scope === 'worker' ? workerId : undefined),
  })

  const { data: teamsListData } = useQuery({
    queryKey: ['teams-list'],
    queryFn: () => teamsApi.list(),
  })

  const { data: workersListData } = useQuery({
    queryKey: ['workers-list'],
    queryFn: () => workersApi.list({ is_active: true }),
  })

  // Main data queries based on scope and time
  const { data: companySummaryData, isLoading: companySummaryLoading } = useQuery({
    queryKey: ['company-summary', weekOf],
    queryFn: () => intelligence.getCompanySummary({ week_of: weekOf }),
    enabled: timeRange !== 'all_time' && scope === 'company',
  })

  const { data: companyAllTimeData, isLoading: companyAllTimeLoading } = useQuery({
    queryKey: ['company-all-time'],
    queryFn: () => intelligence.getCompanySummaryAllTime(),
    enabled: timeRange === 'all_time' && scope === 'company',
  })

  const { data: teamAllTimeData, isLoading: teamAllTimeLoading } = useQuery({
    queryKey: ['team-all-time', teamId],
    queryFn: () => intelligence.getTeamSummaryAllTime(teamId!),
    enabled: timeRange === 'all_time' && scope === 'team' && !!teamId,
  })

  const { data: workerProfileData, isLoading: workerLoading } = useQuery({
    queryKey: ['worker-profile', workerId],
    queryFn: () => intelligence.getWorkerProfile(workerId!),
    enabled: scope === 'worker' && !!workerId,
  })

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams-health', weekOf],
    queryFn: () => intelligence.getTeamsHealth(weekOf),
    enabled: scope === 'company' && timeRange !== 'all_time',
  })

  const regenerateMutation = useMutation({
    mutationFn: () => intelligence.regenerateSummary(weekOf),
    onMutate: () => setIsRegenerating(true),
    onSettled: () => {
      setIsRegenerating(false)
      queryClient.invalidateQueries({ queryKey: ['company-summary'] })
    },
  })

  const companySummary = companySummaryData?.data
  const companyAllTime = companyAllTimeData?.data
  const teamAllTime = teamAllTimeData?.data
  const workerProfile = workerProfileData?.data
  const teams = teamsData?.data || []
  const teamsList = teamsListData?.data || []
  const workersList = workersListData?.data || []
  const availableWeeks = availableWeeksData?.data?.available_weeks || []

  const isLoading =
    (scope === 'company' && timeRange === 'all_time' && companyAllTimeLoading) ||
    (scope === 'company' && timeRange !== 'all_time' && companySummaryLoading) ||
    (scope === 'company' && timeRange !== 'all_time' && teamsLoading) ||
    (scope === 'team' && timeRange === 'all_time' && teamAllTimeLoading) ||
    (scope === 'worker' && workerLoading)

  // Helper to get display name for selected team/worker
  const selectedTeamName = teamsList.find(t => t.id === teamId)?.name || 'Select team...'
  const selectedWorkerName = workersList.find(w => w.id === workerId)?.name || 'Select employee...'

  // Format week for display
  const formatWeekDisplay = (weekStr?: string) => {
    if (!weekStr) return 'This Week'
    return new Date(weekStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const currentWeekDisplay = timeRange === 'all_time'
    ? 'All Time'
    : timeRange === 'specific_week' && weekOf
      ? formatWeekDisplay(weekOf)
      : formatWeekDisplay(companySummary?.week_of)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">CEO Intelligence</h1>
        <p className="text-gray-600">{currentWeekDisplay}</p>
      </div>

      {/* Selector Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Time:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setTimeRange('this_week'); setWeekOf(undefined) }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === 'this_week'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('all_time')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === 'all_time'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All-time
            </button>
            <div className="relative">
              <button
                onClick={() => setShowWeekPicker(!showWeekPicker)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  timeRange === 'specific_week'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {timeRange === 'specific_week' && weekOf ? formatWeekDisplay(weekOf) : 'Browse Week'}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showWeekPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto min-w-[200px]">
                  {availableWeeks.length > 0 ? (
                    availableWeeks.map((week) => (
                      <button
                        key={week}
                        onClick={() => {
                          setTimeRange('specific_week')
                          setWeekOf(week)
                          setShowWeekPicker(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          weekOf === week ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        {formatWeekDisplay(week)}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No historical weeks available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scope Selector */}
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Scope:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setScope('company'); setTeamId(undefined); setWorkerId(undefined) }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                scope === 'company'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Company
            </button>

            {/* Team Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  if (scope !== 'team') {
                    setScope('team')
                    setWorkerId(undefined)
                  }
                  setShowTeamPicker(!showTeamPicker)
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  scope === 'team'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                {scope === 'team' && teamId ? selectedTeamName : 'Team'}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showTeamPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto min-w-[200px]">
                  {teamsList.length > 0 ? (
                    teamsList.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => {
                          setScope('team')
                          setTeamId(team.id)
                          setWorkerId(undefined)
                          setShowTeamPicker(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          teamId === team.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        {team.name}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No teams available</div>
                  )}
                </div>
              )}
            </div>

            {/* Employee Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  if (scope !== 'worker') {
                    setScope('worker')
                    setTeamId(undefined)
                  }
                  setShowWorkerPicker(!showWorkerPicker)
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                  scope === 'worker'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                {scope === 'worker' && workerId ? selectedWorkerName : 'Employee'}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showWorkerPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto min-w-[250px]">
                  {workersList.length > 0 ? (
                    workersList.map((worker) => (
                      <button
                        key={worker.id}
                        onClick={() => {
                          setScope('worker')
                          setWorkerId(worker.id)
                          setTeamId(undefined)
                          setShowWorkerPicker(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                          workerId === worker.id ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{worker.name}</div>
                        <div className="text-xs text-gray-500">{worker.email}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No employees available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showWeekPicker || showTeamPicker || showWorkerPicker) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowWeekPicker(false)
            setShowTeamPicker(false)
            setShowWorkerPicker(false)
          }}
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Company Weekly View */}
      {!isLoading && scope === 'company' && timeRange !== 'all_time' && (
        <CompanyWeeklyView
          summary={companySummary}
          teams={teams}
          isRegenerating={isRegenerating}
          onRegenerate={() => regenerateMutation.mutate()}
        />
      )}

      {/* Company All-Time View */}
      {!isLoading && scope === 'company' && timeRange === 'all_time' && (
        <CompanyAllTimeView summary={companyAllTime} />
      )}

      {/* Team Weekly View */}
      {!isLoading && scope === 'team' && teamId && timeRange !== 'all_time' && (
        <TeamWeeklyView teamId={teamId} weekOf={weekOf} />
      )}

      {/* Team All-Time View */}
      {!isLoading && scope === 'team' && teamId && timeRange === 'all_time' && (
        <TeamAllTimeView summary={teamAllTime} teamId={teamId} teamName={selectedTeamName} />
      )}

      {/* Team Not Selected */}
      {!isLoading && scope === 'team' && !teamId && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Team</h3>
          <p className="text-gray-500">Choose a team from the dropdown above to view their intelligence.</p>
        </div>
      )}

      {/* Worker View */}
      {!isLoading && scope === 'worker' && workerId && (
        <WorkerProfileView profile={workerProfile} />
      )}

      {/* Worker Not Selected */}
      {!isLoading && scope === 'worker' && !workerId && (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Employee</h3>
          <p className="text-gray-500">Choose an employee from the dropdown above to view their profile.</p>
        </div>
      )}
    </div>
  )
}

// Company Weekly View Component
function CompanyWeeklyView({ summary, teams, isRegenerating, onRegenerate }: {
  summary: any
  teams: any[]
  isRegenerating: boolean
  onRegenerate: () => void
}) {
  return (
    <>
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
            onClick={onRegenerate}
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
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Key Highlights
          </h3>
          {summary?.highlights?.length ? (
            <ul className="space-y-3">
              {summary.highlights.map((highlight: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Highlights will appear when submissions are analyzed.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Areas of Concern
          </h3>
          {summary?.concerns?.length ? (
            <ul className="space-y-3">
              {summary.concerns.map((concern: string, i: number) => (
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
            {summary.top_themes.map((theme: string) => (
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
              <Link
                key={team.team_id}
                href={`/dashboard/teams/${team.team_id}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer block"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{team.team_name}</h4>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>

                <div className="space-y-2">
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
              </Link>
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
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([teamName, count]) => (
                <div key={teamName} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{teamName}</span>
                  <span className="text-sm font-medium text-gray-900">{count as number} submissions</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  )
}

// Company All-Time View Component
function CompanyAllTimeView({ summary }: { summary: any }) {
  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Historical Data</h3>
        <p className="text-gray-500">All-time analysis will be available once you have T5T submissions.</p>
      </div>
    )
  }

  return (
    <>
      {/* All-Time Summary Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary-100">
            <Brain className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All-Time Company Summary</h2>
            <p className="text-sm text-gray-500">Aggregated insights across {summary.total_weeks_tracked} weeks</p>
          </div>
        </div>

        {summary.narrative ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{summary.narrative}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">Narrative generation in progress...</p>
        )}

        {/* All-Time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-primary-100">
          <div>
            <p className="text-sm text-gray-500">Weeks Tracked</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_weeks_tracked}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_submissions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unique Submitters</p>
            <p className="text-2xl font-bold text-gray-900">{summary.unique_submitters}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Submission Rate</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPercentage(summary.average_submission_rate)}
            </p>
          </div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      {summary.sentiment_distribution && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${summary.sentiment_distribution.positive}%` }}
                />
                <div
                  className="bg-gray-400 h-full"
                  style={{ width: `${summary.sentiment_distribution.neutral}%` }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${summary.sentiment_distribution.negative}%` }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">{summary.sentiment_distribution.positive}% Positive</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-600">{summary.sentiment_distribution.neutral}% Neutral</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">{summary.sentiment_distribution.negative}% Negative</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Adoption Trend */}
      {summary.ai_adoption_trend && summary.ai_adoption_trend.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary-600" />
            AI Adoption Trend
          </h3>
          <div className="space-y-3">
            {summary.ai_adoption_trend.slice(-8).map((item: { week: string; rate: number }) => (
              <div key={item.week} className="flex items-center gap-4">
                <span className="text-sm text-gray-500 w-28">
                  {new Date(item.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${item.rate * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-12 text-right">
                  {formatPercentage(item.rate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All-Time Top Themes */}
      {summary.all_time_top_themes && summary.all_time_top_themes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Themes Across All Time</h3>
          <div className="space-y-3">
            {summary.all_time_top_themes.slice(0, 10).map((item: { theme: string; count: number }) => (
              <div key={item.theme} className="flex items-center justify-between">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize">
                  {item.theme}
                </span>
                <span className="text-sm text-gray-500">{item.count} mentions</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Team Weekly View Component (uses existing team detail page link)
function TeamWeeklyView({ teamId, weekOf }: { teamId: number; weekOf?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['team-summary', teamId, weekOf],
    queryFn: () => intelligence.getTeamSummary(teamId, weekOf),
  })

  const teamSummary = data?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!teamSummary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">This team has no submissions for the selected week.</p>
      </div>
    )
  }

  return (
    <>
      {/* Team Summary Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary-100">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{teamSummary.team_name}</h2>
            <p className="text-sm text-gray-500">
              {teamSummary.submitted_count} of {teamSummary.total_workers} submitted
            </p>
          </div>
        </div>

        {teamSummary.narrative ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{teamSummary.narrative}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No submissions yet for this period.</p>
        )}

        {/* Team Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-primary-100">
          <div>
            <p className="text-sm text-gray-500">Submission Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatPercentage(teamSummary.submission_rate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">AI Adoption</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPercentage(teamSummary.ai_adoption_rate)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Blockers</p>
            <p className="text-2xl font-bold text-red-600">{teamSummary.blockers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Wins & Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Team Wins
          </h3>
          {teamSummary.wins?.length ? (
            <ul className="space-y-3">
              {teamSummary.wins.map((win: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No wins recorded this period.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Blockers
          </h3>
          {teamSummary.blockers?.length ? (
            <ul className="space-y-3">
              {teamSummary.blockers.map((blocker: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5">!</span>
                  <span>{blocker}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No blockers reported.</p>
          )}
        </div>
      </div>

      {/* Team Themes */}
      {teamSummary.themes && teamSummary.themes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Themes</h3>
          <div className="flex flex-wrap gap-2">
            {teamSummary.themes.map((item: { theme: string; count: number }) => (
              <span
                key={item.theme}
                className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize"
              >
                {item.theme} ({item.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      {teamSummary.members && teamSummary.members.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
          <div className="space-y-2">
            {teamSummary.members.map((member: { worker_id: number; name: string; submitted: boolean }) => (
              <Link
                key={member.worker_id}
                href={`/dashboard/workers/${member.worker_id}`}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="text-sm text-gray-700">{member.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  member.submitted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {member.submitted ? 'Submitted' : 'Pending'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Team All-Time View Component
function TeamAllTimeView({ summary, teamId, teamName }: { summary: any; teamId: number; teamName: string }) {
  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Historical Data</h3>
        <p className="text-gray-500">All-time analysis will be available once the team has T5T submissions.</p>
      </div>
    )
  }

  return (
    <>
      {/* Team All-Time Summary Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary-100">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{teamName} - All-Time Summary</h2>
            <p className="text-sm text-gray-500">Aggregated insights across {summary.total_weeks_tracked} weeks</p>
          </div>
        </div>

        {summary.narrative ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{summary.narrative}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">Narrative generation in progress...</p>
        )}

        {/* All-Time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-primary-100">
          <div>
            <p className="text-sm text-gray-500">Weeks Tracked</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_weeks_tracked}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_submissions}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unique Submitters</p>
            <p className="text-2xl font-bold text-gray-900">{summary.unique_submitters}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Submission Rate</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatPercentage(summary.average_submission_rate)}
            </p>
          </div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      {summary.sentiment_distribution && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Sentiment Distribution</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${summary.sentiment_distribution.positive}%` }}
                />
                <div
                  className="bg-gray-400 h-full"
                  style={{ width: `${summary.sentiment_distribution.neutral}%` }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${summary.sentiment_distribution.negative}%` }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">{summary.sentiment_distribution.positive}% Positive</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-600">{summary.sentiment_distribution.neutral}% Neutral</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">{summary.sentiment_distribution.negative}% Negative</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All-Time Top Themes */}
      {summary.all_time_top_themes && summary.all_time_top_themes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Themes for {teamName}</h3>
          <div className="space-y-3">
            {summary.all_time_top_themes.slice(0, 10).map((item: { theme: string; count: number }) => (
              <div key={item.theme} className="flex items-center justify-between">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize">
                  {item.theme}
                </span>
                <span className="text-sm text-gray-500">{item.count} mentions</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// Worker Profile View Component
function WorkerProfileView({ profile }: { profile: any }) {
  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Data</h3>
        <p className="text-gray-500">This employee has no T5T submissions yet.</p>
      </div>
    )
  }

  return (
    <>
      {/* Worker Profile Hero */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary-100">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
            {profile.team_name && (
              <p className="text-xs text-gray-400">{profile.team_name}</p>
            )}
          </div>
        </div>

        {profile.ai_summary ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{profile.ai_summary}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No submissions yet to generate a profile.</p>
        )}

        {/* Profile Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-primary-100">
          <div>
            <p className="text-sm text-gray-500">Total Submissions</p>
            <p className="text-2xl font-bold text-gray-900">{profile.submission_count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Streak</p>
            <p className="text-2xl font-bold text-primary-600">{profile.submission_streak} weeks</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">AI Tools Used</p>
            <p className="text-2xl font-bold text-gray-900">{profile.ai_tools_used?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Sentiment Trend</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">{profile.sentiment_trend || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Primary Themes */}
      {profile.primary_themes && profile.primary_themes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Focus Areas</h3>
          <div className="flex flex-wrap gap-2">
            {profile.primary_themes.map((theme: string) => (
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

      {/* AI Tools & Recent Wins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {profile.ai_tools_used && profile.ai_tools_used.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary-600" />
              AI Tools Used
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.ai_tools_used.map((tool: string) => (
                <span
                  key={tool}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.recent_wins && profile.recent_wins.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Recent Wins
            </h3>
            <ul className="space-y-3">
              {profile.recent_wins.map((win: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Submission History */}
      {profile.submission_history && profile.submission_history.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission History</h3>
          <div className="space-y-3">
            {profile.submission_history.slice(0, 12).map((entry: { week_of: string; submitted: boolean; themes: string[] }) => (
              <div key={entry.week_of} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${entry.submitted ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm text-gray-700">
                    {new Date(entry.week_of).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                {entry.themes && entry.themes.length > 0 && (
                  <div className="flex gap-1">
                    {entry.themes.slice(0, 3).map((theme: string) => (
                      <span key={theme} className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs capitalize">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
