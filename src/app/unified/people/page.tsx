'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { unified } from '@/lib/wbr-api'
import {
  Users,
  Search,
  AlertCircle,
  Loader2,
  FileText,
  Target,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function UnifiedPeoplePage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'both' | 't5t' | 'wbr'>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['unified-people'],
    queryFn: () => unified.getPeople(),
  })

  const peopleData = data?.data
  const people = peopleData?.people || []

  // Filter people
  const filteredPeople = people.filter((person) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      if (
        !person.name.toLowerCase().includes(searchLower) &&
        !person.email.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // System filter
    if (filter === 'both' && !person.in_both_systems) return false
    if (filter === 't5t' && !person.t5t_worker_id) return false
    if (filter === 'wbr' && !person.wbr_participant_id) return false

    return true
  })

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-900">People Directory</h1>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold text-gray-900">People Directory</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Failed to load people directory</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People Directory</h1>
          <p className="text-sm text-gray-500">
            {peopleData?.total || 0} people across T5T and WBR
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{peopleData?.total || 0}</p>
          <p className="text-xs text-gray-500">Total People</p>
        </div>
        <div className="bg-purple-50 rounded-lg border border-purple-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{peopleData?.in_both_systems || 0}</p>
          <p className="text-xs text-purple-600">In Both Systems</p>
        </div>
        <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">{peopleData?.t5t_only || 0}</p>
          <p className="text-xs text-indigo-600">T5T Only</p>
        </div>
        <div className="bg-amber-50 rounded-lg border border-amber-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-700">{peopleData?.wbr_only || 0}</p>
          <p className="text-xs text-amber-600">WBR Only</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'both', 't5t', 'wbr'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'both' ? 'Both Systems' : f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* People List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                T5T
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                WBR
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPeople.map((person) => (
              <tr key={person.email} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      person.in_both_systems ? 'bg-purple-500' :
                      person.t5t_worker_id ? 'bg-indigo-500' :
                      'bg-amber-500'
                    }`}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{person.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {person.t5t_worker_id ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                      <FileText className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {person.wbr_participant_id ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                      <Target className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Link
                    href={`/unified/people/${encodeURIComponent(person.email)}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
            {filteredPeople.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No people found</p>
                  {search && <p className="text-sm">Try adjusting your search</p>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
