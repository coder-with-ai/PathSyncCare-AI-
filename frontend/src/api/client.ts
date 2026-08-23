import type {
  PatientSummary, PatientDetail, Alert, PipelineRun,
  PipelineDAGData, WorklistItem, DashboardStats
} from '../types';

const BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Patients ───────────────────────────────────────────────────────────────
export const getPatients = () => fetchJSON<PatientSummary[]>('/patients');
export const getPatient = (id: string) => fetchJSON<PatientDetail>(`/patients/${id}`);
export const getTrajectory = (id: string) =>
  fetchJSON<{ patient_id: string; disease: string; trajectory: any[]; milestones: any[] }>(
    `/patients/${id}/trajectory`
  );

// ─── Alerts ─────────────────────────────────────────────────────────────────
export const getAlerts = (params?: { severity?: string; source?: string; status?: string }) => {
  const search = new URLSearchParams();
  if (params?.severity) search.set('severity', params.severity);
  if (params?.source) search.set('source', params.source);
  if (params?.status) search.set('status', params.status);
  const qs = search.toString();
  return fetchJSON<Alert[]>(`/alerts${qs ? `?${qs}` : ''}`);
};
export const getAlert = (id: string) => fetchJSON<Alert>(`/alerts/${id}`);
export const reviewAlert = (id: string, action: string, notes?: string) =>
  postJSON(`/alerts/${id}/review`, { action, notes });
export const getAlertSummary = () =>
  fetchJSON<{ total: number; active: number; by_severity: Record<string, number>; by_source: Record<string, number> }>('/alerts/summary');

// ─── Pipeline ───────────────────────────────────────────────────────────────
export const getPipelineRuns = () => fetchJSON<PipelineRun[]>('/pipeline/runs');
export const getPipelineRun = (id: string) => fetchJSON<PipelineRun>(`/pipeline/runs/${id}`);
export const triggerPipeline = (type: string = 'daily_sweep') =>
  postJSON<PipelineRun>(`/pipeline/trigger?pipeline_type=${type}`, {});
export const getPipelineDAG = () => fetchJSON<PipelineDAGData>('/pipeline/nodes');

// ─── Worklist ───────────────────────────────────────────────────────────────
export const getWorklist = () => fetchJSON<WorklistItem[]>('/worklist');
export const getDashboardStats = () => fetchJSON<DashboardStats>('/worklist/stats');
