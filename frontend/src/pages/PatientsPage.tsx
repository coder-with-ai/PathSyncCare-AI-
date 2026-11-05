import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, ArrowRight, TrendingUp,
  AlertTriangle, CheckCircle, SlidersHorizontal
} from 'lucide-react';
import { getPatients } from '../api/client';
import type { PatientSummary } from '../types';

const diseaseColors: Record<string, string> = {
  'Hypertension':            '#6B9A96',
  'Type 2 Diabetes':         '#D4860A',
  'Tuberculosis':            '#588157',
  'Coronary Artery Disease': '#C0392B',
  'Chronic Kidney Disease':  '#A3B18A',
  'Stroke Recovery':         '#8DBFBB',
  'Depression':              '#7D9668',
};

function SkeletonPatientCard() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start gap-4">
        <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-5 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex gap-4 mt-4 pt-3 border-t border-[var(--color-border)]">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-3 w-28" />
      </div>
    </div>
  );
}

export default function PatientsPage() {
  const [patients, setPatients]       = useState<PatientSummary[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    getPatients()
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  const diseases = [...new Set(patients.map(p => p.disease))];

  const filtered = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.abha_id.includes(search) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesDisease = diseaseFilter === 'all' || p.disease === diseaseFilter;
    return matchesSearch && matchesDisease;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[var(--color-primary-light)]" />
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              Patient Registry
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Patient Cohort</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {loading ? 'Loading…' : `${patients.length} patients · 7 priority NCD conditions`}
          </p>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ABHA ID, or patient ID…"
            className="w-full h-10 pl-10 pr-4 rounded-xl text-sm transition-all"
            style={{
              background: 'rgba(28,41,34,0.75)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'rgba(107,154,150,0.5)';
              e.target.style.boxShadow = '0 0 0 3px rgba(107,154,150,0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <div className="flex items-center gap-2 glass-card-sm px-3 py-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <select
            value={diseaseFilter}
            onChange={e => setDiseaseFilter(e.target.value)}
            className="bg-transparent text-sm font-medium cursor-pointer focus:outline-none"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <option value="all">All Conditions</option>
            {diseases.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {!loading && (
          <div className="ml-auto glass-card-sm px-3 py-2 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">
              Showing {filtered.length} of {patients.length}
            </span>
          </div>
        )}
      </div>

      {/* Patient Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonPatientCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3 opacity-50" />
          <p className="text-sm text-[var(--color-text-primary)]">No patients found</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((patient, i) => {
            const dColor = diseaseColors[patient.disease] || '#6B9A96';
            return (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, ease: [0.4, 0, 0.2, 1] }}
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="glass-card p-5 cursor-pointer group"
              >
                {/* Top colour accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[20px] opacity-70"
                  style={{ background: `linear-gradient(90deg, ${dColor}, transparent)` }}
                />

                <div className="flex items-start gap-4 relative">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 group-hover:scale-105 transition-transform ring-2 ring-[rgba(255,255,255,0.08)]"
                    style={{ background: patient.avatar_color }}
                  >
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">
                      {patient.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {patient.age}y · {patient.gender} · <span className="font-mono text-[10px]">{patient.id}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{
                          background: `${dColor}18`,
                          color: dColor,
                          border: `1px solid ${dColor}30`,
                        }}
                      >
                        {patient.disease}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-[var(--color-text-muted)]" />
                    <span className="text-[11px] text-[var(--color-text-muted)]">Risk</span>
                    <span className={`text-[11px] font-bold tabular-nums ${
                      patient.risk_score > 0.8 ? 'text-[var(--color-danger-light)]' :
                      patient.risk_score > 0.6 ? 'text-[var(--color-warning-light)]' :
                      'text-[var(--color-accent-light)]'
                    }`}>
                      {(patient.risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3 text-[var(--color-text-muted)]" />
                    <span className="text-[11px] text-[var(--color-text-muted)]">Compliance</span>
                    <span className={`text-[11px] font-bold tabular-nums ${
                      patient.compliance_rate > 80 ? 'text-[var(--color-accent-light)]' :
                      patient.compliance_rate > 60 ? 'text-[var(--color-warning-light)]' :
                      'text-[var(--color-danger-light)]'
                    }`}>
                      {patient.compliance_rate}%
                    </span>
                  </div>
                  {patient.active_alerts > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <AlertTriangle className="w-3 h-3 text-[var(--color-danger-light)]" />
                      <span className="text-[11px] font-bold text-[var(--color-danger-light)]">
                        {patient.active_alerts}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
