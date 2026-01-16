import axios from 'axios'
import type {
  Team,
  Worker,
  WorkerWithRelations,
  OrgChartNode,
  Report,
  ReportWithDetails,
  WeeklySubmissionSummary,
  CompanyAnalytics,
  ExecutiveSummary,
  TeamHealth,
  ThemeSentiment,
  TeamSummary,
  WorkerProfile,
  AvailableWeeksResponse,
  AllTimeSummary,
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://t5t-backend-production.up.railway.app/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
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

// Auth
export const auth = {
  requestMagicLink: (email: string) =>
    api.post('/auth/magic-link', { email }),

  verifyMagicLink: (token: string) =>
    api.post<{ access_token: string; worker: Worker }>('/auth/verify', { token }),
}

// Teams
export const teams = {
  list: () => api.get<Team[]>('/teams/'),
  get: (id: number) => api.get<Team>(`/teams/${id}`),
  create: (data: { name: string; parent_team_id?: number }) =>
    api.post<Team>('/teams/', data),
  update: (id: number, data: Partial<Team>) =>
    api.patch<Team>(`/teams/${id}`, data),
  delete: (id: number) => api.delete(`/teams/${id}`),
}

// Workers
export const workers = {
  list: (params?: { team_id?: number; is_active?: boolean }) =>
    api.get<Worker[]>('/workers/', { params }),
  get: (id: number) => api.get<WorkerWithRelations>(`/workers/${id}`),
  getOrgChart: () => api.get<OrgChartNode[]>('/workers/org-chart'),
  create: (data: {
    email: string
    name: string
    team_id?: number
    manager_id?: number
    role?: string
  }) => api.post<Worker>('/workers/', data),
  update: (id: number, data: Partial<Worker>) =>
    api.patch<Worker>(`/workers/${id}`, data),
  delete: (id: number) => api.delete(`/workers/${id}`),
}

// Reports
export const reports = {
  list: (params?: { worker_id?: number; team_id?: number; week_of?: string }) =>
    api.get<Report[]>('/reports/', { params }),
  get: (id: number) => api.get<ReportWithDetails>(`/reports/${id}`),
  getCurrentWeek: (team_id?: number) =>
    api.get<ReportWithDetails[]>('/reports/current-week', { params: { team_id } }),
  getWorkerHistory: (worker_id: number) =>
    api.get<Report[]>(`/reports/worker/${worker_id}/history`),
}

// Analytics
export const analytics = {
  getSubmissions: (params?: { week_of?: string; team_id?: number }) =>
    api.get<WeeklySubmissionSummary>('/analytics/submissions', { params }),
  getCompanyAnalytics: (week_of?: string) =>
    api.get<CompanyAnalytics>('/analytics/company', { params: { week_of } }),
  getTeamAnalytics: (team_id: number, week_of?: string) =>
    api.get<CompanyAnalytics>(`/analytics/team/${team_id}`, { params: { week_of } }),
  getThemesSentiment: (week_of?: string) =>
    api.get<ThemeSentiment[]>('/analytics/themes/sentiment', { params: { week_of } }),
}

// CEO Intelligence
export const intelligence = {
  getCompanySummary: (params?: { week_of?: string; regenerate?: boolean }) =>
    api.get<ExecutiveSummary>('/intelligence/summary/company', { params }),
  getTeamsHealth: (week_of?: string) =>
    api.get<TeamHealth[]>('/intelligence/teams/health', { params: { week_of } }),
  regenerateSummary: (week_of?: string) =>
    api.post('/intelligence/summary/regenerate', null, { params: { week_of } }),
  getTeamSummary: (teamId: number, week_of?: string) =>
    api.get<TeamSummary>(`/intelligence/summary/team/${teamId}`, { params: { week_of } }),
  getWorkerProfile: (workerId: number) =>
    api.get<WorkerProfile>(`/intelligence/worker/${workerId}/profile`),
  // Available weeks for picker
  getAvailableWeeks: (scope?: string, scopeId?: number) =>
    api.get<AvailableWeeksResponse>('/intelligence/weeks/available', {
      params: { scope, scope_id: scopeId }
    }),
  // All-time summaries
  getCompanySummaryAllTime: () =>
    api.get<AllTimeSummary>('/intelligence/summary/company/all-time'),
  getTeamSummaryAllTime: (teamId: number) =>
    api.get<AllTimeSummary>(`/intelligence/summary/team/${teamId}/all-time`),
}

export default api
