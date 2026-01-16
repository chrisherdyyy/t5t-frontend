'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Circle, User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrgChartNode } from '@/types'

interface OrgChartProps {
  nodes: OrgChartNode[]
  onNodeClick?: (node: OrgChartNode) => void
}

// ChartHop-style horizontal org chart
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
    <div className="overflow-x-auto pb-8">
      <div className="inline-flex flex-col items-center min-w-full pt-4">
        {nodes.map((node, index) => (
          <div key={node.id} className={index > 0 ? 'mt-8' : ''}>
            <ChartNode node={node} onNodeClick={onNodeClick} isRoot />
          </div>
        ))}
      </div>
    </div>
  )
}

interface ChartNodeProps {
  node: OrgChartNode
  onNodeClick?: (node: OrgChartNode) => void
  isRoot?: boolean
}

function ChartNode({ node, onNodeClick, isRoot }: ChartNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const roleConfig = {
    admin: { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', ring: 'ring-purple-200' },
    manager: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', ring: 'ring-blue-200' },
    worker: { bg: 'bg-gradient-to-br from-gray-400 to-gray-500', ring: 'ring-gray-200' },
  }

  const config = roleConfig[node.role] || roleConfig.worker

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => onNodeClick?.(node)}
        className={cn(
          'relative group cursor-pointer transition-all duration-200',
          'hover:scale-105 hover:z-10'
        )}
      >
        <div
          className={cn(
            'w-48 bg-white rounded-xl shadow-md border-2 overflow-hidden',
            'hover:shadow-xl transition-shadow',
            node.has_submitted_this_week ? 'border-green-400' : 'border-gray-200'
          )}
        >
          {/* Status bar at top */}
          <div className={cn(
            'h-1',
            node.has_submitted_this_week ? 'bg-green-400' : 'bg-gray-200'
          )} />

          <div className="p-4">
            {/* Avatar */}
            <div className="flex justify-center mb-3">
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-semibold',
                'ring-4 ring-offset-2',
                config.bg,
                config.ring
              )}>
                {getInitials(node.name)}
              </div>
            </div>

            {/* Name & Job Title */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 truncate" title={node.name}>
                {node.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate" title={node.job_title || node.role}>
                {node.job_title || node.role}
              </p>
              {node.team_name && (
                <p className="text-xs text-gray-400 mt-1 truncate" title={node.team_name}>
                  {node.team_name}
                </p>
              )}
            </div>

            {/* Submission status */}
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs">
              {node.has_submitted_this_week ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-600">Submitted</span>
                </>
              ) : (
                <>
                  <Circle className="w-3.5 h-3.5 text-gray-300" />
                  <span className="text-gray-400">Pending</span>
                </>
              )}
            </div>
          </div>

          {/* Direct reports count */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className={cn(
                'w-full py-2 text-xs font-medium border-t flex items-center justify-center gap-1',
                'hover:bg-gray-50 transition-colors',
                isExpanded ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-gray-500 bg-gray-50 border-gray-100'
              )}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              {node.children.length} {node.children.length === 1 ? 'report' : 'reports'}
            </button>
          )}
        </div>
      </div>

      {/* Connector lines and children */}
      {hasChildren && isExpanded && (
        <>
          {/* Vertical line down from parent */}
          <div className="w-0.5 h-6 bg-gray-300" />

          {/* Horizontal connector bar */}
          {node.children.length > 1 && (
            <div
              className="h-0.5 bg-gray-300"
              style={{
                width: `${(node.children.length - 1) * 208}px`,
              }}
            />
          )}

          {/* Children nodes */}
          <div className="flex gap-4">
            {node.children.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical line to child */}
                <div className="w-0.5 h-6 bg-gray-300" />
                <ChartNode node={child} onNodeClick={onNodeClick} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// List view alternative for very large orgs
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
    <div className="space-y-1">
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
  const [isExpanded, setIsExpanded] = useState(level < 2)
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
