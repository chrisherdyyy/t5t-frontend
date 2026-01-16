'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, XCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrgChartNode } from '@/types'

interface OrgChartProps {
  nodes: OrgChartNode[]
  onNodeClick?: (node: OrgChartNode) => void
}

export function OrgChart({ nodes, onNodeClick }: OrgChartProps) {
  if (!nodes.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No org chart data available.</p>
        <p className="text-sm mt-1">Add workers with manager relationships to build the chart.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <OrgChartNodeComponent
          key={node.id}
          node={node}
          onNodeClick={onNodeClick}
          level={0}
        />
      ))}
    </div>
  )
}

interface OrgChartNodeProps {
  node: OrgChartNode
  onNodeClick?: (node: OrgChartNode) => void
  level: number
}

function OrgChartNodeComponent({ node, onNodeClick, level }: OrgChartNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasChildren = node.children && node.children.length > 0

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleClick = () => {
    if (onNodeClick) {
      onNodeClick(node)
    }
  }

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    manager: 'bg-blue-100 text-blue-700 border-blue-200',
    worker: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <div style={{ marginLeft: level > 0 ? '24px' : '0' }}>
      <div
        onClick={handleClick}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
          'hover:shadow-md hover:border-primary-300',
          node.has_submitted_this_week
            ? 'bg-white border-green-200'
            : 'bg-gray-50 border-gray-200'
        )}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-6" /> // Spacer
        )}

        {/* Submission status indicator */}
        <div className="flex-shrink-0">
          {node.has_submitted_this_week ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-gray-300" />
          )}
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold flex-shrink-0">
          {node.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 truncate">{node.name}</p>
            <span className={cn('text-xs px-2 py-0.5 rounded-full border', roleColors[node.role])}>
              {node.role}
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">{node.email}</p>
          {node.team_name && (
            <p className="text-xs text-gray-400">{node.team_name}</p>
          )}
        </div>

        {/* Children count */}
        {hasChildren && (
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
            {node.children.length} {node.children.length === 1 ? 'report' : 'reports'}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-2 border-l-2 border-gray-200 ml-3">
          {node.children.map((child) => (
            <OrgChartNodeComponent
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

// Alternative tree view for larger orgs
export function OrgChartTree({ nodes, onNodeClick }: OrgChartProps) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col items-center min-w-full py-8">
        {nodes.map((node) => (
          <TreeNode key={node.id} node={node} onNodeClick={onNodeClick} />
        ))}
      </div>
    </div>
  )
}

function TreeNode({ node, onNodeClick }: { node: OrgChartNode; onNodeClick?: (node: OrgChartNode) => void }) {
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div
        onClick={() => onNodeClick?.(node)}
        className={cn(
          'px-4 py-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg',
          node.has_submitted_this_week
            ? 'bg-green-50 border-green-300'
            : 'bg-white border-gray-300'
        )}
      >
        <div className="text-center">
          <p className="font-semibold text-gray-900">{node.name}</p>
          <p className="text-xs text-gray-500">{node.role}</p>
        </div>
      </div>

      {/* Connector line */}
      {hasChildren && <div className="w-0.5 h-6 bg-gray-300" />}

      {/* Horizontal connector */}
      {hasChildren && (
        <div
          className="h-0.5 bg-gray-300"
          style={{
            width: `${Math.max(node.children.length - 1, 0) * 160}px`,
          }}
        />
      )}

      {/* Children */}
      {hasChildren && (
        <div className="flex gap-8">
          {node.children.map((child) => (
            <div key={child.id} className="flex flex-col items-center">
              <div className="w-0.5 h-6 bg-gray-300" />
              <TreeNode node={child} onNodeClick={onNodeClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
