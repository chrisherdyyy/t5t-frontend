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

// Theme with sentiment breakdown
export interface SentimentBreakdown {
  positive: number
  neutral: number
  negative: number
}

export interface ThemeSentiment {
  theme: string
  count: number
  sentiment_breakdown: SentimentBreakdown
  blocker_count: number
  workers: string[]
}

// Team summary for detail page
export interface TeamSummary {
  team_id: number
  team_name: string
  week_of: string
  narrative: string
  submission_rate: number
  submitted_count: number
  total_workers: number
  ai_adoption_rate: number
  blockers: string[]
  wins: string[]
  themes: Array<{ theme: string; count: number }>
  members: Array<{ worker_id: number; name: string; submitted: boolean }>
}

// Worker profile for detail page
export interface WorkerProfile {
  worker_id: number
  name: string
  email: string
  team_name: string | null
  ai_summary: string
  submission_count: number
  submission_streak: number
  primary_themes: string[]
  ai_tools_used: string[]
  sentiment_trend: string
  recent_wins: string[]
  submission_history: Array<{
    week_of: string
    submitted: boolean
    themes: string[]
  }>
}

// Time and scope selectors for unified intelligence view
export type TimeRange = 'this_week' | 'all_time' | 'specific_week'
export type IntelligenceScope = 'company' | 'team' | 'worker'

export interface AvailableWeeksResponse {
  current_week: string
  available_weeks: string[]
  total_weeks: number
}

export interface AIAdoptionTrend {
  week: string
  rate: number
}

export interface ThemeCount {
  theme: string
  count: number
}

export interface AllTimeSummary {
  total_weeks_tracked: number
  total_submissions: number
  unique_submitters: number
  average_submission_rate: number
  ai_adoption_trend: AIAdoptionTrend[]
  all_time_top_themes: ThemeCount[]
  sentiment_distribution: { positive: number; neutral: number; negative: number }
  narrative: string
}

// Actions tracking types (legacy)
export interface ActionItem {
  id: number
  content: string
  worker_name: string
  team_name: string | null
  week_of: string
  themes: string[]
  is_blocker: boolean
  action_status: 'pending' | 'completed'
  action_completed_at: string | null
}

export interface ActionsResponse {
  pending: ActionItem[]
  completed: ActionItem[]
  by_week: Record<string, ActionItem[]>
}

// Recommendations types (new strategic recommendations)
export interface RecommendationItem {
  index: number
  action: string
  owner: string
  urgency: 'this_week' | 'next_week' | 'this_month'
  why: string
  status: 'pending' | 'completed'
  completed_at: string | null
}

export interface TeamRecommendations {
  team_id: number
  team_name: string
  recommendations: RecommendationItem[]
  pending_count: number
  completed_count: number
}

export interface WeeklyRecommendations {
  week_of: string
  company: RecommendationItem[]
  teams: TeamRecommendations[]
  pending_count: number
  completed_count: number
}

export interface RecommendationsResponse {
  current_week: WeeklyRecommendations | null
  previous_weeks: WeeklyRecommendations[]
  total_pending: number
  total_completed: number
}

// Reports by week types
export interface TeamSubmissionSummary {
  team_id: number
  team_name: string
  submitted: number
  expected: number
}

export interface WeekSummary {
  week_of: string
  submission_count: number
  expected_count: number
  completion_rate: number
  top_themes: string[]
  teams: TeamSubmissionSummary[]
}

// Search types
export interface SearchResultItem {
  id: number
  content: string
  worker_id: number
  worker_name: string
  team_id: number | null
  team_name: string | null
  week_of: string
  themes: string[]
  sentiment: string | null
  is_blocker: boolean
  report_id: number
}

export interface SearchResponse {
  query: string
  total_results: number
  results: SearchResultItem[]
}

// Trends types
export interface WeeklyTheme {
  week: string
  themes: Record<string, number>
}

export interface SentimentWeek {
  week: string
  positive: number
  neutral: number
  negative: number
}

export interface BlockerWeek {
  week: string
  count: number
}

export interface SubmissionWeek {
  week: string
  submitted: number
  expected: number
  rate: number
}

export interface TrendsResponse {
  weeks_analyzed: number
  themes_over_time: WeeklyTheme[]
  sentiment_trajectory: SentimentWeek[]
  blocker_trend: BlockerWeek[]
  submission_rate: SubmissionWeek[]
  emerging_themes: string[]
  declining_themes: string[]
}

// Risk Assessment types (Early Warning System)
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type SentimentTrend = 'improving' | 'stable' | 'declining'

export interface WorkerRisk {
  worker_id: number
  worker_name: string
  team_name: string | null
  job_title: string | null
  burnout_risk: number
  engagement_score: number
  sentiment_trend: string
  assessment_summary: string
  recommended_actions: string[] | null
  risk_level: RiskLevel
}

export interface TeamRisk {
  team_id: number
  team_name: string
  health_score: number
  alignment_score: number
  cross_team_friction: number
  at_risk_workers: number
  assessment_summary: string
  recommended_actions: string[] | null
}

export interface RiskAssessment {
  week_of: string
  high_risk_workers: WorkerRisk[]
  medium_risk_workers: WorkerRisk[]
  team_risks: TeamRisk[]
  company_risk_summary: string
  top_interventions: string[]
}

// Cross-team analysis types
export interface CrossTeamMention {
  from_team: string
  to_team: string
  mention_type: string  // "waiting_on", "blocked_by", "collaborating_with"
  context: string
  sentiment: string     // "positive", "neutral", "negative"
}

export interface DependencyChain {
  chain: string[]       // e.g., ["Sales", "Product", "Engineering"]
  description: string
  risk_level: string    // "low", "medium", "high"
}

export interface SystemicIssue {
  issue: string
  affected_teams: string[]
  mention_count: number
  severity: string      // "low", "medium", "high"
}

export interface FrictionPoint {
  teams_involved: string[]
  description: string
  recommended_action: string
}

export interface CrossTeamAnalysis {
  week_of: string
  cross_team_mentions: CrossTeamMention[]
  dependency_chains: DependencyChain[]
  systemic_issues: SystemicIssue[]
  friction_points: FrictionPoint[]
  narrative: string
  teams_analyzed?: string[]
  total_items_analyzed?: number
}
