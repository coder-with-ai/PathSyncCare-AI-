import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, Play, CheckCircle, XCircle, Clock, Loader2, Zap,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PipelineDAG from '../components/PipelineStatus/PipelineDAG';
import { getPipelineRuns, triggerPipeline } from '../api/client';
import type { PipelineRun } from '../types';

const statusConfig = {
  success: { icon: CheckCircle, color: '#10B981', label: 'Success' },
  running: { icon: Loader2, color: '#3B82F6', label: 'Running' },
  failed: { icon: XCircle, color: '#EF4444', label: 'Failed' },
  pending: { icon: Clock, color: '#6B7280', label: 'Pending' },
};

const typeLabels: Record<string, string> = {
  daily_sweep: '🔄 Daily Sweep',
  realtime_event: '⚡ Real-time Event',
  outcome_learning: '🧠 Outcome Learning',
};

export default function PipelineLogs() {
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    getPipelineRuns()
      .then(r => {
        setRuns(r);
        if (r.length > 0) setSelectedRun(r[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleTrigger = async (type: string) => {
    setTriggering(true);
    try {
      const newRun = await triggerPipeline(type);
      setRuns(prev => [newRun, ...prev]);
      setSelectedRun(newRun);
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading pipeline data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[var(--color-primary)]" />
            RocketRide Pipeline Logs
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Monitor and trigger AI pipeline executions
          </p>
        </div>

        {/* Trigger Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleTrigger('daily_sweep')}
            disabled={triggering}
            className="btn-primary"
          >
            {triggering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Daily Sweep
          </button>
          <button
            onClick={() => handleTrigger('realtime_event')}
            disabled={triggering}
            className="btn-ghost"
          >
            <Zap className="w-3.5 h-3.5" />
            Trigger Event
          </button>
        </div>
      </div>

      {/* Pipeline Architecture Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card-sm p-4"
      >
        <p className="text-xs font-semibold text-[var(--color-text-primary)] mb-2">
          🚀 RocketRide Pipeline Architecture
        </p>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)] flex-wrap">
          {['ABDM Ingestion', 'State Builder', 'Trajectory Engine', 'XGBoost Deviation', 'Confidence Gate', 'LLM Explainer', 'Validator', 'Worklist Gen', 'Dispatcher'].map((node, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                {node}
              </span>
              {i < 8 && <ChevronRight className="w-3 h-3" />}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Run History — 2 cols */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
              Run History
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {runs.map((run, i) => {
                const config = statusConfig[run.status];
                const StatusIcon = config.icon;
                const isSelected = selectedRun?.id === run.id;
                return (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedRun(run)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30'
                        : 'bg-[var(--color-bg-tertiary)]/60 border-[var(--color-border)] hover:border-[var(--color-border-light)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                        {run.id}
                      </span>
                      <div className="flex items-center gap-1">
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${run.status === 'running' ? 'animate-spin' : ''}`}
                          style={{ color: config.color }}
                        />
                        <span className="text-[10px] font-medium" style={{ color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {typeLabels[run.type] || run.type}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">
                        {formatDistanceToNow(new Date(run.triggered_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                      <span>Patients: {run.patients_processed}</span>
                      <span>Alerts: {run.alerts_generated}</span>
                      <span>By: {run.triggered_by.split(':')[0]}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pipeline DAG — 3 cols */}
        <div className="lg:col-span-3">
          <PipelineDAG run={selectedRun} />
        </div>
      </div>
    </div>
  );
}
