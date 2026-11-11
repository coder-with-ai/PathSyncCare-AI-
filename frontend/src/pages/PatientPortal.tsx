import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse, Activity, ShieldCheck, CheckCircle2,
  Calendar, Clock, AlertTriangle, ArrowRight, Pill,
  PhoneCall, PlusCircle, Check, Sparkles, ChevronDown
} from 'lucide-react';
import TrajectoryChart from '../components/CareTwinChart/TrajectoryChart';
import DiseaseDataEntryModal from '../components/DiseaseTracking/DiseaseDataEntryModal';
import { mock100Patients, mockCheckpoints } from '../api/mockData';
import type { DiseaseType } from '../types';

export default function PatientPortal() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P-1001');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [medicationsTaken, setMedicationsTaken] = useState<Record<string, boolean>>({
    'med-1': true,
    'med-2': false,
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Get current patient
  const patient = useMemo(() => {
    return mock100Patients.find(p => p.id === selectedPatientId) || mock100Patients[0];
  }, [selectedPatientId]);

  // Checkpoints for this patient
  const patientCheckpoints = useMemo(() => {
    return mockCheckpoints.filter(c => c.patient_id === patient.id);
  }, [patient.id]);

  // Toggle medication adherence checkbox
  const toggleMedication = (id: string, name: string) => {
    const nextState = !medicationsTaken[id];
    setMedicationsTaken(prev => ({ ...prev, [id]: nextState }));
    if (nextState) {
      setFeedbackMessage(`Logged: ${name} taken as prescribed.`);
      setTimeout(() => setFeedbackMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Patient Switcher Banner */}
      <div
        className="glass-card p-6 !rounded-3xl border border-[var(--color-border)] relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(28,41,34,0.9), rgba(20,30,26,0.95))',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #6B9A96, #588157)',
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
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[rgba(107,154,150,0.15)] text-[var(--color-primary-light)] border border-[rgba(107,154,150,0.3)]">
                  ABHA: {patient.abha_id}
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-2">
                <span>Discharged: {patient.discharge_date} (14 days post-discharge)</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Recovery Trajectory: On Track</span>
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
                {mock100Patients.slice(0, 10).map(p => (
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
                background: 'linear-gradient(135deg, #6B9A96, #588157)',
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

      {/* KPI Cards: Recovery Progress, Adherence, Stability */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Adherence Streak */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Adherence Streak</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">
            7 Days <span className="text-xs text-amber-400 font-normal">🔥 Active</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">100% adherence this week</p>
        </div>

        {/* Vital Stability */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Vital Stability</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/15 text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-400">
            92.4% <span className="text-xs text-[var(--color-text-muted)] font-normal">Score</span>
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Within expected corridor</p>
        </div>

        {/* Current Risk Level */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Recovery Phase</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[rgba(107,154,150,0.15)] text-[var(--color-primary-light)]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">Phase 2</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Home Stabilization</p>
        </div>

        {/* Care Twin Status */}
        <div className="glass-card p-4 !rounded-2xl border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)]">Care Twin Sync</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-teal-500/15 text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-bold text-teal-300">Live</p>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Synced with AIIMS Protocol</p>
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
                  <HeartPulse className="w-4 h-4 text-[var(--color-primary-light)]" />
                  Your Care Twin Recovery Trajectory
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Comparing your recorded vitals against Dr. Arun Mehta's prescribed baseline corridor
                </p>
              </div>
              <span className="text-[11px] text-[var(--color-primary-light)] font-medium">
                Last 14 Days
              </span>
            </div>

            <TrajectoryChart
              data={patient.trajectory}
              milestones={patient.care_plan.milestones}
              vitalType={patient.disease === 'Hypertension' ? 'BP Systolic' : 'Key Vital'}
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
                Evaluated by Living Care Contract
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
                        Latest reading ({cp.actual_measurement || '148/94'}) is slightly elevated. Drink water and rest 15 mins.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEntryModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[rgba(107,154,150,0.15)] text-[var(--color-primary-light)] hover:bg-[rgba(107,154,150,0.25)] border border-[rgba(107,154,150,0.3)] transition-all cursor-pointer flex items-center gap-1"
                    >
                      Update Reading <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Daily Medication Schedule & Care Team */}
        <div className="space-y-6">
          {/* Daily Medication Checklist */}
          <div className="glass-card p-6 !rounded-3xl border border-[var(--color-border)]">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-1">
              <Pill className="w-4 h-4 text-emerald-400" />
              Daily Medication Plan
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mb-4">
              Tap checkbox when you take your dose
            </p>

            <div className="space-y-3">
              {[
                { id: 'med-1', name: 'Amlodipine 5mg', timing: 'Morning with water', doc: 'Dr. Arun Mehta' },
                { id: 'med-2', name: 'Atorvastatin 20mg', timing: 'Bedtime (Night)', doc: 'Dr. Arun Mehta' },
                { id: 'med-3', name: 'Aspirin 75mg', timing: 'Post-lunch', doc: 'AIIMS Cardiology' },
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

          {/* Assigned Care Team & Direct Helpline */}
          <div className="glass-card p-6 !rounded-3xl border border-[var(--color-border)] space-y-4">
            <h2 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[var(--color-primary-light)]" />
              Your Healthcare Team
            </h2>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[rgba(28,41,34,0.6)] border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--color-text-primary)]">Dr. Arun Mehta</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">Lead Cardiologist · AIIMS New Delhi</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Tele-consultation request sent to Dr. Arun Mehta’s clinical desk.')}
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
                <p className="text-xs font-bold text-rose-300">Feeling Sudden Chest Pain or Breathlessness?</p>
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

      {/* Dynamic Disease Data Entry Modal */}
      <DiseaseDataEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        patientId={patient.id}
        patientName={patient.name}
        disease={patient.disease as DiseaseType}
        onObservationAdded={() => {
          setFeedbackMessage('Health reading recorded. Checkpoint evaluated successfully.');
          setTimeout(() => setFeedbackMessage(null), 3000);
        }}
      />
    </div>
  );
}
