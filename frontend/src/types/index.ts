// ─── Disease Types ──────────────────────────────────────────────────────────
export type DiseaseType =
  | 'Hypertension'
  | 'Type 2 Diabetes'
  | 'Tuberculosis'
  | 'Coronary Artery Disease'
  | 'Chronic Kidney Disease'
  | 'Stroke Recovery'
  | 'Depression';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AISource = 'rule-based' | 'ml-pattern' | 'llm-explanation';
export type AlertStatus = 'active' | 'reviewed' | 'dismissed' | 'resolved';
export type PipelineStatusType = 'running' | 'success' | 'failed' | 'pending';
export type MilestoneStatus = 'completed' | 'pending' | 'overdue' | 'in_progress';

// ─── Patient ────────────────────────────────────────────────────────────────
export interface PatientSummary {
  id: string;
  name: string;
  age: number;
  gender: string;
  abha_id: string;
  disease: DiseaseType;
  discharge_date: string;
  risk_score: number;
  compliance_rate: number;
  active_alerts: number;
  avatar_color: string;
}

export interface VitalReading {
  timestamp: string;
  type: string;
  value: number;
  unit: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: MilestoneStatus;
  completed_date: string | null;
}

export interface CarePlan {
  id: string;
  disease: DiseaseType;
  created_date: string;
  milestones: Milestone[];
  medications: string[];
  instructions: string[];
}

export interface TrajectoryPoint {
  day: number;
  expected: number;
  actual: number | null;
  label?: string;
}

export interface Intervention {
  date: string;
  type: string;
  description: string;
  outcome: string;
}

export interface PatientDetail extends PatientSummary {
  phone: string;
  address: string;
  care_plan: CarePlan;
  vitals_history: VitalReading[];
  trajectory: TrajectoryPoint[];
  interventions: Intervention[];
}

// ─── Alert ──────────────────────────────────────────────────────────────────
export interface Alert {
  id: string;
  patient_id: string;
  patient_name: string;
  severity: AlertSeverity;
  source: AISource;
  title: string;
  description: string;
  triggered_at: string;
  status: AlertStatus;
  confidence: number;
  rule_detail: string | null;
  ml_detail: string | null;
  llm_detail: string | null;
  deviation_score: number | null;
  disease: DiseaseType;
}

// ─── Pipeline ───────────────────────────────────────────────────────────────
export interface PipelineNode {
  id: string;
  name: string;
  type: string;
  status: PipelineStatusType;
  started_at: string | null;
  completed_at: string | null;
  input_summary: string | null;
  output_summary: string | null;
  duration_ms: number | null;
}

export interface PipelineRun {
  id: string;
  type: string;
  status: PipelineStatusType;
  triggered_at: string;
  completed_at: string | null;
  triggered_by: string;
  patients_processed: number;
  alerts_generated: number;
  nodes: PipelineNode[];
}

export interface PipelineDAGData {
  nodes: { id: string; name: string; type: string; x: number; y: number }[];
  edges: { from: string; to: string }[];
  outputs: { from: string; name: string; icon: string }[];
}

// ─── Worklist ───────────────────────────────────────────────────────────────
export interface WorklistItem {
  rank: number;
  patient_id: string;
  patient_name: string;
  age: number;
  disease: DiseaseType;
  risk_score: number;
  urgency_reason: string;
  top_alert: string;
  deviation_score: number;
  avatar_color: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_patients: number;
  active_alerts: number;
  avg_compliance: number;
  critical_deviations: number;
  patients_on_track: number;
  pipeline_runs_today: number;
  disease_distribution: Record<string, number>;
}
