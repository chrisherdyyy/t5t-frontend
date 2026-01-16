'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { intelligence } from '@/lib/api'
import { formatPercentage } from '@/lib/utils'
import {
  ArrowLeft,
  Brain,
  Users,
  Bot,
  AlertCircle,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'

export default function TeamDetailPage() {
  const params = useParams()
  const teamId = Number(params.id)

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['team-summary', teamId],
    queryFn: () => intelligence.getTeamSummary(teamId),
    enabled: !!teamId,
  })

  const team = summaryData?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Team not found or no data available.</p>
        <Link href="/dashboard/analytics" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          &larr; Back to Analytics
        </Link>
      </div>
    )
  }

  const weekOf = new Date(team.week_of).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/analytics"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analytics
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{team.team_name}</h1>
        <p className="text-gray-600">Week of {weekOf}</p>
      </div>

      {/* AI Team Summary - Hero Card */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary-100">
            <Brain className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Team Summary</h2>
            <p className="text-sm text-gray-500">Generated from {team.submitted_count} T5T submissions</p>
          </div>
        </div>

        {team.narrative ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{team.narrative}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            No submissions yet this week. The team summary will appear once T5T reports are received.
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Submission Rate"
          value={formatPercentage(team.submission_rate)}
          subtext={`${team.submitted_count} of ${team.total_workers}`}
          color="blue"
        />
        <StatCard
          icon={Bot}
          label="AI Adoption"
          value={formatPercentage(team.ai_adoption_rate)}
          subtext="using AI tools"
          color="purple"
        />
        <StatCard
          icon={AlertCircle}
          label="Blockers"
          value={team.blockers.length.toString()}
          subtext="identified issues"
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="Wins"
          value={team.wins.length.toString()}
          subtext="achievements"
          color="green"
        />
      </div>

      {/* Team Members Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          Team Members
        </h3>
        {team.members.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {team.members.map((member) => (
              <Link
                key={member.worker_id}
                href={`/dashboard/workers/${member.worker_id}`}
                className={`p-3 rounded-lg text-center transition-colors ${
                  member.submitted
                    ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                  {member.submitted ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No team members found.</p>
        )}
      </div>

      {/* Themes */}
      {team.themes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Themes This Week</h3>
          <div className="flex flex-wrap gap-2">
            {team.themes.map((theme) => (
              <span
                key={theme.theme}
                className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize"
              >
                {theme.theme} ({theme.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Wins & Blockers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Wins This Week
          </h3>
          {team.wins.length > 0 ? (
            <ul className="space-y-2">
              {team.wins.map((win, i) => (
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Blockers & Concerns
          </h3>
          {team.blockers.length > 0 ? (
            <ul className="space-y-2">
              {team.blockers.map((blocker, i) => (
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
  color: 'blue' | 'purple' | 'red' | 'green'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{subtext}</p>
        </div>
      </div>
    </div>
  )
}
