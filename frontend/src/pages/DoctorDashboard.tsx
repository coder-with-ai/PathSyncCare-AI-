import { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, Zap, TrendingUp, GitBranch } from 'lucide-react';
import KPICard from '../components/Dashboard/KPICard';
import AlertFeed from '../components/Dashboard/AlertFeed';
import DiseaseDistribution from '../components/Dashboard/DiseaseDistribution';
import WorklistPanel from '../components/PriorityWorklist/WorklistPanel';
import { getDashboardStats, getAlerts, getWorklist } from '../api/client';
import type { DashboardStats, Alert, WorklistItem } from '../types';

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
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

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          Good afternoon, Dr. Mehta
        </h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Here's your patient intelligence summary for today
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Total Patients"
          value={stats.total_patients}
          icon={<Users className="w-5 h-5" />}
          color="#3B82F6"
          delay={0}
        />
        <KPICard
          title="Active Alerts"
          value={stats.active_alerts}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="#EF4444"
          trend={{ value: 12, positive: false }}
          delay={1}
        />
        <KPICard
          title="Avg Compliance"
          value={stats.avg_compliance}
          suffix="%"
          icon={<CheckCircle className="w-5 h-5" />}
          color="#10B981"
          trend={{ value: 5, positive: true }}
          delay={2}
        />
        <KPICard
          title="Critical Deviations"
          value={stats.critical_deviations}
          icon={<Zap className="w-5 h-5" />}
          color="#F59E0B"
          delay={3}
        />
        <KPICard
          title="On Track"
          value={stats.patients_on_track}
          icon={<TrendingUp className="w-5 h-5" />}
          color="#06B6D4"
          delay={4}
        />
        <KPICard
          title="Pipeline Runs"
          value={stats.pipeline_runs_today}
          icon={<GitBranch className="w-5 h-5" />}
          color="#8B5CF6"
          delay={5}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Priority Worklist — 2 cols */}
        <div className="xl:col-span-2">
          <WorklistPanel items={worklist} />
        </div>

        {/* Disease Distribution */}
        <DiseaseDistribution data={stats.disease_distribution} />
      </div>

      {/* Alert Feed */}
      <AlertFeed alerts={alerts} />
    </div>
  );
}
