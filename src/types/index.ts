export type UserRole = 'admin' | 'manager' | 'worker'
export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface Team {
  id: number
  name: string
  parent_team_id: number | null
  created_at: string
}

export interface Worker {
  id: number
  email: string
  name: string
  job_title: string | null
  team_id: number | null
  manager_id: number | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface WorkerWithRelations extends Worker {
  team?: Team
  manager?: Worker
  direct_reports?: Worker[]
}

export interface OrgChartNode {
  id: number
  name: string
  email: string
  job_title: string | null
  role: UserRole
  team_name: string | null
  has_submitted_this_week: boolean
  children: OrgChartNode[]
}

export interface Top5Item {
  id: number
  item_number: number
  content: string
  themes: string[] | null
  sentiment: Sentiment | null
  is_blocker: boolean
}

export interface AIUsage {
  id: number
  tools: string | null
  applied_to: string | null
  impact: string | null
  tools_normalized: string[] | null
}

export interface Automation {
  id: number
  workflow: string | null
  category: string | null
}

export interface Report {
  id: number
  worker_id: number
  week_of: string
  submitted_at: string
  processed_at: string | null
}

export interface ReportWithDetails extends Report {
  worker: Worker
  top5_items: Top5Item[]
  ai_usage: AIUsage | null
  automation: Automation | null
  raw_email: string
}

export interface SubmissionStatus {
  worker_id: number
  worker_name: string
  worker_email: string
  team_name: string | null
  submitted: boolean
  submitted_at: string | null
}

export interface WeeklySubmissionSummary {
  week_of: string
  total_workers: number
  submitted_count: number
  submission_rate: number
  submissions: SubmissionStatus[]
}

export interface ThemeTrend {
  theme: string
  count: number
  trend: 'up' | 'down' | 'stable'
}

export interface AIToolTrend {
  tool: string
  count: number
  users: string[]
}

export interface CompanyAnalytics {
  week_of: string
  submission_rate: number
  total_workers: number
  submitted_count: number
  top_themes: ThemeTrend[]
  ai_tools: AIToolTrend[]
  ai_adoption_rate: number
  automation_mentions: number
  blockers: string[]
  wins: string[]
}

// CEO Intelligence types
export interface IntelligenceMetrics {
  submission_rate: number
  submitted_count: number
  total_workers: number
  ai_adoption_rate: number
  blocker_count: number
}

export interface ExecutiveSummary {
  week_of: string
  narrative: string
  highlights: string[]
  concerns: string[]
  metrics: IntelligenceMetrics
  top_themes?: string[]
  team_submissions?: Record<string, number>
}

export interface TeamHealth {
  team_id: number
  team_name: string
  submission_rate: number
  submitted_count: number
  total_workers: number
  ai_adoption_rate: number
  blocker_count: number
}
