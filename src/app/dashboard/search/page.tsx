'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, AlertCircle, Calendar, Users, X } from 'lucide-react'
import { search, teams } from '@/lib/api'
import type { SearchResultItem, Team } from '@/types'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [selectedTeams, setSelectedTeams] = useState<number[]>([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [onlyBlockers, setOnlyBlockers] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch teams for filter
  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teams.list(),
  })
  const teamsList = teamsData?.data || []

  // Search query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['search', query, selectedTeams, dateFrom, dateTo, onlyBlockers],
    queryFn: () =>
      search.query(query, {
        teams: selectedTeams.length > 0 ? selectedTeams : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        has_blockers: onlyBlockers || undefined,
        limit: 100,
      }),
    enabled: query.length >= 2,
  })

  const results = data?.data?.results || []
  const totalResults = data?.data?.total_results || 0

  // Update URL when query changes
  useEffect(() => {
    if (query.length >= 2) {
      const params = new URLSearchParams()
      params.set('q', query)
      router.replace(`/dashboard/search?${params.toString()}`, { scroll: false })
    }
  }, [query, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length >= 2) {
      refetch()
    }
  }

  const clearFilters = () => {
    setSelectedTeams([])
    setDateFrom('')
    setDateTo('')
    setOnlyBlockers(false)
  }

  const hasActiveFilters = selectedTeams.length > 0 || dateFrom || dateTo || onlyBlockers

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const highlightQuery = (text: string) => {
    if (!query) return text
    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search T5Ts</h1>
        <p className="text-gray-600 mt-1">
          Search across all T5T submissions by content, themes, or keywords
        </p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for keywords, themes, or topics..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                hasActiveFilters
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {[selectedTeams.length > 0, dateFrom, dateTo, onlyBlockers].filter(Boolean).length}
                </span>
              )}
            </button>
            <button
              type="submit"
              disabled={query.length < 2}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Search
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Team filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-4 h-4 inline mr-1" />
                    Teams
                  </label>
                  <select
                    multiple
                    value={selectedTeams.map(String)}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, (option) =>
                        Number(option.value)
                      )
                      setSelectedTeams(values)
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {teamsList.map((team: Team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date from */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    From
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Date to */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    To
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Blockers only */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyBlockers}
                      onChange={(e) => setOnlyBlockers(e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                      <AlertCircle className="w-4 h-4 inline mr-1 text-red-500" />
                      Blockers only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {query.length >= 2 && (
        <div className="space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {isLoading ? (
                'Searching...'
              ) : (
                <>
                  Found <span className="font-medium">{totalResults}</span> results
                  {query && (
                    <>
                      {' '}
                      for "<span className="font-medium">{query}</span>"
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Results list */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
              <p className="mt-4 text-gray-500">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result: SearchResultItem) => (
                <div
                  key={result.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/reports?id=${result.report_id}`)}
                >
                  <div className="flex items-start gap-4">
                    {result.is_blocker && (
                      <div className="flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900">{highlightQuery(result.content)}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
                        <span className="font-medium text-gray-700">
                          {result.worker_name}
                        </span>
                        {result.team_name && (
                          <>
                            <span>·</span>
                            <span>{result.team_name}</span>
                          </>
                        )}
                        <span>·</span>
                        <span>{formatDate(result.week_of)}</span>
                        {result.sentiment && (
                          <>
                            <span>·</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                result.sentiment === 'positive'
                                  ? 'bg-green-100 text-green-700'
                                  : result.sentiment === 'negative'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {result.sentiment}
                            </span>
                          </>
                        )}
                      </div>
                      {result.themes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {result.themes.map((theme) => (
                            <span
                              key={theme}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                            >
                              {theme}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no query */}
      {query.length < 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-200 mx-auto" />
          <h3 className="mt-6 text-xl font-medium text-gray-900">Search T5T Content</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Enter at least 2 characters to search across all T5T submissions.
            Find specific topics, blockers, or keywords.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {['VPN', 'integrations', 'hiring', 'AI', 'customer'].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search T5Ts</h1>
        <p className="text-gray-600 mt-1">Loading...</p>
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  )
}
