/**
 * WBR (Weekly Business Review) API Client
 *
 * Standalone API client for WBR module, independent of T5T API.
 */
import axios from 'axios'
import type {
  WBRParticipant,
  WBRParticipantWithStats,
  WBRParticipantCreate,
  WBRParticipantUpdate,
  WBRFunction,
  WBRFunctionWithChildren,
  WBRFunctionCreate,
  WBRFunctionUpdate,
  WBRMetric,
  WBRMetricWithOwner,
  WBRMetricWithHistory,
  WBRMetricCreate,
  WBRProject,
  WBRProjectWithOwner,
  WBRProjectWithHistory,
  WBRProjectCreate,
  WBRProjectUpdate as WBRProjectUpdateType,
  WBRFunctionalUpdate,
  WBRUpload,
  WBRUploadWithContent,
  WBRUploadValidationResult,
  WBRUploadProcessResponse,
  WBRInsight,
  WBRScorecard,
  WBRWeeklySummary,
  WBRMetricType,
  WBRProjectStatus,
  UnifiedDashboard,
  UnifiedPersonProfile,
  UnifiedPeopleList,
} from '@/types/wbr'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://t5t-backend-production.up.railway.app/api'

const api = axios.create({
  baseURL: `${API_BASE}/wbr`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests (uses same token as T5T)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('t5t_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('t5t_token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Participants
export const participants = {
  list: (isActive?: boolean) =>
    api.get<WBRParticipant[]>('/participants', { params: { is_active: isActive } }),

  get: (id: number) =>
    api.get<WBRParticipantWithStats>(`/participants/${id}`),

  create: (data: WBRParticipantCreate) =>
    api.post<WBRParticipant>('/participants', data),

  update: (id: number, data: WBRParticipantUpdate) =>
    api.patch<WBRParticipant>(`/participants/${id}`, data),

  delete: (id: number) =>
    api.delete(`/participants/${id}`),
}

// Functions
export const functions = {
  list: (isActive?: boolean) =>
    api.get<WBRFunctionWithChildren[]>('/functions', { params: { is_active: isActive } }),

  get: (id: number) =>
    api.get<WBRFunctionWithChildren>(`/functions/${id}`),

  create: (data: WBRFunctionCreate) =>
    api.post<WBRFunction>('/functions', data),

  update: (id: number, data: WBRFunctionUpdate) =>
    api.patch<WBRFunction>(`/functions/${id}`, data),
}

// Metrics
export const metrics = {
  list: (params?: {
    metric_type?: WBRMetricType
    function_id?: number
    okr_group?: string
    is_active?: boolean
  }) => api.get<WBRMetricWithOwner[]>('/metrics', { params }),

  get: (id: number, weeks?: number) =>
    api.get<WBRMetricWithHistory>(`/metrics/${id}`, { params: { weeks } }),

  create: (data: WBRMetricCreate) =>
    api.post<WBRMetric>('/metrics', data),

  update: (id: number, data: Partial<WBRMetricCreate>) =>
    api.patch<WBRMetric>(`/metrics/${id}`, data),

  addEntry: (metricId: number, data: {
    week_of: string
    current_value?: number
    target_value?: number
    gap?: number
    variance_pct?: number
    status?: string
    notes?: string
  }) => api.post(`/metrics/${metricId}/entries`, data),
}

// Projects
export const projects = {
  list: (params?: {
    function_id?: number
    owner_id?: number
    status?: WBRProjectStatus
    is_active?: boolean
  }) => api.get<WBRProjectWithOwner[]>('/projects', { params }),

  get: (id: number) =>
    api.get<WBRProjectWithHistory>(`/projects/${id}`),

  create: (data: WBRProjectCreate) =>
    api.post<WBRProject>('/projects', data),

  update: (id: number, data: Partial<WBRProjectCreate>) =>
    api.patch<WBRProject>(`/projects/${id}`, data),

  addUpdate: (projectId: number, data: {
    week_of: string
    completion_pct?: number
    status?: WBRProjectStatus
    estimated_completion?: string
    complete_last_week?: string
    todo_this_week?: string
    blockers?: string
    notes?: string
  }) => api.post(`/projects/${projectId}/updates`, data),
}

// Scorecard & Summary
export const scorecard = {
  get: (weekOf?: string) =>
    api.get<WBRScorecard>('/scorecard', { params: { week_of: weekOf } }),

  getWeekly: (weekOf: string) =>
    api.get<WBRWeeklySummary>(`/week/${weekOf}`),
}

// Uploads
export const uploads = {
  list: (limit?: number) =>
    api.get<WBRUpload[]>('/uploads', { params: { limit } }),

  get: (id: number) =>
    api.get<WBRUploadWithContent>(`/uploads/${id}`),

  // Validate without saving
  validate: async (file: File | string, weekOf?: string): Promise<WBRUploadValidationResult> => {
    const formData = new FormData()

    if (typeof file === 'string') {
      formData.append('content', file)
    } else {
      formData.append('file', file)
    }

    if (weekOf) {
      formData.append('week_of', weekOf)
    }

    const response = await axios.post<WBRUploadValidationResult>(
      `${API_BASE}/wbr/upload/validate`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('t5t_token') : ''}`,
        },
      }
    )
    return response.data
  },

  // Process and save
  process: async (
    file: File | string,
    options?: {
      weekOf?: string
      uploadedById?: number
      force?: boolean
    }
  ): Promise<WBRUploadProcessResponse> => {
    const formData = new FormData()

    if (typeof file === 'string') {
      formData.append('content', file)
    } else {
      formData.append('file', file)
    }

    if (options?.weekOf) {
      formData.append('week_of', options.weekOf)
    }
    if (options?.uploadedById) {
      formData.append('uploaded_by_id', options.uploadedById.toString())
    }
    if (options?.force) {
      formData.append('force', 'true')
    }

    const response = await axios.post<WBRUploadProcessResponse>(
      `${API_BASE}/wbr/upload/process`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('t5t_token') : ''}`,
        },
      }
    )
    return response.data
  },

  reprocess: (uploadId: number, force?: boolean) =>
    api.post<WBRUploadProcessResponse>(`/upload/${uploadId}/reprocess`, null, {
      params: { force },
    }),
}

