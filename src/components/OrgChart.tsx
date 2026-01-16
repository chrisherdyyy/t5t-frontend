'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Circle, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrgChartNode } from '@/types'

interface OrgChartProps {
  nodes: OrgChartNode[]
  onNodeClick?: (node: OrgChartNode) => void
}

// Visual org chart - starts collapsed for better UX with large orgs
export function OrgChart({ nodes, onNodeClick }: OrgChartProps) {
  if (!nodes.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No org chart data available.</p>
        <p className="text-sm mt-1">Add workers with manager relationships to build the chart.</p>
      </div>
    )
  }

  return (
    <div className="overflow-auto">
      <div className="inline-block min-w-full">
        {/* Render root nodes in a row if multiple */}
        <div className="flex flex-wrap gap-8 justify-center py-4">
          {nodes.map((node) => (
            <ChartNode key={node.id} node={node} onNodeClick={onNodeClick} level={0} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface ChartNodeProps {
  node: OrgChartNode
  onNodeClick?: (node: OrgChartNode) => void
  level: number
}

function ChartNode({ node, onNodeClick, level }: ChartNodeProps) {
  // Only expand first 2 levels by default
  const [isExpanded, setIsExpanded] = useState(level < 1)
  const hasChildren = node.children && node.children.length > 0

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const roleColors = {
    admin: 'bg-purple-500',
    manager: 'bg-blue-500',
    worker: 'bg-gray-400',
  }

  return (
    <div className="flex flex-col items-center">
      {/* Node Card - Compact design */}
      <div
        onClick={() => onNodeClick?.(node)}
        className="cursor-pointer group"
      >
        <div
          className={cn(
            'w-40 bg-white rounded-lg shadow-sm border overflow-hidden transition-all',
            'hover:shadow-md hover:border-blue-300',
            node.has_submitted_this_week ? 'border-green-300' : 'border-gray-200'
          )}
        >
          {/* Compact content */}
          <div className="p-3">
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0',
                roleColors[node.role] || roleColors.worker
              )}>
                {getInitials(node.name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate" title={node.name}>
                  {node.name}
                </h3>
                <p className="text-xs text-gray-500 truncate" title={node.job_title || ''}>
                  {node.job_title || node.role}
                </p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs">
                {node.has_submitted_this_week ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-green-600">Done</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3 h-3 text-gray-300" />
                    <span className="text-gray-400">Pending</span>
                  </>
                )}
              </div>

              {/* Expand button */}
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className={cn(
                    'flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded',
                    'hover:bg-gray-100 transition-colors',
                    isExpanded ? 'text-blue-600' : 'text-gray-500'
                  )}
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {node.children.length}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center">
          {/* Vertical connector */}
          <div className="w-px h-4 bg-gray-300" />

          {/* Horizontal bar for multiple children */}
          {node.children.length > 1 && (
            <div
              className="h-px bg-gray-300"
              style={{ width: `${Math.min(node.children.length - 1, 4) * 176 + 40}px` }}
            />
          )}

          {/* Children row */}
          <div className="flex gap-4">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300" />
                <ChartNode node={child} onNodeClick={onNodeClick} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// List view - better for large orgs
export function OrgChartList({ nodes, onNodeClick }: OrgChartProps) {
  if (!nodes.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No org chart data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <ListNode key={node.id} node={node} onNodeClick={onNodeClick} level={0} />
      ))}
    </div>
  )
}

function ListNode({
  node,
  onNodeClick,
  level
}: {
  node: OrgChartNode
  onNodeClick?: (node: OrgChartNode) => void
  level: number
}) {
  const [isExpanded, setIsExpanded] = useState(level < 3)
  const hasChildren = node.children && node.children.length > 0

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div>
      <div
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        className={cn(
          'flex items-center gap-3 py-2 pr-4 rounded-lg cursor-pointer transition-colors',
          'hover:bg-gray-50'
        )}
        onClick={() => onNodeClick?.(node)}
      >
        {/* Expand button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Status */}
        {node.has_submitted_this_week ? (
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
        ) : (
          <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
        )}

        {/* Avatar */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0',
          node.role === 'admin' ? 'bg-purple-500' : node.role === 'manager' ? 'bg-blue-500' : 'bg-gray-400'
        )}>
          {getInitials(node.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{node.name}</span>
            {node.team_name && (
              <span className="text-gray-400 text-sm">· {node.team_name}</span>
            )}
          </div>
          {node.job_title && (
            <p className="text-xs text-gray-500 truncate">{node.job_title}</p>
          )}
        </div>

        {/* Reports count */}
        {hasChildren && (
          <span className="text-xs text-gray-400">
            {node.children.length} {node.children.length === 1 ? 'report' : 'reports'}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <ListNode
              key={child.id}
              node={child}
              onNodeClick={onNodeClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Export both for page to choose
export { OrgChartList as OrgChartTree }
