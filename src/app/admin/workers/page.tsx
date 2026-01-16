'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workers, teams, reports } from '@/lib/api'
import { Plus, Pencil, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { WorkerModal } from '@/components/WorkerModal'
import type { Worker, Team, UserRole } from '@/types'

type SortField = 'name' | 'email' | 'role' | 'manager' | 'reports'
type SortDirection = 'asc' | 'desc'

export default function WorkersPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const { data: workersData, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: () => workers.list(),
  })

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teams.list(),
  })

  const { data: reportsData } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reports.list(),
  })

  const createMutation = useMutation({
    mutationFn: workers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Worker> }) =>
      workers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
      queryClient.invalidateQueries({ queryKey: ['org-chart'] })
      setIsModalOpen(false)
      setEditingWorker(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: workers.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] })
    },
  })

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to deactivate this worker?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingWorker(null)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const allWorkers = workersData?.data || []
  const allTeams = teamsData?.data || []
  const allReports = reportsData?.data || []

  // Calculate report counts per worker
  const reportCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    allReports.forEach((report) => {
      counts[report.worker_id] = (counts[report.worker_id] || 0) + 1
    })
    return counts
  }, [allReports])

  // Filter and sort workers
  const filteredWorkers = useMemo(() => {
    let filtered = allWorkers.filter((worker) => {
      const searchLower = searchQuery.toLowerCase()
      const manager = allWorkers.find((w) => w.id === worker.manager_id)
      return (
        worker.name.toLowerCase().includes(searchLower) ||
        worker.email.toLowerCase().includes(searchLower) ||
        worker.role.toLowerCase().includes(searchLower) ||
        (manager?.name.toLowerCase().includes(searchLower))
      )
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'email':
          aVal = a.email.toLowerCase()
          bVal = b.email.toLowerCase()
          break
        case 'role':
          aVal = a.role
          bVal = b.role
          break
        case 'manager':
          const aManager = allWorkers.find((w) => w.id === a.manager_id)
          const bManager = allWorkers.find((w) => w.id === b.manager_id)
          aVal = aManager?.name.toLowerCase() || 'zzz'
          bVal = bManager?.name.toLowerCase() || 'zzz'
          break
        case 'reports':
          aVal = reportCounts[a.id] || 0
          bVal = reportCounts[b.id] || 0
          break
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [allWorkers, searchQuery, sortField, sortDirection, reportCounts])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-600">{allWorkers.length} team members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Worker
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, role, or manager..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Name
                    <SortIcon field="name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Email
                    <SortIcon field="email" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('role')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Role
                    <SortIcon field="role" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('manager')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Manager
                    <SortIcon field="manager" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reports')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Reports
                    <SortIcon field="reports" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredWorkers.map((worker) => {
                const team = allTeams.find((t) => t.id === worker.team_id)
                const manager = allWorkers.find((w) => w.id === worker.manager_id)
                const reportsCount = reportCounts[worker.id] || 0

                return (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          worker.role === 'admin' ? 'bg-purple-500' :
                          worker.role === 'manager' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}>
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{worker.name}</p>
                          {team && (
                            <p className="text-xs text-gray-500">{team.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {worker.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          worker.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : worker.role === 'manager'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {worker.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {manager?.name || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${reportsCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {reportsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          worker.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {worker.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(worker)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-1"
                        title="Edit worker"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(worker.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate worker"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredWorkers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'No workers match your search.' : 'No workers yet. Click "Add Worker" to get started.'}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <WorkerModal
          worker={editingWorker}
          workers={allWorkers}
          teams={allTeams}
          onClose={handleCloseModal}
          onSubmit={(data) => {
            if (editingWorker) {
              updateMutation.mutate({ id: editingWorker.id, data })
            } else {
              createMutation.mutate(data as Parameters<typeof workers.create>[0])
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  )
}
