/**
 * WBR (Weekly Business Review) TypeScript Types
 *
 * These types are standalone and independent of T5T types.
 */

// ============================================
// ENUMS
// ============================================

export type WBRMetricType = 'north_star' | 'okr' | 'functional_kpi'
export type WBRProjectStatus = 'green' | 'yellow' | 'red'
export type WBRProcessingStatus = 'pending' | 'processing' | 'completed' | 'error'

// ============================================
// PARTICIPANT TYPES
// ============================================

export interface WBRParticipant {
  id: number
  email: string
  name: string
  initials: string | null
  is_active: boolean
  created_at: string
}

export interface WBRParticipantWithStats extends WBRParticipant {
  metrics_owned: number
  projects_owned: number
  on_track_pct: number
}

export interface WBRParticipantCreate {
  email: string
  name: string
  initials?: string
}

export interface WBRParticipantUpdate {
  email?: string
  name?: string
  initials?: string
  is_active?: boolean
}

// ============================================
// FUNCTION TYPES
// ============================================

export interface WBRFunction {
  id: number
  name: string
  parent_function_id: number | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface WBRFunctionWithChildren extends WBRFunction {
  sub_functions: WBRFunction[]
}

export interface WBRFunctionCreate {
  name: string
  parent_function_id?: number
  display_order?: number
}

export interface WBRFunctionUpdate {
  name?: string
  parent_function_id?: number
  display_order?: number
  is_active?: boolean
}

// ============================================
// METRIC TYPES
// ============================================

export interface WBRMetric {
  id: number
  name: string
  metric_type: WBRMetricType
  function_id: number | null
  okr_group: string | null
  owner_id: number | null
  unit: string | null
  target_value: number | null
  target_cadence: string
  is_higher_better: boolean
  display_order: number
  is_active: boolean
  created_at: string
}

export interface WBRMetricWithOwner extends WBRMetric {
  owner: WBRParticipant | null
  function: WBRFunction | null
}

export interface WBRMetricEntry {
  id: number
  metric_id: number
  week_of: string
  current_value: number | null
  target_value: number | null
  gap: number | null
  variance_pct: number | null
  status: string | null
  notes: string | null
  created_at: string
}

export interface WBRMetricWithHistory extends WBRMetricWithOwner {
  entries: WBRMetricEntry[]
}

export interface WBRMetricCreate {
  name: string
  metric_type: WBRMetricType
  function_id?: number
  okr_group?: string
  owner_id?: number
  unit?: string
  target_value?: number
  target_cadence?: string
  is_higher_better?: boolean
  display_order?: number
}

// ============================================
// PROJECT TYPES
// ============================================

export interface WBRProject {
  id: number
  name: string
  function_id: number | null
  owner_id: number | null
  category: string | null
  estimated_completion: string | null
  is_active: boolean
  created_at: string
}

export interface WBRProjectWithOwner extends WBRProject {
  owner: WBRParticipant | null
  function: WBRFunction | null
}

export interface WBRProjectUpdate {
  id: number
  project_id: number
  week_of: string
  completion_pct: number | null
  status: WBRProjectStatus | null
  estimated_completion: string | null
  complete_last_week: string | null
  todo_this_week: string | null
  blockers: string | null
  notes: string | null
  created_at: string
}

export interface WBRProjectWithHistory extends WBRProjectWithOwner {
  updates: WBRProjectUpdate[]
  latest_update: WBRProjectUpdate | null
}

export interface WBRProjectCreate {
  name: string
  function_id?: number
  owner_id?: number
  category?: string
  estimated_completion?: string
}

// ============================================
// FUNCTIONAL UPDATE TYPES
// ============================================

export interface WBRFunctionalUpdate {
  id: number
  function_id: number
  week_of: string
  owner_id: number | null
  performance_last_week: string | null
  plan_next_week: string | null
  dependencies: string | null
  risks: string | null
  priorities: string | null
  created_at: string
}

// ============================================
// UPLOAD TYPES
// ============================================

export interface WBRUpload {
  id: number
  week_of: string
  uploaded_by_id: number | null
  processed_at: string | null
  processing_status: WBRProcessingStatus
  error_message: string | null
  metrics_parsed: number
  projects_parsed: number
  created_at: string
}

export interface WBRUploadWithContent extends WBRUpload {
  raw_content: string
}

export interface WBRUploadValidationResult {
  week_of: string
  is_valid: boolean
  metrics_found: number
  projects_found: number
  functional_updates_found: number
  validation_errors: string[]
  unknown_owners: string[]
  parsed_data_preview: {
    north_star_metrics: number
    okr_metrics: number
    functional_kpis: number
    projects: Array<{ name: string; owners: string[]; status: string | null }>
    functional_updates: Array<{ function: string; owner: string | null }>
  }
}

export interface WBRUploadProcessResponse {
  upload_id: number
  week_of: string
  metrics_created: number
  metric_entries_created: number
  projects_created: number
  project_updates_created: number
  functional_updates_created: number
  validation_errors: string[]
}

// ============================================
// INSIGHT TYPES
// ============================================

export interface WBRInsight {
  id: number
  week_of: string
  scope: string
  scope_id: number | null
  narrative: string | null
  highlights: string[] | null
  concerns: string[] | null
  recommendations: string[] | null
  metrics_summary: Record<string, unknown> | null
  created_at: string
}

// ============================================
// SCORECARD TYPES
// ============================================

export interface NorthStarMetricSummary {
  id: number
  name: string
  current_value: number | null
  target_value: number | null
  gap: number | null
  variance_pct: number | null
  unit: string | null
  owner_name: string | null
  status: string | null
  trend: 'up' | 'down' | 'stable' | null
}

export interface OKRSummary {
  okr_group: string
  metrics_count: number
  on_track_count: number
  status: 'green' | 'yellow' | 'red'
}

export interface ProjectAtRisk {
  id: number
  name: string
  completion_pct: number | null
  status: string | null
  blocker: string | null
  owner_name: string | null
}

export interface ProjectStatusSummary {
  green_count: number
  yellow_count: number
  red_count: number
  total_count: number
  at_risk_projects: ProjectAtRisk[]
}

export interface FunctionHealthSummary {
  id: number
  name: string
  kpi_count: number
  project_count: number
  on_track_kpis: number
  on_track_projects: number
  key_metric: string | null
  key_metric_value: string | null
}

export interface OwnerAccountabilitySummary {
  id: number
  name: string
  metrics_owned: number
  projects_owned: number
  on_track_pct: number
  current_blockers: string[]
}

export interface WBRScorecard {
  week_of: string
  north_stars: NorthStarMetricSummary[]
  okrs: OKRSummary[]
  projects: ProjectStatusSummary
  functions: FunctionHealthSummary[]
  owners: OwnerAccountabilitySummary[]
}

export interface WBRWeeklySummary {
  week_of: string
  north_stars: NorthStarMetricSummary[]
  okrs: OKRSummary[]
  projects_by_status: {
    green: number
    yellow: number
    red: number
  }
  functions_summary: FunctionHealthSummary[]
  narrative: string | null
  highlights: string[]
  concerns: string[]
}

// ============================================
// UNIFIED TYPES (Cross-system)
// ============================================

export interface UnifiedPersonT5TData {
  worker_id: number
  total_reports: number
  submission_streak: number
  sentiment_score: number | null
  risk_level: string | null
  recent_blockers: string[]
  last_report_date: string | null
}

export interface UnifiedPersonWBRData {
  participant_id: number
  metrics_owned: number
  metrics_on_track: number
  projects_owned: number
  projects_on_track: number
  on_track_pct: number
  current_blockers: Array<{ project: string; blocker: string }>
}

export interface UnifiedAssessment {
  status: 'good' | 'needs_attention' | 'at_risk' | 'no_data'
  signals: string[]
  has_t5t_data: boolean
  has_wbr_data: boolean
}

export interface UnifiedPersonProfile {
  email: string
  name: string | null
  t5t: UnifiedPersonT5TData | null
  wbr: UnifiedPersonWBRData | null
  unified_assessment: UnifiedAssessment
}

export interface EarlyWarning {
  severity: 'high' | 'medium' | 'low'
  person: string
  email: string
  t5t_signal: string
  wbr_signal: string
  projects: Array<{ name: string; status: string | null }>
  recommendation: string
}

export interface T5THighlights {
  recent_reports: number
  risk_distribution: Record<string, number>
  high_risk_workers: Array<{
    name: string
    risk_level: string
    sentiment: number | null
  }>
}

export interface WBRHighlights {
  project_status_distribution: Record<string, number>
  at_risk_projects: Array<{
    project: string
    status: string | null
    blocker: string | null
    owner: string | null
  }>
}

export interface UnifiedDashboard {
  generated_at: string
  executive_summary: string
  early_warnings: EarlyWarning[]
  t5t_highlights: T5THighlights
  wbr_highlights: WBRHighlights
}

export interface UnifiedPerson {
  email: string
  name: string
  t5t_worker_id: number | null
  wbr_participant_id: number | null
  in_both_systems: boolean
}

export interface UnifiedPeopleList {
  total: number
  in_both_systems: number
  t5t_only: number
  wbr_only: number
  people: UnifiedPerson[]
}
