'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { intelligence } from '@/lib/api'
import {
  ArrowLeft,
  Brain,
  Calendar,
  Bot,
  TrendingUp,
  TrendingDown,
  Minus,
  Tag,
  Trophy,
  Mail,
  Building2,
} from 'lucide-react'

export default function WorkerProfilePage() {
  const params = useParams()
  const workerId = Number(params.id)

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['worker-profile', workerId],
    queryFn: () => intelligence.getWorkerProfile(workerId),
    enabled: !!workerId,
  })

  const profile = profileData?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Worker profile not found or no data available.</p>
        <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    )
  }

  const getSentimentIcon = () => {
    switch (profile.sentiment_trend.toLowerCase()) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-gray-400" />
    }
  }

  const getSentimentColor = () => {
    switch (profile.sentiment_trend.toLowerCase()) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {profile.email}
              </span>
              {profile.team_name && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {profile.team_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Profile Summary - Hero Card */}
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl shadow-sm border border-primary-100 p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-primary-100">
            <Brain className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AI Profile Summary</h2>
            <p className="text-sm text-gray-500">Longitudinal analysis from T5T submissions</p>
          </div>
        </div>

        {profile.ai_summary ? (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">{profile.ai_summary}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Not enough data to generate a profile summary. Continue submitting T5T reports to see insights.
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Submissions</p>
              <p className="text-xl font-bold text-gray-900">{profile.submission_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Streak</p>
              <p className="text-xl font-bold text-gray-900">{profile.submission_streak} weeks</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">AI Tools Used</p>
              <p className="text-xl font-bold text-gray-900">{profile.ai_tools_used.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              profile.sentiment_trend.toLowerCase() === 'positive'
                ? 'bg-green-50'
                : profile.sentiment_trend.toLowerCase() === 'negative'
                ? 'bg-red-50'
                : 'bg-gray-50'
            }`}>
              {getSentimentIcon()}
            </div>
            <div>
              <p className="text-xs text-gray-500">Sentiment Trend</p>
              <p className={`text-xl font-bold capitalize ${getSentimentColor()}`}>
                {profile.sentiment_trend}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Themes & AI Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Primary Themes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-gray-400" />
            Primary Themes
          </h3>
          {profile.primary_themes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.primary_themes.map((theme) => (
                <span
                  key={theme}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize"
                >
                  {theme}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No themes identified yet.</p>
          )}
        </div>

        {/* AI Tools Used */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-gray-400" />
            AI Tools Used
          </h3>
          {profile.ai_tools_used.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.ai_tools_used.map((tool) => (
                <span
                  key={tool}
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                >
                  {tool}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No AI tools reported yet.</p>
          )}
        </div>
      </div>

      {/* Recent Wins */}
      {profile.recent_wins.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Recent Wins
          </h3>
          <ul className="space-y-2">
            {profile.recent_wins.map((win, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-500 mt-1">&#x2022;</span>
                <span>{win}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submission History */}
      {profile.submission_history.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Recent Submissions
          </h3>
          <div className="space-y-3">
            {profile.submission_history.slice(0, 8).map((submission, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Week of {new Date(submission.week_of).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {submission.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {submission.themes.slice(0, 3).map((theme) => (
                        <span
                          key={theme}
                          className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs capitalize"
                        >
                          {theme}
                        </span>
                      ))}
                      {submission.themes.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{submission.themes.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  submission.submitted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {submission.submitted ? 'Submitted' : 'Missed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
