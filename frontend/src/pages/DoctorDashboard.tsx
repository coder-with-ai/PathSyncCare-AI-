import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, AlertTriangle, CheckCircle, Zap, TrendingUp, GitBranch,
  Sparkles, Calendar
} from 'lucide-react';
import KPICard from '../components/Dashboard/KPICard';
import AlertFeed from '../components/Dashboard/AlertFeed';
import DiseaseDistribution from '../components/Dashboard/DiseaseDistribution';
import WorklistPanel from '../components/PriorityWorklist/WorklistPanel';
import { getDashboardStats, getAlerts, getWorklist } from '../api/client';
import type { DashboardStats, Alert, WorklistItem } from '../types';

function SkeletonCard() {
  return (
    <div className="kpi-card">
      <div className="skeleton h-3 w-24 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-2 w-20" />
    </div>
  );
}

export default function DoctorDashboard() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [worklist, setWorklist] = useState<WorklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getAlerts(), getWorklist()])
      .then(([s, a, w]) => {
        setStats(s);
        setAlerts(a);
        setWorklist(w);
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading || !stats) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div>
          <div className="skeleton h-6 w-72 mb-2" />
          <div className="skeleton h-4 w-56" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Patients',
      value: stats.total_patients,
      icon: <Users className="w-5 h-5" />,
      color: '#6B9A96',
      subtitle: 'Under active care',
    },
    {
      title: 'Active Alerts',
      value: stats.active_alerts,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: '#C0392B',
      trend: { value: 12, positive: false },
    },
    {
      title: 'Avg Compliance',
      value: stats.avg_compliance,
      suffix: '%',
      icon: <CheckCircle className="w-5 h-5" />,
      color: '#588157',
      trend: { value: 5, positive: true },
    },
    {
      title: 'Critical Deviations',
      value: stats.critical_deviations,
      icon: <Zap className="w-5 h-5" />,
      color: '#D4860A',
      subtitle: 'Requires action',
    },
    {
      title: 'On Track',
      value: stats.patients_on_track,
      icon: <TrendingUp className="w-5 h-5" />,
      color: '#8DBFBB',
      subtitle: 'Stable trajectory',
    },
    {
      title: 'Pipeline Runs',
      value: stats.pipeline_runs_today,
      icon: <GitBranch className="w-5 h-5" />,
      color: '#A3B18A',
      subtitle: 'Today',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[var(--color-sage)]" />
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
              AI Clinical Intelligence
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {greeting}, Dr. Mehta
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Here's your patient intelligence summary for today
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(107,154,150,0.1)', border: '1px solid rgba(107,154,150,0.2)' }}
        >
          <Calendar className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
          <span className="text-xs text-[var(--color-text-secondary)] font-medium">
            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.title} {...kpi} delay={i} />
        ))}
      </div>

      {/* Main Content: Worklist + Disease Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <WorklistPanel items={worklist} />
        </div>
        <DiseaseDistribution data={stats.disease_distribution} />
      </div>

      {/* Alert Feed */}
      <AlertFeed alerts={alerts} />
    </div>
  );
}
