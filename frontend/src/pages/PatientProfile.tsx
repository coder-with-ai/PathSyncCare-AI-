import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Activity, Calendar, Heart } from 'lucide-react';
import TrajectoryChart from '../components/CareTwinChart/TrajectoryChart';
import CarePlanTimeline from '../components/PatientProfile/CarePlanTimeline';
import ABHACard from '../components/PatientProfile/ABHACard';
import VitalsGrid from '../components/PatientProfile/VitalsGrid';
import { getPatient, getAlerts } from '../api/client';
import type { PatientDetail, Alert } from '../types';

const vitalUnits: Record<string, { type: string; unit: string }> = {
  'Hypertension':            { type: 'BP Systolic',  unit: 'mmHg'    },
  'Type 2 Diabetes':         { type: 'HbA1c',        unit: '%'       },
  'Tuberculosis':            { type: 'Weight',        unit: 'kg'      },
  'Coronary Artery Disease': { type: 'Heart Rate',   unit: 'bpm'     },
  'Chronic Kidney Disease':  { type: 'eGFR',          unit: 'mL/min'  },
  'Stroke Recovery':         { type: 'BP Systolic',  unit: 'mmHg'    },
  'Depression':              { type: 'PHQ-9',         unit: 'score'   },
};

const riskColor = (score: number) =>
  score > 0.8 ? 'var(--color-danger-light)' :
  score > 0.6 ? 'var(--color-warning-light)' :
  'var(--color-accent-light)';

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [alerts,  setAlerts]  = useState<Alert[]>([]);
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
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
        >
          <Heart className="w-5 h-5 text-[var(--color-primary-light)] animate-pulse" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Loading patient profile…</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Fetching Care Twin data</p>
        </div>
      </div>
    );
  }

  const vitalInfo = vitalUnits[patient.disease] || { type: 'Vital', unit: '' };
  const riskPct   = Math.round(patient.risk_score * 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl transition-all cursor-pointer"
          style={{
            background: 'rgba(28,41,34,0.75)',
            border: '1px solid var(--color-border)',
          }}
        >
          <ArrowLeft className="w-4.5 h-4.5 text-[var(--color-text-secondary)]" style={{ width: 18, height: 18 }} />
        </motion.button>

        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar */}
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ring-2 ring-[rgba(255,255,255,0.1)]"
            style={{ background: patient.avatar_color, width: 52, height: 52 }}
          >
            {patient.name.split(' ').map(n => n[0]).join('')}
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] truncate">{patient.name}</h2>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
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

        {/* Risk + Compliance Metrics */}
        <div className="flex gap-3 flex-shrink-0">
          <div className="glass-card-sm px-4 py-3 text-center">
            <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest mb-1">Risk Score</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: riskColor(patient.risk_score) }}>
              {riskPct}%
            </p>
            {/* Mini ring */}
            <div className="relative w-10 h-1 mx-auto mt-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${riskPct}%`,
                  background: riskColor(patient.risk_score),
                }}
              />
            </div>
          </div>
          <div className="glass-card-sm px-4 py-3 text-center">
            <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest mb-1">Compliance</p>
            <p className="text-xl font-bold tabular-nums" style={{
              color: patient.compliance_rate > 80 ? 'var(--color-accent-light)' :
                     patient.compliance_rate > 60 ? 'var(--color-warning-light)' :
                     'var(--color-danger-light)'
            }}>
              {patient.compliance_rate}%
            </p>
            <div className="relative w-10 h-1 mx-auto mt-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${patient.compliance_rate}%`,
                  background: patient.compliance_rate > 80 ? 'var(--color-accent)' :
                              patient.compliance_rate > 60 ? 'var(--color-warning)' :
                              'var(--color-danger)',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Care Twin Chart */}
      <TrajectoryChart
        data={patient.trajectory}
        milestones={patient.care_plan.milestones}
        vitalType={vitalInfo.type}
        unit={vitalInfo.unit}
      />

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CarePlanTimeline milestones={patient.care_plan.milestones} />
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

          {alerts.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--color-danger-light)]" />
                Active Alerts ({alerts.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-xl transition-all"
                    style={{ background: 'rgba(28,41,34,0.6)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge badge-${alert.severity} text-[9px]`}>{alert.severity}</span>
                      <span className={`badge ${
                        alert.source === 'rule-based' ? 'source-rule' :
                        alert.source === 'ml-pattern' ? 'source-ml' : 'source-llm'
                      } text-[9px]`}>
                        {alert.source === 'rule-based' ? 'Rule' : alert.source === 'ml-pattern' ? 'ML' : 'LLM'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[var(--color-text-primary)]">{alert.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {patient.interventions.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">
                Intervention Log
              </h3>
              <div className="space-y-2">
                {patient.interventions.map((int, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl"
                    style={{ background: 'rgba(28,41,34,0.6)', border: '1px solid var(--color-border)' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[var(--color-text-muted)]">{int.date}</span>
                      <span className="badge source-rule text-[9px]">{int.type}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)]">{int.description}</p>
                    <p className="text-xs text-[var(--color-accent-light)] mt-1 flex items-center gap-1">
                      <span>↪</span> {int.outcome}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Care Instructions */}
      {patient.care_plan.instructions.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">
            Care Instructions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {patient.care_plan.instructions.map((inst, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl text-xs text-[var(--color-text-secondary)] transition-all hover:border-[var(--color-primary-light)]/30"
                style={{ background: 'rgba(28,41,34,0.6)', border: '1px solid var(--color-border)' }}
              >
                <span className="text-[var(--color-primary-light)] mr-1.5">📋</span>
                {inst}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
