'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workers, teams } from '@/lib/api'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { Worker, Team } from '@/types'

export default function WorkersPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)

  const { data: workersData, isLoading } = useQuery({
    queryKey: ['workers'],
    queryFn: () => workers.list({ is_active: undefined }),
  })

  const { data: teamsData } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teams.list(),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const allWorkers = workersData?.data || []
  const allTeams = teamsData?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
          <p className="text-gray-600">Manage team members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Worker
        </button>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
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
            {allWorkers.map((worker) => {
              const team = allTeams.find((t) => t.id === worker.team_id)
              const manager = allWorkers.find((w) => w.id === worker.manager_id)

              return (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                        {worker.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{worker.name}</p>
                        {manager && (
                          <p className="text-xs text-gray-500">
                            Reports to: {manager.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {worker.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {team?.name || '-'}
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
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(worker.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {allWorkers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No workers yet. Click &quot;Add Worker&quot; to get started.
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

function WorkerModal({
  worker,
  workers: allWorkers,
  teams,
  onClose,
  onSubmit,
  isLoading,
}: {
  worker: Worker | null
  workers: Worker[]
  teams: Team[]
  onClose: () => void
  onSubmit: (data: Partial<Worker> & { email?: string; name?: string }) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    name: worker?.name || '',
    email: worker?.email || '',
    team_id: worker?.team_id?.toString() || '',
    manager_id: worker?.manager_id?.toString() || '',
    role: worker?.role || 'worker',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      email: formData.email,
      team_id: formData.team_id ? parseInt(formData.team_id) : undefined,
      manager_id: formData.manager_id ? parseInt(formData.manager_id) : undefined,
      role: formData.role as 'admin' | 'manager' | 'worker',
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {worker ? 'Edit Worker' : 'Add Worker'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              value={formData.team_id}
              onChange={(e) =>
                setFormData({ ...formData, team_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">No team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager
            </label>
            <select
              value={formData.manager_id}
              onChange={(e) =>
                setFormData({ ...formData, manager_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">No manager</option>
              {allWorkers
                .filter((w) => w.id !== worker?.id)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="worker">Worker</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : worker ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
