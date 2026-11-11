-- ============================================================================
-- PathCareSync AI — Supabase (PostgreSQL) Database Production Schema
-- Designed for 100-Patient Scalability, ABDM / HIPAA Compliance & Real-time AI
-- Tables: 17 Core Enterprise Healthcare Tables + RLS Policies + Seed Data
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PATIENTS (Core Patient Demographics & Profile)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patients (
    patient_id          VARCHAR(64)      PRIMARY KEY,
    abha_id             VARCHAR(64)      NOT NULL UNIQUE,
    full_name           VARCHAR(150)     NOT NULL,
    date_of_birth       DATE             NOT NULL,
    gender              VARCHAR(20)      NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group         VARCHAR(10),
    mobile_number       VARCHAR(30),
    email               VARCHAR(150),
    address_line        VARCHAR(255),
    city                VARCHAR(100)     DEFAULT 'New Delhi',
    state               VARCHAR(100)     DEFAULT 'Delhi',
    postal_code         VARCHAR(20),
    emergency_contact   VARCHAR(50),
    primary_disease     VARCHAR(50)      NOT NULL CHECK (primary_disease IN (
                            'Hypertension',
                            'Type 2 Diabetes',
                            'Tuberculosis',
                            'Coronary Artery Disease',
                            'Chronic Kidney Disease',
                            'Stroke Recovery',
                            'Depression'
                        )),
    current_risk_score  NUMERIC(5,2)     DEFAULT 0.00 CHECK (current_risk_score BETWEEN 0.00 AND 100.00),
    compliance_rate     NUMERIC(5,2)     DEFAULT 100.00 CHECK (compliance_rate BETWEEN 0.00 AND 100.00),
    discharge_date      TIMESTAMPTZ      NOT NULL,
    is_active           BOOLEAN          DEFAULT TRUE,
    created_at          TIMESTAMPTZ      DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supabase_patients_disease ON public.patients(primary_disease);
CREATE INDEX IF NOT EXISTS idx_supabase_patients_risk ON public.patients(current_risk_score DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MEDICAL_CONDITIONS (Diagnoses & Care Pathways)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medical_conditions (
    condition_id        SERIAL           PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    icd10_code          VARCHAR(20)      NOT NULL,
    snomed_ct_code      VARCHAR(30),
    condition_name      VARCHAR(150)     NOT NULL,
    disease_pathway     VARCHAR(50)      NOT NULL,
    clinical_stage      VARCHAR(100),
    diagnosed_date      DATE             NOT NULL,
    diagnosing_clinician VARCHAR(150)    NOT NULL,
    status              VARCHAR(20)      DEFAULT 'active' CHECK (status IN ('active', 'remission', 'resolved')),
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PATIENT_BASELINES (Initial Health & Discharge Telemetry)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patient_baselines (
    baseline_id         SERIAL           PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    vital_name          VARCHAR(50)      NOT NULL,
    baseline_value      NUMERIC(10,2)    NOT NULL,
    unit                VARCHAR(30)      NOT NULL,
    normal_range_min    NUMERIC(10,2)    NOT NULL,
    normal_range_max    NUMERIC(10,2)    NOT NULL,
    critical_low        NUMERIC(10,2),
    critical_high       NUMERIC(10,2),
    measured_at         TIMESTAMPTZ      NOT NULL,
    recorded_by         VARCHAR(150)     NOT NULL,
    notes               TEXT,
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. CARE_TEAMS (Clinicians & Community ASHA Workers)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.care_teams (
    care_team_id        SERIAL           PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    member_id           VARCHAR(64)      NOT NULL,
    member_name         VARCHAR(150)     NOT NULL,
    clinical_role       VARCHAR(50)      NOT NULL,
    contact_phone       VARCHAR(30),
    hospital_affil      VARCHAR(150)     DEFAULT 'AIIMS New Delhi',
    is_primary_contact  BOOLEAN          DEFAULT FALSE,
    assigned_date       TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. CARE_PLANS (The Computable Living Contract)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.care_plans (
    care_plan_id        VARCHAR(64)      PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    plan_title          VARCHAR(200)     NOT NULL,
    clinical_goals      TEXT             NOT NULL,
    start_date          DATE             NOT NULL,
    target_end_date     DATE,
    active_version      INT              DEFAULT 1,
    status              VARCHAR(20)      DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended', 'revised')),
    created_at          TIMESTAMPTZ      DEFAULT NOW(),
    updated_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. CARE_PLAN_VERSIONS (Version History & Clinician Approvals)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.care_plan_versions (
    version_id          SERIAL           PRIMARY KEY,
    care_plan_id        VARCHAR(64)      REFERENCES public.care_plans(care_plan_id) ON DELETE CASCADE,
    version_number      INT              NOT NULL,
    changes_summary     TEXT             NOT NULL,
    approved_by_doctor  VARCHAR(150)     NOT NULL,
    doctor_reg_number   VARCHAR(50)      NOT NULL,
    digital_signature   VARCHAR(512)     NOT NULL,
    approved_at         TIMESTAMPTZ      DEFAULT NOW(),
    UNIQUE (care_plan_id, version_number)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. CARE_CHECKPOINTS (Expected Actions, Targets & Due Windows)
-- Evaluated against 8 distinct statuses
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.care_checkpoints (
    checkpoint_id       VARCHAR(64)      PRIMARY KEY,
    care_plan_id        VARCHAR(64)      REFERENCES public.care_plans(care_plan_id) ON DELETE CASCADE,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    metric_name         VARCHAR(100)     NOT NULL,
    expected_range_min  NUMERIC(10,2),
    expected_range_max  NUMERIC(10,2),
    expected_units      VARCHAR(30),
    measurement_freq    VARCHAR(50)      NOT NULL,
    due_date            TIMESTAMPTZ      NOT NULL,
    grace_period_hours  INT              DEFAULT 24,
    evaluation_status   VARCHAR(30)      DEFAULT 'Due soon' CHECK (evaluation_status IN (
                            'On track',
                            'Due soon',
                            'Overdue',
                            'Outside expected range',
                            'Worsening trend',
                            'Conflicting data',
                            'Insufficient evidence',
                            'Resolved'
                        )),
    last_evaluated_at   TIMESTAMPTZ,
    evaluation_notes    TEXT,
    clinician_decision  TEXT,
    decided_by          VARCHAR(150),
    decided_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supabase_checkpoints_patient ON public.care_checkpoints(patient_id, evaluation_status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. OBSERVATIONS (Actual Health Telemetry & Provenance)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.observations (
    observation_id      BIGSERIAL        PRIMARY KEY,
    checkpoint_id       VARCHAR(64)      REFERENCES public.care_checkpoints(checkpoint_id),
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    observation_type    VARCHAR(50)      NOT NULL,
    telemetry_json      JSONB            NOT NULL,
    source              VARCHAR(40)      NOT NULL CHECK (source IN (
                            'Patient-reported',
                            'Clinician-entered',
                            'Connected Device',
                            'Diagnostic Lab',
                            'ASHA Telemetry'
                        )),
    recorded_at         TIMESTAMPTZ      NOT NULL,
    is_validated        BOOLEAN          DEFAULT TRUE,
    validated_by        VARCHAR(150),
    device_id           VARCHAR(100),
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supabase_obs_patient_time ON public.observations(patient_id, recorded_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. SYMPTOM_REPORTS (Patient-Reported & ASHA-Screened Symptoms)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.symptom_reports (
    symptom_id          BIGSERIAL        PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    symptom_name        VARCHAR(100)     NOT NULL,
    severity_score      SMALLINT         NOT NULL CHECK (severity_score BETWEEN 1 AND 10),
    onset_timestamp     TIMESTAMPTZ      NOT NULL,
    duration_hours      NUMERIC(6,2),
    is_escalation_flag  BOOLEAN          DEFAULT FALSE,
    patient_notes       TEXT,
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. MEDICATIONS (Clinician-Approved Prescriptions)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medications (
    medication_id       SERIAL           PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    drug_name           VARCHAR(150)     NOT NULL,
    generic_name        VARCHAR(150),
    dosage              VARCHAR(50)      NOT NULL,
    route               VARCHAR(30)      DEFAULT 'Oral',
    frequency           VARCHAR(50)      NOT NULL,
    instructions        TEXT,
    prescribing_doctor  VARCHAR(150)     NOT NULL,
    start_date          DATE             NOT NULL,
    end_date            DATE,
    is_active           BOOLEAN          DEFAULT TRUE,
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. MEDICATION_LOGS (Adherence Reports)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.medication_logs (
    log_id              BIGSERIAL        PRIMARY KEY,
    medication_id       INT              REFERENCES public.medications(medication_id) ON DELETE CASCADE,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id),
    scheduled_time      TIMESTAMPTZ      NOT NULL,
    taken_time          TIMESTAMPTZ,
    adherence_status    VARCHAR(30)      NOT NULL CHECK (adherence_status IN (
                            'Taken on time',
                            'Taken delayed',
                            'Missed',
                            'Skipped - side effect',
                            'Refused'
                        )),
    reason_missed       TEXT,
    recorded_source     VARCHAR(40)      DEFAULT 'Patient-reported',
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. TASKS (Follow-up Activities & Milestones)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
    task_id             VARCHAR(64)      PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    task_title          VARCHAR(200)     NOT NULL,
    task_category       VARCHAR(50)      NOT NULL,
    assigned_to_role    VARCHAR(50)      NOT NULL,
    due_date            TIMESTAMPTZ      NOT NULL,
    completed_date      TIMESTAMPTZ,
    task_status         VARCHAR(20)      DEFAULT 'pending' CHECK (task_status IN ('pending', 'completed', 'overdue', 'cancelled')),
    notes               TEXT,
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. DEVIATIONS (Variance & XGBoost ML Scoring)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deviations (
    deviation_id        BIGSERIAL        PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    checkpoint_id       VARCHAR(64)      REFERENCES public.care_checkpoints(checkpoint_id),
    metric_name         VARCHAR(100)     NOT NULL,
    expected_value      NUMERIC(10,2),
    actual_value        NUMERIC(10,2),
    absolute_delta      NUMERIC(10,2),
    percentage_variance NUMERIC(6,2),
    xgboost_risk_score  NUMERIC(5,2)     NOT NULL CHECK (xgboost_risk_score BETWEEN 0.00 AND 100.00),
    confidence_interval NUMERIC(4,3)     DEFAULT 0.950,
    computed_at         TIMESTAMPTZ      DEFAULT NOW(),
    feature_vector_json JSONB
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. ALERTS (Urgency Worklist & Three-Source AI Labelling)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
    alert_id            VARCHAR(64)      PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    checkpoint_id       VARCHAR(64)      REFERENCES public.care_checkpoints(checkpoint_id),
    severity            VARCHAR(20)      NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    alert_type          VARCHAR(100)     NOT NULL,
    title               VARCHAR(200)     NOT NULL,
    ai_source           VARCHAR(30)      NOT NULL CHECK (ai_source IN ('rule-based', 'ml-pattern', 'llm-explanation')),
    rule_trigger        TEXT,
    ml_pattern          TEXT,
    llm_explanation     TEXT             NOT NULL,
    status              VARCHAR(20)      DEFAULT 'active' CHECK (status IN ('active', 'reviewed', 'dismissed', 'resolved')),
    review_decision     TEXT,
    reviewed_by         VARCHAR(150),
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supabase_alerts_status_sev ON public.alerts(status, severity, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. INTERVENTIONS (Actions Taken & Clinical Outcomes)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.interventions (
    intervention_id     VARCHAR(64)      PRIMARY KEY,
    alert_id            VARCHAR(64)      REFERENCES public.alerts(alert_id),
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id),
    clinician_name      VARCHAR(150)     NOT NULL,
    clinician_role      VARCHAR(50)      NOT NULL,
    action_type         VARCHAR(50)      NOT NULL,
    action_summary      TEXT             NOT NULL,
    outcome_status      VARCHAR(30)      DEFAULT 'Monitoring' CHECK (outcome_status IN ('Monitoring', 'Stabilized', 'Readmitted', 'Resolved')),
    follow_up_date      DATE,
    executed_at         TIMESTAMPTZ      DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. AUDIT_EVENTS (Immutable Audit Ledger)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_events (
    event_id            BIGSERIAL        PRIMARY KEY,
    timestamp           TIMESTAMPTZ      DEFAULT NOW(),
    user_id             VARCHAR(64)      NOT NULL,
    user_name           VARCHAR(150)     NOT NULL,
    user_role           VARCHAR(50)      NOT NULL,
    action              VARCHAR(50)      NOT NULL,
    resource_type       VARCHAR(50)      NOT NULL,
    resource_id         VARCHAR(64)      NOT NULL,
    ip_address          VARCHAR(45)      DEFAULT '127.0.0.1',
    user_agent          VARCHAR(255),
    signature_hash      VARCHAR(128)     NOT NULL,
    event_metadata      JSONB
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. CONSENTS (ABDM Consent Artifact & Permitted Data Use)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.consents (
    consent_id          VARCHAR(64)      PRIMARY KEY,
    patient_id          VARCHAR(64)      REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    abdm_artifact_id    VARCHAR(128)     NOT NULL UNIQUE,
    purpose_code        VARCHAR(20)      DEFAULT 'CAREMGT',
    data_types_permitted VARCHAR(500)    NOT NULL,
    granted_date        TIMESTAMPTZ      NOT NULL,
    expiry_date         TIMESTAMPTZ      NOT NULL,
    consent_status      VARCHAR(20)      DEFAULT 'GRANTED' CHECK (consent_status IN ('GRANTED', 'REVOKED', 'EXPIRED')),
    revoked_at          TIMESTAMPTZ,
    revocation_reason   TEXT,
    created_at          TIMESTAMPTZ      DEFAULT NOW()
);

-- ============================================================================
-- SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated users full access for hackathon / demo usage
CREATE POLICY "Public read patients" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Public insert/update patients" ON public.patients FOR ALL USING (true);

CREATE POLICY "Public read care_checkpoints" ON public.care_checkpoints FOR SELECT USING (true);
CREATE POLICY "Public write care_checkpoints" ON public.care_checkpoints FOR ALL USING (true);

CREATE POLICY "Public read observations" ON public.observations FOR SELECT USING (true);
CREATE POLICY "Public insert observations" ON public.observations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read alerts" ON public.alerts FOR SELECT USING (true);
CREATE POLICY "Public write alerts" ON public.alerts FOR ALL USING (true);

CREATE POLICY "Public read audit_events" ON public.audit_events FOR SELECT USING (true);
CREATE POLICY "Public insert audit_events" ON public.audit_events FOR INSERT WITH CHECK (true);

-- ============================================================================
-- SEED DATA (Starter Cohort)
-- ============================================================================
INSERT INTO public.patients (patient_id, abha_id, full_name, date_of_birth, gender, blood_group, mobile_number, email, primary_disease, current_risk_score, compliance_rate, discharge_date)
VALUES
('P-1001', '91-4521-8890-1001', 'Ramesh Patel', '1968-04-12', 'Male', 'B+', '+91-98765-43210', 'ramesh.patel@example.com', 'Hypertension', 86.4, 78.5, NOW() - INTERVAL '14 days'),
('P-1002', '91-8832-1144-1002', 'Sunita Sharma', '1974-09-23', 'Female', 'O+', '+91-98765-43211', 'sunita.sharma@example.com', 'Type 2 Diabetes', 74.2, 85.0, NOW() - INTERVAL '28 days'),
('P-1003', '91-3321-9988-1003', 'Amit Kumar Verma', '1959-11-05', 'Male', 'A+', '+91-98765-43212', 'amit.verma@example.com', 'Coronary Artery Disease', 91.8, 62.0, NOW() - INTERVAL '10 days'),
('P-1004', '91-7712-4455-1004', 'Lakshmi Iyer', '1965-02-18', 'Female', 'AB+', '+91-98765-43213', 'lakshmi.iyer@example.com', 'Chronic Kidney Disease', 82.5, 88.0, NOW() - INTERVAL '35 days'),
('P-1005', '91-6655-2233-1005', 'Mohammad Irfan', '1982-08-30', 'Male', 'O-', '+91-98765-43214', 'mohammad.irfan@example.com', 'Tuberculosis', 68.0, 94.0, NOW() - INTERVAL '45 days'),
('P-1006', '91-9988-7766-1006', 'Kavita Sundaram', '1955-06-14', 'Female', 'B-', '+91-98765-43215', 'kavita.sundaram@example.com', 'Stroke Recovery', 79.1, 71.0, NOW() - INTERVAL '21 days'),
('P-1007', '91-5544-3322-1007', 'Arjun Sengupta', '1992-12-03', 'Male', 'A-', '+91-98765-43216', 'arjun.sengupta@example.com', 'Depression', 65.3, 82.0, NOW() - INTERVAL '18 days')
ON CONFLICT (patient_id) DO NOTHING;

INSERT INTO public.care_plans (care_plan_id, patient_id, plan_title, clinical_goals, start_date, status)
VALUES
('CP-1001', 'P-1001', 'Post-Discharge Hypertension Hemodynamic Protocol', 'Maintain BP < 130/80 mmHg; ensure 100% adherence to Amlodipine 5mg; daily morning seated reading.', CURRENT_DATE - INTERVAL '14 days', 'active'),
('CP-1002', 'P-1002', 'Glycemic Stabilization & Microvascular Protection', 'Maintain fasting BG 80-120 mg/dL; HbA1c < 7.0%; daily foot inspection.', CURRENT_DATE - INTERVAL '28 days', 'active')
ON CONFLICT (care_plan_id) DO NOTHING;

INSERT INTO public.care_checkpoints (checkpoint_id, care_plan_id, patient_id, metric_name, expected_range_min, expected_range_max, expected_units, measurement_freq, due_date, evaluation_status, evaluation_notes)
VALUES
('CK-1001-01', 'CP-1001', 'P-1001', 'Morning Resting Blood Pressure', 110.0, 130.0, 'mmHg', 'Daily (Morning)', NOW() + INTERVAL '4 hours', 'Outside expected range', 'Latest actual BP 148/94 mmHg exceeds approved upper limit (130 mmHg). Medication adherence gap flagged.'),
('CK-1002-01', 'CP-1002', 'P-1002', 'Fasting Blood Glucose', 80.0, 120.0, 'mg/dL', 'Daily (Pre-breakfast)', NOW() + INTERVAL '6 hours', 'On track', 'Fasting BG 112 mg/dL within target range. Compliant with morning Metformin.')
ON CONFLICT (checkpoint_id) DO NOTHING;

INSERT INTO public.alerts (alert_id, patient_id, checkpoint_id, severity, alert_type, title, ai_source, rule_trigger, ml_pattern, llm_explanation, status)
VALUES
('ALT-1001', 'P-1001', 'CK-1001-01', 'critical', 'HEMODYNAMIC_DEVIATION', 'Sustained Systolic BP Spike with Missed Amlodipine Dose', 'rule-based', 'BP > 140/90 mmHg for 2 consecutive readings', 'XGBoost Risk Score 86.4% (Confidence 0.96)', 'Patient Ramesh Patel recorded BP of 148/94 mmHg alongside a reported missed morning dosage. Non-linear variance from baseline indicates accelerated deterioration risk. Recommend tele-consultation and adherence reinforcement.', 'active')
ON CONFLICT (alert_id) DO NOTHING;

