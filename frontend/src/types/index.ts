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

// ─── 8 Checkpoint Evaluation Statuses (Core Intelligence) ─────────────────────
export type CheckpointEvaluationStatus =
  | 'On track'
  | 'Due soon'
  | 'Overdue'
  | 'Outside expected range'
  | 'Worsening trend'
  | 'Conflicting data'
  | 'Insufficient evidence'
  | 'Resolved';

export type ObservationSource =
  | 'Patient-reported'
  | 'Clinician-entered'
  | 'Connected Device'
  | 'Diagnostic Lab'
  | 'ASHA Telemetry';

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
  // Scalable patient metadata
  assigned_doctor?: string;
  hospital_id?: string;
  admission_date?: string;
}

export interface VitalReading {
  timestamp: string;
  type: string;
  value: number;
  unit: string;
  context?: string;
  source?: ObservationSource;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: MilestoneStatus;
  completed_date: string | null;
}

// ─── Care Checkpoint (Expected vs Actual Evaluator) ──────────────────────────
export interface CareCheckpoint {
  id: string;
  patient_id: string;
  checkpoint_code: string; // e.g. "CP-001"
  title: string;
  field_name: string;
  expected_range: string;
  target_min?: number;
  target_max?: number;
  target_unit: string;
  measurement_frequency: string;
  due_date: string;
  actual_measurement: string | null;
  actual_value?: number | null;
  has_recorded_data: boolean; // Crucial distinction: missing data is not normal data
  source: ObservationSource | null;
  recorded_date: string | null;
  status: CheckpointEvaluationStatus;
  evaluation_rationale: string;
  trend_variance_pct?: number;
  is_reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  clinician_decision?: string;
}

export interface CarePlan {
  id: string;
  disease: DiseaseType;
  created_date: string;
  milestones: Milestone[];
  medications: string[];
  instructions: string[];
  checkpoints?: CareCheckpoint[];
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

export interface ConsentRecord {
  id: string;
  patient_id: string;
  abha_id: string;
  consent_type: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  granted_at: string;
  expires_at: string;
  purpose: string;
  data_categories: string[];
}

export interface PatientDetail extends PatientSummary {
  phone: string;
  address: string;
  care_plan: CarePlan;
  vitals_history: VitalReading[];
  trajectory: TrajectoryPoint[];
  interventions: Intervention[];
  checkpoints: CareCheckpoint[];
  consent?: ConsentRecord;
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

// ─── Disease-Specific Observation Submissions ───────────────────────────────
export interface HypertensionObservation {
  systolic: number;
  diastolic: number;
  heart_rate: number;
  posture: 'Sitting' | 'Standing' | 'Supine';
  arm: 'Left Arm' | 'Right Arm';
  medication_adherence: 'Taken as prescribed' | 'Missed morning dose' | 'Missed entire day' | 'Side effect delay';
  symptoms: string[]; // ['Headache', 'Dizziness', 'Blurred vision', 'Chest tightness', 'None']
  notes?: string;
}

export interface DiabetesObservation {
  blood_glucose: number;
  glucose_context: 'Fasting' | 'Post-prandial (2h)' | 'Pre-prandial' | 'Random' | 'Bedtime';
  hba1c?: number;
  medication_adherence: 'All doses taken' | 'Insulin delayed' | 'Oral hypoglycemic missed' | 'Prescription refill needed';
  foot_check: 'Normal intact skin' | 'Numbness / Tingling' | 'Redness / Swelling' | 'Skin fissure / Callus' | 'Active ulcer';
  eye_check: 'Normal vision' | 'Mild blurriness' | 'Annual screening completed' | 'Overdue for ophthalmology';
  nutrition_activity_completed: boolean;
  activity_minutes: number;
}

export interface TuberculosisObservation {
  dots_adherence: 'Supervised DOTS taken' | 'Self-administered' | 'Missed dose' | 'Vomited after dose';
  treatment_phase: 'Intensive Phase (4-FDC)' | 'Continuation Phase (3-FDC)' | 'Post-treatment follow-up';
  cough_status: 'No cough' | 'Dry cough' | 'Productive cough' | 'Hemoptysis (Blood in sputum)';
  fever_night_sweats: boolean;
  weight_kg: number;
  adverse_effects: string[]; // ['Nausea/Vomiting', 'Jaundice / Yellow eyes', 'Peripheral neuropathy / Numbness', 'Skin rash', 'None']
  scheduled_tests_status: 'Sputum microscopy done' | 'Pending lab collection' | 'Chest X-ray scheduled';
}

export interface CadObservation {
  angina_severity: 'No angina' | 'CCS Class I (Strenuous exertion)' | 'CCS Class II (Moderate exertion)' | 'CCS Class III (Mild exertion)' | 'CCS Class IV (Rest angina)';
  functional_capacity_mets: number;
  resting_heart_rate: number;
  dapt_therapy_adherence: boolean;
  statin_adherence: boolean;
  nitroglycerin_doses_used_24h: number;
  rehabilitation_walking_mins: number;
  escalation_event: boolean;
  escalation_reason?: string;
}

export interface CkdObservation {
  systolic_bp: number;
  diastolic_bp: number;
  serum_creatinine?: number;
  egfr?: number;
  potassium_meq?: number;
  urine_output_24h_ml?: number;
  edema_status: 'None' | 'Trace pedal' | '1+ Mild ankle' | '2+ Moderate pretibial' | '3+ Severe generalized';
  medication_review: 'All renal meds taken' | 'Diuretic paused' | 'Phosphate binder taken with meals';
  symptoms: string[]; // ['Pruritus (itching)', 'Nausea', 'Extreme fatigue', 'Metallic taste', 'None']
}

export interface StrokeObservation {
  mobility_status: 'Independent ambulation' | 'Assisted with cane/walker' | 'Wheelchair reliant' | 'Bed-bound';
  barthel_index_score: number; // 0 - 100
  mrs_score: number; // 0 - 6 modified Rankin Scale
  physiotherapy_completed: boolean;
  speech_progress: 'Normal speech' | 'Mild dysarthria' | 'Expressive aphasia' | 'Receptive aphasia';
  fall_occurred_past_week: boolean;
  aspiration_swallow_check: 'Passed swallow screen' | 'Coughing on liquids' | 'Pureed diet required';
  attendance_confirmed: boolean;
}

export interface DepressionObservation {
  phq9_score: number; // 0 - 27
  gad7_score: number; // 0 - 21
  medication_adherence: 'Daily consistent' | 'Occasional skip' | 'Discontinued due to side effect';
  patient_wellbeing_rating: number; // 1 - 10
  sleep_hours: number;
  side_effects: string[]; // ['Insomnia', 'Nausea', 'Tremors', 'Weight change', 'Emotional blunting', 'None']
  safety_plan_active: boolean;
  crisis_contacts_accessible: boolean;
  followup_appointment_scheduled: boolean;
}

// ─── Security & Audit Ledger ────────────────────────────────────────────────
export interface AuditLogEvent {
  id: string;
  user_name: string;
  user_role: string;
  action: 'READ' | 'CREATE' | 'UPDATE' | 'REVIEW_CHECKPOINT' | 'DISPATCH_ALERT' | 'EXPORT_EHR' | 'AUTH_LOGIN';
  resource_type: string;
  resource_id: string;
  timestamp: string;
  ip_address: string;
  details: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: 'Lead Cardiologist' | 'Consultant Endocrinologist' | 'Nephrologist' | 'Care Coordinator / ASHA' | 'Clinical Administrator';
  department: string;
  avatar_initials: string;
  abha_health_id: string;
  session_token: string;
  last_login: string;
}
