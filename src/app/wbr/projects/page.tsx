'use client'

import { useQuery } from '@tanstack/react-query'
import { projects } from '@/lib/wbr-api'
import {
  FolderKanban,
  ChevronRight,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { WBRProjectStatus } from '@/types/wbr'

function getStatusColor(status: WBRProjectStatus | null): string {
  switch (status) {
    case 'green':
      return 'bg-green-100 text-green-700'
    case 'yellow':
      return 'bg-yellow-100 text-yellow-700'
    case 'red':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getStatusDot(status: WBRProjectStatus | null): string {
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

export default function WBRProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<WBRProjectStatus | 'all'>('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['wbr-projects', statusFilter],
    queryFn: () => projects.list(
      statusFilter !== 'all' ? { status: statusFilter } : undefined
    ),
  })

  const projectsList = data?.data || []

  // Get latest update for each project
  const projectsWithLatest = projectsList.map((project) => {
    const updates = (project as any).updates || []
    const latest = updates.length > 0
      ? updates.reduce((a: any, b: any) => new Date(a.week_of) > new Date(b.week_of) ? a : b)
      : null
    return { ...project, latest_update: latest }
  })

  // Group by status
  const greenProjects = projectsWithLatest.filter(p => p.latest_update?.status === 'green')
  const yellowProjects = projectsWithLatest.filter(p => p.latest_update?.status === 'yellow')
  const redProjects = projectsWithLatest.filter(p => p.latest_update?.status === 'red')
  const noStatusProjects = projectsWithLatest.filter(p => !p.latest_update?.status)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">WBR Projects</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">WBR Projects</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700">Failed to load projects</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WBR Projects</h1>
          <p className="text-sm text-gray-500">{projectsList.length} total projects</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['all', 'green', 'yellow', 'red'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? status === 'all'
                  ? 'bg-gray-800 text-white'
                  : status === 'green'
                  ? 'bg-green-600 text-white'
                  : status === 'yellow'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Projects by Status */}
      {statusFilter === 'all' ? (
        <div className="space-y-6">
          {/* Red Projects */}
          {redProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Behind ({redProjects.length})
              </h2>
              <div className="space-y-2">
                {redProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* Yellow Projects */}
          {yellowProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                At Risk ({yellowProjects.length})
              </h2>
              <div className="space-y-2">
                {yellowProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* Green Projects */}
          {greenProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                On Track ({greenProjects.length})
              </h2>
              <div className="space-y-2">
                {greenProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}

          {/* No Status Projects */}
          {noStatusProjects.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                No Status ({noStatusProjects.length})
              </h2>
              <div className="space-y-2">
                {noStatusProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {projectsWithLatest.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
          {projectsWithLatest.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No projects with this status
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }: { project: any }) {
  const latest = project.latest_update

  return (
    <Link
      href={`/wbr/projects/${project.id}`}
      className="block bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className={`w-3 h-3 mt-1.5 rounded-full ${getStatusDot(latest?.status)}`} />
          <div>
            <h3 className="font-medium text-gray-900">{project.name}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {project.owner && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {project.owner.name}
                </span>
              )}
              {project.estimated_completion && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(project.estimated_completion).toLocaleDateString()}
                </span>
              )}
              {latest?.completion_pct !== null && latest?.completion_pct !== undefined && (
                <span>{latest.completion_pct}% complete</span>
              )}
            </div>
            {latest?.blockers && (
              <p className="text-sm text-red-600 mt-2 line-clamp-1">
                Blocker: {latest.blockers}
              </p>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
      </div>
    </Link>
  )
}
