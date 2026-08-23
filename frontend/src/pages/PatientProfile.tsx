import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Calendar, Zap } from 'lucide-react';
import TrajectoryChart from '../components/CareTwinChart/TrajectoryChart';
import CarePlanTimeline from '../components/PatientProfile/CarePlanTimeline';
import ABHACard from '../components/PatientProfile/ABHACard';
import VitalsGrid from '../components/PatientProfile/VitalsGrid';
import { getPatient, getAlerts } from '../api/client';
import type { PatientDetail, Alert } from '../types';

const vitalUnits: Record<string, { type: string; unit: string }> = {
  'Hypertension': { type: 'BP Systolic', unit: 'mmHg' },
  'Type 2 Diabetes': { type: 'HbA1c', unit: '%' },
  'Tuberculosis': { type: 'Weight', unit: 'kg' },
  'Coronary Artery Disease': { type: 'Heart Rate', unit: 'bpm' },
  'Chronic Kidney Disease': { type: 'eGFR', unit: 'mL/min' },
  'Stroke Recovery': { type: 'BP Systolic', unit: 'mmHg' },
  'Depression': { type: 'PHQ-9', unit: 'score' },
};

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([getPatient(id), getAlerts()])
      .then(([p, a]) => {
        setPatient(p);
        setAlerts(a.filter(al => al.patient_id === id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading patient profile...</span>
        </div>
      </div>
    );
  }

  const vitalInfo = vitalUnits[patient.disease] || { type: 'Vital', unit: '' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
        </button>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white"
            style={{ background: patient.avatar_color }}
          >
            {patient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {patient.name}
            </h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-[var(--color-text-muted)]">
                {patient.age}y · {patient.gender}
              </span>
              <span className="badge badge-high text-[10px]">{patient.disease}</span>
              <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <Calendar className="w-3 h-3" />
                Discharged: {patient.discharge_date}
              </span>
            </div>
          </div>
        </div>

        {/* Risk + Compliance */}
        <div className="ml-auto flex gap-4">
          <div className="text-center">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Risk Score</p>
            <p className={`text-xl font-bold ${
              patient.risk_score > 0.8 ? 'text-[var(--color-danger)]' :
              patient.risk_score > 0.6 ? 'text-[var(--color-warning)]' :
              'text-[var(--color-accent)]'
            }`}>
              {(patient.risk_score * 100).toFixed(0)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Compliance</p>
            <p className={`text-xl font-bold ${
              patient.compliance_rate > 80 ? 'text-[var(--color-accent)]' :
              patient.compliance_rate > 60 ? 'text-[var(--color-warning)]' :
              'text-[var(--color-danger)]'
            }`}>
              {patient.compliance_rate}%
            </p>
          </div>
        </div>
      </div>

      {/* Care Twin Chart */}
      <TrajectoryChart
        data={patient.trajectory}
        milestones={patient.care_plan.milestones}
        vitalType={vitalInfo.type}
        unit={vitalInfo.unit}
      />

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Care Plan */}
        <CarePlanTimeline milestones={patient.care_plan.milestones} />

        {/* Vitals + Meds + Doctor Suggestions */}
        <VitalsGrid
          vitals={patient.vitals_history}
          medications={patient.care_plan.medications}
          disease={patient.disease}
        />

        {/* ABHA + Alerts + Interventions */}
        <div className="space-y-4">
          <ABHACard
            abhaId={patient.abha_id}
            name={patient.name}
            age={patient.age}
            gender={patient.gender}
            phone={patient.phone}
            address={patient.address}
          />

          {/* Patient Alerts */}
          {alerts.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--color-danger)]" />
                Active Alerts ({alerts.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-2.5 rounded-lg bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge badge-${alert.severity} text-[9px]`}>{alert.severity}</span>
                      <span className={`badge ${
                        alert.source === 'rule-based' ? 'source-rule' :
                        alert.source === 'ml-pattern' ? 'source-ml' : 'source-llm'
                      } text-[9px]`}>
                        {alert.source === 'rule-based' ? 'Rule' : alert.source === 'ml-pattern' ? 'ML' : 'LLM'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[var(--color-text-primary)]">{alert.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interventions */}
          {patient.interventions.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                Intervention Log
              </h3>
              <div className="space-y-2">
                {patient.interventions.map((int, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[var(--color-text-muted)]">{int.date}</span>
                      <span className="badge source-rule text-[9px]">{int.type}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">{int.description}</p>
                    <p className="text-xs text-[var(--color-accent)] mt-1">↪ {int.outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Care Instructions */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Care Instructions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {patient.care_plan.instructions.map((inst, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]"
            >
              <span className="text-[var(--color-primary)] mr-1">📋</span> {inst}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