// WBR Intelligence
export const intelligence = {
  getSummary: (weekOf?: string) =>
    api.get<{
      week_of: string
      has_data: boolean
      insight_id?: number
      narrative?: string
      highlights?: string[]
      concerns?: string[]
      recommendations?: string[]
      metrics_summary?: Record<string, unknown>
      created_at?: string
    }>('/intelligence/summary', { params: { week_of: weekOf } }),

  getOwnerAnalysis: (ownerId: number) =>
    api.get<{
      owner_id: number
      owner_name: string
      email: string
      metrics_owned: number
      metrics_on_track: number
      projects_owned: number
      projects_on_track: number
      on_track_pct: number
      current_blockers: Array<{ project: string; blocker: string }>
      performance_status: string
    }>(`/intelligence/owner/${ownerId}`),

  getFunctionHealth: (functionId: number) =>
    api.get<{
      function_id: number
      function_name: string
      kpi_count: number
      project_count: number
      metrics_health: Array<{
        name: string
        type: string
        current: number | null
        target: number | null
        gap: number | null
        status: string | null
      }>
      project_summary: Record<string, number>
      latest_update: {
        week_of: string
        performance: string | null
        plan: string | null
        risks: string | null
        dependencies: string | null
      } | null
      overall_health: string
    }>(`/intelligence/function/${functionId}`),

  getTrends: (weeks?: number) =>
    api.get<{
      weeks_analyzed: number
      weekly_data: Array<{
        week: string
        metrics_on_track: number
        metrics_total: number
        projects_green: number
        projects_yellow: number
        projects_red: number
      }>
      overall_trend: 'improving' | 'stable' | 'declining' | 'insufficient_data'
      latest_week: string | null
    }>('/intelligence/trends', { params: { weeks } }),
}

// Unified API (cross-system)
const unifiedApi = axios.create({
  baseURL: `${API_BASE}/unified`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to unified API requests
unifiedApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('t5t_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export const unified = {
  getDashboard: () =>
    unifiedApi.get<UnifiedDashboard>('/dashboard'),

  getPersonProfile: (email: string) =>
    unifiedApi.get<UnifiedPersonProfile>(`/person/${encodeURIComponent(email)}`),

  getPeople: () =>
    unifiedApi.get<UnifiedPeopleList>('/people'),

  correlateBlockers: () =>
    unifiedApi.get<{
      t5t_blockers_count: number
      wbr_blockers_count: number
      correlations: Array<{
        t5t_blocker: string
        t5t_person: string
        wbr_blocker: string
        wbr_project: string
        wbr_owner: string | null
        matching_keywords: string[]
      }>
    }>('/correlate-blockers'),
}

// Convenience export for all WBR API functions
export const wbrApi = {
  participants,
  functions,
  metrics,
  projects,
  scorecard,
  uploads,
  intelligence,
  unified,
}

export default wbrApi
