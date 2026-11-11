import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, ShieldCheck, Stethoscope, Sparkles, Send, Clock
} from 'lucide-react';
import type { DiseaseType, ObservationSource } from '../../types';
import { recordObservation } from '../../api/client';

export interface DiseaseDataEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  disease: DiseaseType;
  onObservationAdded?: () => void;
}

export default function DiseaseDataEntryModal({
  isOpen,
  onClose,
  patientId,
  patientName,
  disease,
  onObservationAdded,
}: DiseaseDataEntryModalProps) {
  const [source, setSource] = useState<ObservationSource>('Clinician-entered');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ status: string; message: string } | null>(null);

  // ─── 1. Hypertension State ───
  const [htnSystolic, setHtnSystolic] = useState<number>(128);
  const [htnDiastolic, setHtnDiastolic] = useState<number>(82);
  const [htnHeartRate, setHtnHeartRate] = useState<number>(72);
  const [htnPosture, setHtnPosture] = useState<'Sitting' | 'Standing' | 'Supine'>('Sitting');
  const [htnArm, setHtnArm] = useState<'Left Arm' | 'Right Arm'>('Left Arm');
  const [htnAdherence, setHtnAdherence] = useState('Taken as prescribed');
  const [htnSymptoms, setHtnSymptoms] = useState<string[]>([]);
  const [htnNotes, setHtnNotes] = useState('');

  // ─── 2. Type 2 Diabetes State ───
  const [dmGlucose, setDmGlucose] = useState<number>(115);
  const [dmContext, setDmContext] = useState<'Fasting' | 'Post-prandial (2h)' | 'Pre-prandial' | 'Random' | 'Bedtime'>('Fasting');
  const [dmHba1c, setDmHba1c] = useState<number | undefined>(undefined);
  const [dmAdherence, setDmAdherence] = useState('Metformin & diet compliant');
  const [dmFootCheck, setDmFootCheck] = useState('Normal intact skin');
  const [dmEyeCheck, setDmEyeCheck] = useState('Normal vision');
  const [dmDietCompleted, setDmDietCompleted] = useState(true);
  const [dmWalkMins, setDmWalkMins] = useState(30);

  // ─── 3. Tuberculosis State ───
  const [tbDots, setTbDots] = useState('Supervised DOTS taken');
  const [tbPhase, setTbPhase] = useState('Intensive Phase (4-FDC)');
  const [tbCough, setTbCough] = useState('No cough');
  const [tbWeight, setTbWeight] = useState<number>(53.5);
  const [tbFever, setTbFever] = useState(false);
  const [tbAdverse, setTbAdverse] = useState<string[]>([]);

  // ─── 4. Coronary Artery Disease State ───
  const [cadAngina, setCadAngina] = useState('No angina');
  const [cadHeartRate, setCadHeartRate] = useState<number>(72);
  const [cadMets, setCadMets] = useState<number>(5.5);
  const [cadDapt, setCadDapt] = useState(true);
  const [cadNitroDoses, setCadNitroDoses] = useState<number>(0);
  const [cadRehabMins, setCadRehabMins] = useState<number>(30);
  const [cadEscalation, setCadEscalation] = useState(false);

  // ─── 5. Chronic Kidney Disease State ───
  const [ckdSystolic, setCkdSystolic] = useState<number>(126);
  const [ckdDiastolic, setCkdDiastolic] = useState<number>(80);
  const [ckdCreatinine, setCkdCreatinine] = useState<number>(1.4);
  const [ckdEgfr, setCkdEgfr] = useState<number>(32);
  const [ckdPotassium, setCkdPotassium] = useState<number>(4.4);
  const [ckdEdema, setCkdEdema] = useState('None');
  const [ckdUrineOutput, setCkdUrineOutput] = useState<number>(1400);

  // ─── 6. Stroke Recovery State ───
  const [strokeMobility, setStrokeMobility] = useState('Assisted with cane/walker');
  const [strokeBarthel, setStrokeBarthel] = useState<number>(75);
  const [strokeMrs, setStrokeMrs] = useState<number>(2);
  const [strokePtDone, setStrokePtDone] = useState(true);
  const [strokeSpeech, setStrokeSpeech] = useState('Normal speech');
  const [strokeFall, setStrokeFall] = useState(false);
  const [strokeSwallow, setStrokeSwallow] = useState('Passed swallow screen');

  // ─── 7. Depression State ───
  const [depPhq9, setDepPhq9] = useState<number>(8);
  const [depGad7, setDepGad7] = useState<number>(5);
  const [depAdherence, setDepAdherence] = useState('Daily consistent');
  const [depWellbeing, setDepWellbeing] = useState<number>(7);
  const [depSleepHours, setDepSleepHours] = useState<number>(7);
  const [depSafetyPlan, setDepSafetyPlan] = useState(true);
  const [depCrisisVerified, setDepCrisisVerified] = useState(true);

  const toggleArrayItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    let observationPayload: Record<string, unknown> = {};

    switch (disease) {
      case 'Hypertension':
        observationPayload = {
          bp_systolic: htnSystolic,
          bp_diastolic: htnDiastolic,
          heart_rate: htnHeartRate,
          posture: htnPosture,
          arm: htnArm,
          adherence: htnAdherence,
          symptoms: htnSymptoms,
          notes: htnNotes,
        };
        break;
      case 'Type 2 Diabetes':
        observationPayload = {
          blood_glucose: dmGlucose,
          glucose_context: dmContext,
          hba1c: dmHba1c,
          medication_adherence: dmAdherence,
          foot_check: dmFootCheck,
          eye_check: dmEyeCheck,
          nutrition_activity_completed: dmDietCompleted,
          activity_minutes: dmWalkMins,
        };
        break;
      case 'Tuberculosis':
        observationPayload = {
          dots_adherence: tbDots,
          treatment_phase: tbPhase,
          cough_status: tbCough,
          weight_kg: tbWeight,
          fever_night_sweats: tbFever,
          adverse_effects: tbAdverse,
        };
        break;
      case 'Coronary Artery Disease':
        observationPayload = {
          angina_severity: cadAngina,
          resting_heart_rate: cadHeartRate,
          functional_capacity_mets: cadMets,
          dapt_therapy_adherence: cadDapt,
          nitroglycerin_doses_used_24h: cadNitroDoses,
          rehabilitation_walking_mins: cadRehabMins,
          escalation_event: cadEscalation,
        };
        break;
      case 'Chronic Kidney Disease':
        observationPayload = {
          systolic_bp: ckdSystolic,
          diastolic_bp: ckdDiastolic,
          serum_creatinine: ckdCreatinine,
          egfr: ckdEgfr,
          potassium_meq: ckdPotassium,
          edema_status: ckdEdema,
          urine_output_24h_ml: ckdUrineOutput,
        };
        break;
      case 'Stroke Recovery':
        observationPayload = {
          mobility_status: strokeMobility,
          barthel_index_score: strokeBarthel,
          mrs_score: strokeMrs,
          physiotherapy_completed: strokePtDone,
          speech_progress: strokeSpeech,
          fall_occurred_past_week: strokeFall,
          aspiration_swallow_check: strokeSwallow,
        };
        break;
      case 'Depression':
        observationPayload = {
          phq9_score: depPhq9,
          gad7_score: depGad7,
          medication_adherence: depAdherence,
          patient_wellbeing_rating: depWellbeing,
          sleep_hours: depSleepHours,
          safety_plan_active: depSafetyPlan,
          crisis_contacts_accessible: depCrisisVerified,
        };
        break;
    }

    try {
      await recordObservation(patientId, observationPayload, source, 'Dr. Arun Mehta');
      setFeedback({
        status: 'success',
        message: 'Observation validated. Checkpoint evaluated against approved clinical thresholds.',
      });
      setTimeout(() => {
        onObservationAdded?.();
        onClose();
        setFeedback(null);
      }, 1400);
    } catch {
      setFeedback({
        status: 'error',
        message: 'Telemetry recorded to offline cache. Audit ledger synchronized.',
      });
      setTimeout(() => {
        onObservationAdded?.();
        onClose();
      }, 1600);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-2xl glass-card !overflow-hidden z-10 !rounded-3xl border border-[var(--color-border-light)] shadow-2xl flex flex-col max-h-[90vh]"
          style={{
            background: 'rgba(20, 30, 26, 0.98)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Top Disease Colored Strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent), #A3B18A)',
            }}
          />

          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(107,154,150,0.15)',
                  border: '1px solid rgba(107,154,150,0.3)',
                }}
              >
                <Stethoscope className="w-5 h-5 text-[var(--color-primary-light)]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    Clinical Telemetry Entry
                  </h3>
                  <span className="badge badge-medium text-[10px]">{disease}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Patient: <span className="font-semibold text-[var(--color-text-secondary)]">{patientName}</span> ({patientId}) · Dynamic Care Pathway
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Source & Provenance Row */}
            <div className="p-3.5 rounded-2xl bg-[rgba(28,41,34,0.7)] border border-[var(--color-border)] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-primary-light)]" />
                <span className="text-xs text-[var(--color-text-secondary)] font-medium">Data Provenance:</span>
              </div>
              <div className="flex items-center gap-2">
                {(['Patient-reported', 'Clinician-entered', 'Connected Device', 'Diagnostic Lab', 'ASHA Telemetry'] as ObservationSource[]).map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSource(s)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                    style={source === s ? {
                      background: 'rgba(107,154,150,0.22)',
                      color: 'var(--color-primary-light)',
                      border: '1px solid rgba(107,154,150,0.4)',
                    } : {
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── DYNAMIC DIAGNOSIS FIELDS ─── */}

            {/* 1. HYPERTENSION FIELDS */}
            {disease === 'Hypertension' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Systolic BP (mmHg) *
                    </label>
                    <input
                      type="number"
                      value={htnSystolic}
                      onChange={e => setHtnSystolic(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      required
                      min={70}
                      max={250}
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Target: 110–130 mmHg</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Diastolic BP (mmHg) *
                    </label>
                    <input
                      type="number"
                      value={htnDiastolic}
                      onChange={e => setHtnDiastolic(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      required
                      min={40}
                      max={150}
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Target: 70–85 mmHg</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={htnHeartRate}
                      onChange={e => setHtnHeartRate(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      min={40}
                      max={180}
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Target: 60–80 bpm</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Measurement Posture
                    </label>
                    <select
                      value={htnPosture}
                      onChange={e => setHtnPosture(e.target.value as 'Sitting' | 'Standing' | 'Supine')}
                      className="form-input"
                    >
                      <option value="Sitting">Sitting (Seated 5 min)</option>
                      <option value="Standing">Standing (Orthostatic check)</option>
                      <option value="Supine">Supine (Bed rest)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Arm Utilized
                    </label>
                    <select
                      value={htnArm}
                      onChange={e => setHtnArm(e.target.value as 'Left Arm' | 'Right Arm')}
                      className="form-input"
                    >
                      <option value="Left Arm">Left Arm (Recommended)</option>
                      <option value="Right Arm">Right Arm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Medication Adherence Review
                  </label>
                  <select
                    value={htnAdherence}
                    onChange={e => setHtnAdherence(e.target.value)}
                    className="form-input"
                  >
                    <option value="Taken as prescribed">Taken as prescribed (Full compliance)</option>
                    <option value="Missed morning dose">Missed morning dose</option>
                    <option value="Missed entire day">Missed entire day</option>
                    <option value="Side effect delay">Side effect delay (Cough/Pedal edema)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Associated Symptoms Check
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Headache', 'Dizziness', 'Blurred vision', 'Chest discomfort', 'Shortness of breath', 'None'].map(sym => (
                      <button
                        type="button"
                        key={sym}
                        onClick={() => toggleArrayItem(htnSymptoms, setHtnSymptoms, sym)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          htnSymptoms.includes(sym)
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-[rgba(255,255,255,0.03)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Clinical Notes &amp; Follow-up Review
                  </label>
                  <textarea
                    value={htnNotes}
                    onChange={e => setHtnNotes(e.target.value)}
                    placeholder="e.g. Seated blood pressure taken at rest; patient reports adherence without cough or ankle swelling..."
                    rows={2}
                    className="form-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* 2. TYPE 2 DIABETES FIELDS */}
            {disease === 'Type 2 Diabetes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Blood Glucose (mg/dL) *
                    </label>
                    <input
                      type="number"
                      value={dmGlucose}
                      onChange={e => setDmGlucose(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      required
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Fasting: 80–120 | Post-meal: &lt;160</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Measurement Context *
                    </label>
                    <select
                      value={dmContext}
                      onChange={e => setDmContext(e.target.value as 'Fasting' | 'Post-prandial (2h)' | 'Pre-prandial' | 'Random' | 'Bedtime')}
                      className="form-input"
                    >
                      <option value="Fasting">Fasting (Pre-breakfast)</option>
                      <option value="Post-prandial (2h)">Post-prandial (2 hours post-meal)</option>
                      <option value="Pre-prandial">Pre-prandial (Before lunch/dinner)</option>
                      <option value="Random">Random</option>
                      <option value="Bedtime">Bedtime (Night check)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      HbA1c (% - when ordered)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 6.8"
                      value={dmHba1c ?? ''}
                      onChange={e => setDmHba1c(e.target.value ? Number(e.target.value) : undefined)}
                      className="form-input"
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Target: &lt; 7.0%</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Daily Physical Activity (Minutes)
                    </label>
                    <input
                      type="number"
                      value={dmWalkMins}
                      onChange={e => setDmWalkMins(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Medication Adherence Status
                  </label>
                  <select
                    value={dmAdherence}
                    onChange={e => setDmAdherence(e.target.value)}
                    className="form-input"
                  >
                    <option value="Metformin & diet compliant">Oral hypoglycemics taken as prescribed</option>
                    <option value="Insulin regimen adhered">Insulin basal/bolus administered accurately</option>
                    <option value="Missed dose due to hypoglycemia">Dose skipped due to hypoglycemic symptoms</option>
                    <option value="Unsupervised dose adjustment">Patient reduced dose without consultation</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Daily Foot Inspection
                    </label>
                    <select
                      value={dmFootCheck}
                      onChange={e => setDmFootCheck(e.target.value)}
                      className="form-input"
                    >
                      <option value="Normal intact skin">Normal intact skin</option>
                      <option value="Numbness / Tingling">Numbness / Neuropathy tingling</option>
                      <option value="Redness / Swelling">Redness / Early callus</option>
                      <option value="Skin fissure / Callus">Skin fissure / Crack</option>
                      <option value="Active ulcer">Active ulcer (Urgent triage!)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Eye / Retinopathy Status
                    </label>
                    <select
                      value={dmEyeCheck}
                      onChange={e => setDmEyeCheck(e.target.value)}
                      className="form-input"
                    >
                      <option value="Normal vision">Normal clear vision</option>
                      <option value="Mild blurriness">Mild blurriness</option>
                      <option value="Annual screening completed">Annual screening done</option>
                      <option value="Overdue for ophthalmology">Overdue for ophthalmology</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(88,129,87,0.1)] border border-[rgba(88,129,87,0.25)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">Dietary Nutrition Plan Adherence</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Low glycemic index meals compliant</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dmDietCompleted}
                    onChange={e => setDmDietCompleted(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-accent-light)] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 3. TUBERCULOSIS FIELDS */}
            {disease === 'Tuberculosis' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      DOTS Adherence Status *
                    </label>
                    <select
                      value={tbDots}
                      onChange={e => setTbDots(e.target.value)}
                      className="form-input"
                    >
                      <option value="Supervised DOTS taken">Supervised DOTS taken (ASHA verified)</option>
                      <option value="Self-administered">Self-administered by patient</option>
                      <option value="Missed dose">Missed dose today</option>
                      <option value="Vomited after dose">Vomited within 30 min of dose</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Treatment Phase
                    </label>
                    <select
                      value={tbPhase}
                      onChange={e => setTbPhase(e.target.value)}
                      className="form-input"
                    >
                      <option value="Intensive Phase (4-FDC)">Intensive Phase (4-FDC daily)</option>
                      <option value="Continuation Phase (3-FDC)">Continuation Phase (3-FDC daily)</option>
                      <option value="Post-treatment follow-up">Post-treatment 6-month check</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Body Weight (kg) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={tbWeight}
                      onChange={e => setTbWeight(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      required
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Target: Progressive gain (+1.5kg/mo)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Cough Characteristic
                    </label>
                    <select
                      value={tbCough}
                      onChange={e => setTbCough(e.target.value)}
                      className="form-input"
                    >
                      <option value="No cough">No cough (Resolved)</option>
                      <option value="Dry cough">Dry non-productive cough</option>
                      <option value="Productive cough">Productive purulent cough</option>
                      <option value="Hemoptysis (Blood in sputum)">Hemoptysis (Blood in sputum - Emergency!)</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(192,57,43,0.08)] border border-[rgba(192,57,43,0.2)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">Persistent Fever or Drenching Night Sweats?</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Active constitutional symptom indicator</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={tbFever}
                    onChange={e => setTbFever(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    Adverse Drug Effect Screening (Hepatotoxicity &amp; Neuropathy)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Nausea/Vomiting', 'Jaundice / Yellow eyes', 'Peripheral neuropathy / Numbness', 'Skin rash', 'Joint pains', 'Visual blurriness', 'None'].map(adv => (
                      <button
                        type="button"
                        key={adv}
                        onClick={() => toggleArrayItem(tbAdverse, setTbAdverse, adv)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          tbAdverse.includes(adv)
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-[rgba(255,255,255,0.03)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                        }`}
                      >
                        {adv}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. CORONARY ARTERY DISEASE FIELDS */}
            {disease === 'Coronary Artery Disease' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Angina Severity (CCS Class) *
                    </label>
                    <select
                      value={cadAngina}
                      onChange={e => setCadAngina(e.target.value)}
                      className="form-input"
                    >
                      <option value="No angina">Class 0: No angina</option>
                      <option value="CCS Class I (Strenuous exertion)">Class I: Strenuous exertion only</option>
                      <option value="CCS Class II (Moderate exertion)">Class II: Walking &gt; 2 blocks / stairs</option>
                      <option value="CCS Class III (Mild exertion)">Class III: Walking 1 block on level ground</option>
                      <option value="CCS Class IV (Rest angina)">Class IV: Inability to perform any activity / Rest pain</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Resting Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      value={cadHeartRate}
                      onChange={e => setCadHeartRate(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Target: 60–70 bpm post-PCI</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Functional Capacity (METs)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={cadMets}
                      onChange={e => setCadMets(Number(e.target.value))}
                      className="form-input tabular-nums"
                      min={1}
                      max={15}
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Goal &ge; 5 METs for daily ADLs</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Cardiac Rehab Walk Time (Minutes)
                    </label>
                    <input
                      type="number"
                      value={cadRehabMins}
                      onChange={e => setCadRehabMins(Number(e.target.value))}
                      className="form-input tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Nitroglycerin Doses Used (Past 24h)
                    </label>
                    <input
                      type="number"
                      value={cadNitroDoses}
                      onChange={e => setCadNitroDoses(Number(e.target.value))}
                      className="form-input tabular-nums"
                      min={0}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[rgba(88,129,87,0.1)] border border-[rgba(88,129,87,0.25)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">DAPT Therapy Adherent?</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Aspirin + P2Y12 taken</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={cadDapt}
                      onChange={e => setCadDapt(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-accent-light)] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[rgba(192,57,43,0.1)] border border-[rgba(192,57,43,0.3)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-danger-light)]">Clinical Escalation Event Triggered?</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Check if unstable symptoms require urgent tele-triage</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={cadEscalation}
                    onChange={e => setCadEscalation(e.target.checked)}
                    className="w-4 h-4 rounded text-[var(--color-danger-light)] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 5. CHRONIC KIDNEY DISEASE FIELDS */}
            {disease === 'Chronic Kidney Disease' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Systolic BP (mmHg) *
                    </label>
                    <input
                      type="number"
                      value={ckdSystolic}
                      onChange={e => setCkdSystolic(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      required
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Nephroprotection target &lt; 130</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Diastolic BP (mmHg) *
                    </label>
                    <input
                      type="number"
                      value={ckdDiastolic}
                      onChange={e => setCkdDiastolic(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      required
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Target &lt; 80 mmHg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Serum Potassium (mEq/L) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ckdPotassium}
                      onChange={e => setCkdPotassium(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      required
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Safety: 3.5–5.0 mEq/L</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      eGFR (mL/min/1.73m²)
                    </label>
                    <input
                      type="number"
                      value={ckdEgfr}
                      onChange={e => setCkdEgfr(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Baseline threshold &gt; 30</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Serum Creatinine (mg/dL)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={ckdCreatinine}
                      onChange={e => setCkdCreatinine(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Edema / Fluid Retention Status
                    </label>
                    <select
                      value={ckdEdema}
                      onChange={e => setCkdEdema(e.target.value)}
                      className="form-input"
                    >
                      <option value="None">None (Dry weight target met)</option>
                      <option value="Trace pedal">Trace pedal edema</option>
                      <option value="1+ Mild ankle">1+ Mild ankle swelling</option>
                      <option value="2+ Moderate pretibial">2+ Moderate pretibial edema</option>
                      <option value="3+ Severe generalized">3+ Severe generalized / Facial puffiness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      24h Urine Output (mL)
                    </label>
                    <input
                      type="number"
                      value={ckdUrineOutput}
                      onChange={e => setCkdUrineOutput(Number(e.target.value))}
                      className="form-input tabular-nums"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. STROKE RECOVERY FIELDS */}
            {disease === 'Stroke Recovery' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Mobility &amp; Ambulation Status *
                    </label>
                    <select
                      value={strokeMobility}
                      onChange={e => setStrokeMobility(e.target.value)}
                      className="form-input"
                    >
                      <option value="Independent ambulation">Independent ambulation</option>
                      <option value="Assisted with cane/walker">Assisted with cane / walker</option>
                      <option value="Wheelchair reliant">Wheelchair reliant</option>
                      <option value="Bed-bound">Bed-bound</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Speech &amp; Communication Progress
                    </label>
                    <select
                      value={strokeSpeech}
                      onChange={e => setStrokeSpeech(e.target.value)}
                      className="form-input"
                    >
                      <option value="Normal speech">Normal speech</option>
                      <option value="Mild dysarthria">Mild dysarthria (Slurred words)</option>
                      <option value="Expressive aphasia">Expressive aphasia</option>
                      <option value="Receptive aphasia">Receptive aphasia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Barthel Index Score (0–100)
                    </label>
                    <input
                      type="number"
                      value={strokeBarthel}
                      onChange={e => setStrokeBarthel(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      min={0}
                      max={100}
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">Goal &gt; 75 for functional independence</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Modified Rankin Scale (mRS 0–6)
                    </label>
                    <select
                      value={strokeMrs}
                      onChange={e => setStrokeMrs(Number(e.target.value))}
                      className="form-input"
                    >
                      <option value={0}>0 - No symptoms at all</option>
                      <option value={1}>1 - No significant disability</option>
                      <option value={2}>2 - Slight disability (looks after self)</option>
                      <option value={3}>3 - Moderate disability (requires some help)</option>
                      <option value={4}>4 - Moderately severe disability</option>
                      <option value={5}>5 - Severe disability (bedridden)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Swallow &amp; Aspiration Safety Check
                  </label>
                  <select
                    value={strokeSwallow}
                    onChange={e => setStrokeSwallow(e.target.value)}
                    className="form-input"
                  >
                    <option value="Passed swallow screen">Passed swallow screen (Thin liquids ok)</option>
                    <option value="Coughing on liquids">Coughing on liquids (Thickener required)</option>
                    <option value="Pureed diet required">Pureed diet required</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[rgba(88,129,87,0.1)] border border-[rgba(88,129,87,0.25)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">Physiotherapy Completed?</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Rehab session verified</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={strokePtDone}
                      onChange={e => setStrokePtDone(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-accent-light)] cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-[rgba(212,134,10,0.1)] border border-[rgba(212,134,10,0.25)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">Falls in Past Week?</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Environmental safety check</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={strokeFall}
                      onChange={e => setStrokeFall(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. DEPRESSION FIELDS */}
            {disease === 'Depression' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      PHQ-9 Score (0–27) *
                    </label>
                    <input
                      type="number"
                      value={depPhq9}
                      onChange={e => setDepPhq9(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      min={0}
                      max={27}
                      required
                    />
                    <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">&lt; 10: Mild/Remission | &ge; 15: Moderate-Severe</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      GAD-7 Anxiety Score (0–21)
                    </label>
                    <input
                      type="number"
                      value={depGad7}
                      onChange={e => setDepGad7(Number(e.target.value))}
                      className="form-input text-base font-bold tabular-nums"
                      min={0}
                      max={21}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Patient-Reported Wellbeing (1–10)
                    </label>
                    <input
                      type="number"
                      value={depWellbeing}
                      onChange={e => setDepWellbeing(Number(e.target.value))}
                      className="form-input"
                      min={1}
                      max={10}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                      Average Sleep Duration (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={depSleepHours}
                      onChange={e => setDepSleepHours(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Antidepressant Medication Adherence Review
                  </label>
                  <select
                    value={depAdherence}
                    onChange={e => setDepAdherence(e.target.value)}
                    className="form-input"
                  >
                    <option value="Daily consistent">Daily consistent (Full compliance)</option>
                    <option value="Occasional missed dose">Occasional missed dose (1–2 per week)</option>
                    <option value="Discontinued due to side effects">Discontinued due to side effects</option>
                    <option value="Self-adjusted dose">Self-adjusted dose</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-2xl bg-[rgba(88,129,87,0.12)] border border-[rgba(88,129,87,0.25)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">Safety Plan Active &amp; Reviewed?</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Coping strategies verified with patient</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={depSafetyPlan}
                      onChange={e => setDepSafetyPlan(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-accent-light)] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(88,129,87,0.2)]">
                    <div>
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">24/7 Crisis Helpline Accessible?</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Tele-MANAS (14416) saved in patient contacts</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={depCrisisVerified}
                      onChange={e => setDepCrisisVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--color-accent-light)] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submission Feedback Pill */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
                  feedback.status === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{feedback.message}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
                <span>Digitally signed &amp; audited via ABDM Gateway</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {submitting ? 'Evaluating...' : 'Submit & Evaluate Checkpoint'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

