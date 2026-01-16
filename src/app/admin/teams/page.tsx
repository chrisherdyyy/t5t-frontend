'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teams } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react'
import type { Team } from '@/types'

export default function TeamsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  const { data: teamsData, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teams.list(),
  })

  const createMutation = useMutation({
    mutationFn: teams.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setIsModalOpen(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Team> }) =>
      teams.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      setIsModalOpen(false)
      setEditingTeam(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: teams.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })

  const handleEdit = (team: Team) => {
    setEditingTeam(team)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch (error: unknown) {
        const err = error as { response?: { data?: { detail?: string } } }
        alert(err.response?.data?.detail || 'Failed to delete team')
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTeam(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const allTeams = teamsData?.data || []

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage organizational teams</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTeams.map((team) => {
          const parentTeam = allTeams.find((t) => t.id === team.parent_team_id)

          return (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {team.name}
              </h3>

              {parentTeam && (
                <p className="text-sm text-gray-500">
                  Part of: {parentTeam.name}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {allTeams.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          No teams yet. Click &quot;Add Team&quot; to get started.
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <TeamModal
          team={editingTeam}
          teams={allTeams}
          onClose={handleCloseModal}
          onSubmit={(data) => {
            if (editingTeam) {
              updateMutation.mutate({ id: editingTeam.id, data })
            } else {
              createMutation.mutate(data as Parameters<typeof teams.create>[0])
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  )
}

function TeamModal({
  team,
  teams: allTeams,
  onClose,
  onSubmit,
  isLoading,
}: {
  team: Team | null
  teams: Team[]
  onClose: () => void
  onSubmit: (data: { name: string; parent_team_id?: number }) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    parent_team_id: team?.parent_team_id?.toString() || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: formData.name,
      parent_team_id: formData.parent_team_id
        ? parseInt(formData.parent_team_id)
        : undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {team ? 'Edit Team' : 'Add Team'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Engineering, Marketing, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Team (optional)
            </label>
            <select
              value={formData.parent_team_id}
              onChange={(e) =>
                setFormData({ ...formData, parent_team_id: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">No parent team</option>
              {allTeams
                .filter((t) => t.id !== team?.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
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
              {isLoading ? 'Saving...' : team ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
