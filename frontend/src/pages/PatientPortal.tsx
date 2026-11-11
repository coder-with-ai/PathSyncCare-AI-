import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, Activity, ShieldCheck, CheckCircle2,
  Calendar, Clock, AlertTriangle, ArrowRight, Pill,
  PhoneCall, PlusCircle, Check, Sparkles, ChevronDown,
  User, Edit3, X, MapPin, Phone, FileText
} from 'lucide-react';
import TrajectoryChart from '../components/CareTwinChart/TrajectoryChart';
import DiseaseDataEntryModal from '../components/DiseaseTracking/DiseaseDataEntryModal';
import { getAllPatients, mockCheckpoints, updatePatientProfile } from '../api/mockData';
import type { DiseaseType, PatientDetail } from '../types';

export default function PatientPortal() {
  // Read session user to auto-load newly registered or logged in patient
  const sessionUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('user_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const allPatients = useMemo(() => getAllPatients(), []);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    if (sessionUser?.role === 'Patient' && sessionUser?.patient_id) {
      return sessionUser.patient_id;
    }
    return 'P-1001';
  });

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [patientDataOverride, setPatientDataOverride] = useState<PatientDetail | null>(null);

  const [medicationsTaken, setMedicationsTaken] = useState<Record<string, boolean>>({
    'med-1': true,
    'med-2': false,
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Get current patient (with dynamic overrides from profile editing)
  const patient = useMemo(() => {
    if (patientDataOverride && patientDataOverride.id === selectedPatientId) {
      return patientDataOverride;
    }
    return allPatients.find(p => p.id === selectedPatientId) || allPatients[0];
  }, [allPatients, selectedPatientId, patientDataOverride]);

  // Profile edit form state
  const [editName, setEditName] = useState(patient.name);
  const [editPhone, setEditPhone] = useState(patient.phone || '+91-98765-43210');
  const [editAddress, setEditAddress] = useState(patient.address || 'Gomti Nagar, Lucknow');
  const [editEmergency, setEditEmergency] = useState('Dr. Arun Mehta / Sunita Devi (ASHA)');

  // Sync edit form when switching patient
  const handleOpenEditModal = () => {
    setEditName(patient.name);
    setEditPhone(patient.phone || '+91-98765-43210');
    setEditAddress(patient.address || 'Gomti Nagar, Lucknow');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updatePatientProfile(patient.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
    });

    if (updated) {
      setPatientDataOverride(updated);
      setFeedbackMessage('Personal health profile updated and synced with ABDM registry.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
    setIsProfileModalOpen(false);
  };

  // Checkpoints for this patient
  const patientCheckpoints = useMemo(() => {
    const list = mockCheckpoints.filter(c => c.patient_id === patient.id);
    if (list.length > 0) return list;
    // Default fallback checkpoint if patient is newly registered
    return [
      {
        id: `CKP-${patient.id}-01`,
        patient_id: patient.id,
        checkpoint_code: `CP-${patient.id}`,
        title: `Daily ${patient.disease} Clinical Monitoring`,
        field_name: patient.disease === 'Hypertension' ? 'Blood Pressure' : 'Primary Vital',
        expected_range: patient.disease === 'Hypertension' ? '110–130 mmHg' : 'Clinician-approved range',
        target_unit: patient.disease === 'Hypertension' ? 'mmHg' : 'units',
        measurement_frequency: 'Daily (Morning)',
        due_date: 'Today, 8:00 PM',
        actual_measurement: null,
        has_recorded_data: false,
        source: null,
        recorded_date: null,
        status: 'Due soon' as const,
        evaluation_rationale: 'Active Living Care Contract checkpoint.',
        is_reviewed: false,
      },
    ];
  }, [patient.id, patient.disease]);

  // Compute days since discharge dynamically
  const daysSinceDischarge = useMemo(() => {
    try {
      const dischargeDate = new Date(patient.discharge_date);
      const today = new Date();
      const diffMs = Math.abs(today.getTime() - dischargeDate.getTime());
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return isNaN(days) ? 14 : Math.max(1, days);
    } catch {
      return 14;
    }
  }, [patient.discharge_date]);

  // Dynamic Vital Stability Score (0 - 100%)
  const vitalStabilityScore = useMemo(() => {
    const base = patient.compliance_rate || 80;
    return Math.min(99, Math.max(55, Number((base * 0.95 + 4).toFixed(1))));
  }, [patient.compliance_rate]);

  // Toggle medication adherence checkbox
  const toggleMedication = (id: string, name: string) => {
    const nextState = !medicationsTaken[id];
    setMedicationsTaken(prev => ({ ...prev, [id]: nextState }));
    if (nextState) {
      setFeedbackMessage(`Logged: ${name} marked as taken on time.`);
      setTimeout(() => setFeedbackMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Patient Switcher Banner */}
      <div
        className="glass-card p-6 !rounded-3xl border border-[var(--color-border)] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(28,41,34,0.92), rgba(20,30,26,0.98))',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3ECF8E, #2BA56D)',
              }}
            >
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                  Welcome back, {patient.name}
                </h1>
                <span className="badge badge-medium text-xs font-semibold">
                  {patient.disease}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#3ECF8E]/15 text-[#3ECF8E] border border-[#3ECF8E]/30">
                  ABHA: {patient.abha_id}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-2 flex-wrap">
                <span>Discharged: {patient.discharge_date} ({daysSinceDischarge} days post-discharge)</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Care Twin: Active &amp; Synchronized</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleOpenEditModal}
                  className="text-xs text-[#3ECF8E] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Edit3 className="w-3 h-3" />
                  Edit My Info
                </button>
              </p>
            </div>
          </div>

          {/* Action: Log Today's Reading & Demo Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                aria-label="Switch Demo Patient"
                className="bg-[rgba(255,255,255,0.05)] border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)] rounded-xl px-3 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-[var(--color-primary-light)]"
              >
                {allPatients.slice(0, 15).map(p => (
                  <option key={p.id} value={p.id} className="bg-[#1C2922] text-white">
                    {p.name} ({p.disease})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEntryModalOpen(true)}
              className="btn-primary text-xs flex items-center gap-2 cursor-pointer shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #3ECF8E, #2BA56D)',
                borderColor: '#3ECF8E',
              }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Today's Health Reading</span>
            </motion.button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}
      </div>

      {/* KPI Cards: Dynamic Days Since Discharge, Vital Stability, Risk, Streak */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Days Since Discharge */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Days Since Discharge</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(107,154,150,0.15)] text-[var(--color-primary-light)]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">
            Day {daysSinceDischarge} <span className="text-xs text-[var(--color-text-muted)] font-normal">of 90</span>
          </p>
          <p className="text-[10px] text-emerald-400 mt-1">Stabilization Recovery Phase</p>
        </div>

        {/* Vital Stability */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Vital Stability Score</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-400">
            {vitalStabilityScore}% <span className="text-xs text-[var(--color-text-muted)] font-normal">Stability</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Within expected clinical bounds</p>
        </div>

        {/* Prediction Risk Level */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Prediction Deterioration Risk</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-teal-500/15 text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">
            {Math.round(patient.risk_score * 100)}%{' '}
            <span className={`text-xs font-semibold ${patient.risk_score > 0.7 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {patient.risk_score > 0.7 ? 'Elevated' : 'Low Risk'}
            </span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">XGBoost Recalibration: Daily</p>
        </div>

        {/* Adherence Streak */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Adherence Streak</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">
            {Math.min(14, daysSinceDischarge)} Days <span className="text-xs text-amber-400 font-normal">🔥 Active</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Continuous telemetry recorded</p>
        </div>
      </div>

      {/* Main Grid: Trajectory Chart & Today's Care Checkpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Trajectory Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 !rounded-3xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-[#3ECF8E]" />
                  Your Care Twin Recovery Trajectory
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Visualizing your actual readings against the clinician approved recovery baseline
                </p>
              </div>
              <span className="text-[11px] text-[#3ECF8E] font-medium">
                Day 0 to Day {daysSinceDischarge}
              </span>
            </div>

            <TrajectoryChart
              data={patient.trajectory}
              milestones={patient.care_plan.milestones}
              vitalType={patient.disease === 'Hypertension' ? 'BP Systolic' : 'Primary Metric'}
              unit={patient.disease === 'Hypertension' ? 'mmHg' : 'units'}
            />
          </div>

          {/* Today's Prescribed Checkpoints */}
          <div className="glass-card p-6 !rounded-3xl border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--color-accent-light)]" />
                Active Health Checkpoints ({patientCheckpoints.length})
              </h2>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Living Care Contract Status
              </span>
            </div>

            <div className="space-y-3">
              {patientCheckpoints.map(cp => (
                <div
                  key={cp.id}
                  className="p-4 rounded-2xl bg-[rgba(28,41,34,0.6)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">
                        {cp.field_name}
                      </span>
                      <span className={`badge text-[10px] ${
                        cp.status === 'On track' ? 'badge-low' :
                        cp.status === 'Due soon' ? 'badge-medium' :
                        'badge-high'
                      }`}>
                        {cp.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      Target Range: <span className="font-semibold text-[var(--color-text-secondary)]">{cp.expected_range}</span> · Frequency: {cp.measurement_frequency}
                    </p>
                    {cp.status === 'Outside expected range' && (
                      <p className="text-[11px] text-amber-300 font-medium flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Latest reading ({cp.actual_measurement || 'Elevated'}) exceeds target corridor. Stay hydrated and resting.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEntryModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[rgba(62,207,142,0.15)] text-[#3ECF8E] hover:bg-[rgba(62,207,142,0.25)] border border-[rgba(62,207,142,0.3)] transition-all cursor-pointer flex items-center gap-1"
                    >
                      Log Reading <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Daily Medication Schedule, Personal Info & Care Team */}
        <div className="space-y-6">
          {/* Patient Personal Info Card */}
          <div className="glass-card p-6 !rounded-3xl border border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <User className="w-4 h-4 text-[#3ECF8E]" />
                My Healthcare Profile
              </h2>
              <button
                type="button"
                onClick={handleOpenEditModal}
                className="text-xs text-[#3ECF8E] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <Phone className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>{patient.phone || '+91-98765-43210'}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span className="truncate">{patient.address || 'Gomti Nagar, Lucknow, UP'}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                <FileText className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>Pathway: {patient.disease}</span>
              </div>
            </div>
          </div>

          {/* Daily Medication Checklist */}
          <div className="glass-card p-6 !rounded-3xl border border-[var(--color-border)]">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-1">
              <Pill className="w-4 h-4 text-emerald-400" />
              Daily Prescriptions
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              Tap checkbox after taking your medication
            </p>

            <div className="space-y-3">
              {[
                { id: 'med-1', name: 'Prescribed Morning Dose', timing: 'Morning with water', doc: 'Dr. Arun Mehta' },
                { id: 'med-2', name: 'Prescribed Evening Dose', timing: 'Bedtime (Night)', doc: 'Dr. Arun Mehta' },
              ].map(med => {
                const isTaken = Boolean(medicationsTaken[med.id]);
                return (
                  <div
                    key={med.id}
                    onClick={() => toggleMedication(med.id, med.name)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isTaken
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-[rgba(28,41,34,0.6)] border-[var(--color-border)] hover:border-[var(--color-border-light)]'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isTaken ? 'text-emerald-300 line-through opacity-85' : 'text-[var(--color-text-primary)]'}`}>
                        {med.name}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                        {med.timing} · Prescribed by {med.doc}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isTaken
                          ? 'bg-emerald-500 text-white'
                          : 'border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assigned Healthcare Team & Direct Hotline */}
          <div className="glass-card p-6 !rounded-3xl border border-[var(--color-border)] space-y-4">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[var(--color-primary-light)]" />
              Your Healthcare Team
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[rgba(28,41,34,0.6)] border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Dr. Arun Mehta</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Lead Physician · AIIMS Protocol</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Callback request sent to Dr. Arun Mehta’s clinical desk.')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[rgba(107,154,150,0.15)] text-[var(--color-primary-light)] border border-[rgba(107,154,150,0.3)] hover:bg-[rgba(107,154,150,0.25)] cursor-pointer"
                >
                  Message Desk
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-[rgba(28,41,34,0.6)] border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Sunita Devi (ASHA)</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Community Care Coordinator</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Home-visit request confirmed for Sunita Devi.')}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer"
                >
                  Request Visit
                </button>
              </div>
            </div>

            {/* Emergency Escalation Pill */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-300">Feeling Severe Pain or Breathlessness?</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Emergency Ambulance: 112 · Tele-MANAS: 14416</p>
              </div>
              <a
                href="tel:112"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-md hover:bg-rose-600 cursor-pointer"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL: UPDATE PATIENT PROFILE & HEALTH INFO ─── */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-md glass-card !rounded-3xl border border-[var(--color-border-light)] shadow-2xl p-6 z-10 space-y-4"
              style={{
                background: 'rgba(20, 30, 26, 0.98)',
                backdropFilter: 'blur(28px)',
              }}
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#3ECF8E]" />
                  <h3 className="text-base font-bold text-white">Update Patient Profile</h3>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="form-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Residential Address &amp; District
                  </label>
                  <input
                    type="text"
                    required
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Emergency Contact Person &amp; Phone
                  </label>
                  <input
                    type="text"
                    value={editEmergency}
                    onChange={e => setEditEmergency(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="btn-ghost text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #3ECF8E, #2BA56D)',
                      borderColor: '#3ECF8E',
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save &amp; Sync Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Disease Data Entry Modal */}
      <DiseaseDataEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        patientId={patient.id}
        patientName={patient.name}
        disease={patient.disease as DiseaseType}
        onObservationAdded={() => {
          setFeedbackMessage('Health reading recorded. Care Twin trajectory updated in real time.');
          setTimeout(() => setFeedbackMessage(null), 3500);
        }}
      />
    </div>
  );
}
