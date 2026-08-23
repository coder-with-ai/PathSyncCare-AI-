import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Zap, ArrowRight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { getPatients } from '../api/client';
import type { PatientSummary } from '../types';

const diseaseColors: Record<string, string> = {
  'Hypertension': '#3B82F6',
  'Type 2 Diabetes': '#F59E0B',
  'Tuberculosis': '#10B981',
  'Coronary Artery Disease': '#EF4444',
  'Chronic Kidney Disease': '#8B5CF6',
  'Stroke Recovery': '#EC4899',
  'Depression': '#06B6D4',
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  const diseases = [...new Set(patients.map(p => p.disease))];

  const filtered = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.abha_id.includes(search) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchesDisease = diseaseFilter === 'all' || p.disease === diseaseFilter;
    return matchesSearch && matchesDisease;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading patients...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--color-primary)]" />
          Patient Registry
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {patients.length} patients across 7 priority diseases
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ABHA ID, or patient ID..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
          <select
            value={diseaseFilter}
            onChange={e => setDiseaseFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] cursor-pointer"
          >
            <option value="all">All Diseases</option>
            {diseases.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((patient, i) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/patients/${patient.id}`)}
            className="glass-card p-5 cursor-pointer group hover:border-[var(--color-primary)]/30"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 group-hover:scale-105 transition-transform"
                style={{ background: patient.avatar_color }}
              >
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {patient.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {patient.age}y · {patient.gender} · {patient.id}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{
                      background: `${diseaseColors[patient.disease] || '#6B7280'}15`,
                      color: diseaseColors[patient.disease] || '#6B7280',
                      border: `1px solid ${diseaseColors[patient.disease] || '#6B7280'}30`,
                    }}
                  >
                    {patient.disease}
                  </span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0 mt-1" />
            </div>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-[11px] text-[var(--color-text-muted)]">Risk:</span>
                <span className={`text-[11px] font-bold ${
                  patient.risk_score > 0.8 ? 'text-[var(--color-danger)]' :
                  patient.risk_score > 0.6 ? 'text-[var(--color-warning)]' :
                  'text-[var(--color-accent)]'
                }`}>
                  {(patient.risk_score * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className="text-[11px] text-[var(--color-text-muted)]">Compliance:</span>
                <span className={`text-[11px] font-bold ${
                  patient.compliance_rate > 80 ? 'text-[var(--color-accent)]' :
                  patient.compliance_rate > 60 ? 'text-[var(--color-warning)]' :
                  'text-[var(--color-danger)]'
                }`}>
                  {patient.compliance_rate}%
                </span>
              </div>
              {patient.active_alerts > 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <AlertTriangle className="w-3 h-3 text-[var(--color-danger)]" />
                  <span className="text-[11px] font-bold text-[var(--color-danger)]">
                    {patient.active_alerts}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
