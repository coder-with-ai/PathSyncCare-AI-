import type {
  PatientSummary, PatientDetail, Alert, PipelineRun,
  PipelineDAGData, WorklistItem, DashboardStats,
  CareCheckpoint, AuditLogEvent
} from '../types';
import {
  mockStats, mockWorklist, mockAlerts, mockPatients, mockPipelineRuns,
  mockCheckpoints, mockAuditLogs
} from './mockData';
import { recordSupabaseObservation } from './supabaseClient';

const BASE = '/api';

async function fetchJSON<T>(url: string): Promise<T> {
  try {
    const res = await fetch(`${BASE}${url}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline / network failure: gracefully fall back to mock data
  }
  return getMockFallback<T>(url);
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Backend offline: gracefully handle mutation
  }
  return handleMockPost<T>(url, body);
}

function getMockFallback<T>(url: string): T {
  const cleanUrl = url.split('?')[0];

  if (cleanUrl === '/worklist/stats') {
    return mockStats as unknown as T;
  }
  if (cleanUrl === '/worklist') {
    return mockWorklist as unknown as T;
  }
  if (cleanUrl === '/alerts') {
    return mockAlerts as unknown as T;
  }
  if (cleanUrl === '/alerts/summary') {
    return {
      total: mockAlerts.length,
      active: mockAlerts.filter(a => a.status === 'active').length,
      by_severity: { critical: 1, high: 2, medium: 1, low: 1 },
      by_source: { 'rule-based': 2, 'ml-pattern': 1, 'llm-explanation': 2 },
    } as unknown as T;
  }
  if (cleanUrl === '/patients') {
    return mockPatients.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      abha_id: p.abha_id,
      disease: p.disease,
      discharge_date: p.discharge_date,
      risk_score: p.risk_score,
      compliance_rate: p.compliance_rate,
      active_alerts: p.active_alerts,
      avatar_color: p.avatar_color,
    })) as unknown as T;
  }
  if (cleanUrl.startsWith('/patients/') && cleanUrl.endsWith('/trajectory')) {
    const id = cleanUrl.split('/')[2];
    const patient = mockPatients.find(p => p.id === id) || mockPatients[0];
    return {
      patient_id: patient.id,
      disease: patient.disease,
      trajectory: patient.trajectory,
      milestones: patient.care_plan.milestones,
    } as unknown as T;
  }
  if (cleanUrl.startsWith('/patients/')) {
    const id = cleanUrl.split('/')[2];
    const patient = mockPatients.find(p => p.id === id) || mockPatients[0];
    return patient as unknown as T;
  }
  if (cleanUrl.startsWith('/alerts/')) {
    const id = cleanUrl.split('/')[2];
    const alert = mockAlerts.find(a => a.id === id) || mockAlerts[0];
    return alert as unknown as T;
  }
  if (cleanUrl === '/pipeline/runs') {
    return mockPipelineRuns as unknown as T;
  }
  if (cleanUrl.startsWith('/pipeline/runs/')) {
    const id = cleanUrl.split('/')[3];
    const run = mockPipelineRuns.find(r => r.id === id) || mockPipelineRuns[0];
    return run as unknown as T;
  }
  if (cleanUrl === '/pipeline/nodes') {
    return {
      nodes: mockPipelineRuns[0].nodes,
      edges: [],
    } as unknown as T;
  }
  if (cleanUrl.includes('/checkpoints')) {
    return mockCheckpoints as unknown as T;
  }
  if (cleanUrl.includes('/audit/events')) {
    return mockAuditLogs as unknown as T;
  }

  return {} as T;
}

function handleMockPost<T>(url: string, _body: unknown): T {
  if (url.includes('/review')) {
    return { success: true, message: 'Alert reviewed successfully' } as unknown as T;
  }
  if (url.includes('/trigger')) {
    const newRun: PipelineRun = {
      id: `RUN-${Date.now().toString().slice(-6)}`,
      type: 'realtime_event',
      status: 'success',
      triggered_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      triggered_by: 'DoctorManualTrigger',
      patients_processed: 14,
      alerts_generated: 2,
      nodes: mockPipelineRuns[0].nodes,
    };
    return newRun as unknown as T;
  }
  return { success: true } as unknown as T;
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

// ─── Checkpoints & Observations (Dynamic Disease Tracking & Living Contract) ──
export const getCheckpoints = (patientId: string) =>
  fetchJSON<CareCheckpoint[]>(`/patients/${patientId}/checkpoints`);

export const reviewCheckpoint = (
  patientId: string,
  checkpointId: string,
  decision: string,
  notes?: string,
  clinicianName: string = 'Dr. Arun Mehta'
) => postJSON(`/checkpoints/${checkpointId}/review`, { patientId, decision, notes, clinicianName });

export const recordObservation = async (
  patientId: string,
  payload: Record<string, unknown>,
  source: string = 'Clinician-entered',
  clinicianName?: string
) => {
  // Sync to Supabase in background if configured
  await recordSupabaseObservation(patientId, payload, source, clinicianName);
  return postJSON(`/patients/${patientId}/observations`, { payload, source, clinicianName });
};

// ─── Security Audit Events ──────────────────────────────────────────────────
export const getAuditLogs = () => fetchJSON<AuditLogEvent[]>('/audit/events');
