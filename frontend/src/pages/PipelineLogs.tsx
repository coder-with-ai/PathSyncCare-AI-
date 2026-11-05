import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch, Play, CheckCircle, XCircle, Clock, Loader2,
  Zap, ChevronRight, Activity
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PipelineDAG from '../components/PipelineStatus/PipelineDAG';
import { getPipelineRuns, triggerPipeline } from '../api/client';
import type { PipelineRun } from '../types';

const statusConfig = {
  success: { icon: CheckCircle, color: '#588157',  bg: 'rgba(88,129,87,0.14)',  border: 'rgba(88,129,87,0.3)',  label: 'Success'  },
  running: { icon: Loader2,     color: '#6B9A96',  bg: 'rgba(107,154,150,0.14)',border: 'rgba(107,154,150,0.3)',label: 'Running'  },
  failed:  { icon: XCircle,     color: '#C0392B',  bg: 'rgba(192,57,43,0.14)',  border: 'rgba(192,57,43,0.3)', label: 'Failed'   },
  pending: { icon: Clock,       color: '#6A8768',  bg: 'rgba(106,135,104,0.1)', border: 'rgba(106,135,104,0.2)',label: 'Pending'  },
};

const typeLabels: Record<string, string> = {
  daily_sweep:    '🔄 Daily Sweep',
  realtime_event: '⚡ Real-time Event',
  outcome_learning:'🧠 Outcome Learning',
};

const pipelineNodes = [
  'ABDM Ingestion', 'State Builder', 'Trajectory Engine', 'XGBoost Deviation',
  'Confidence Gate', 'LLM Explainer', 'Validator', 'Worklist Gen', 'Dispatcher',
];

export default function PipelineLogs() {
  const [runs, setRuns]             = useState<PipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PipelineRun | null>(null);
  const [loading, setLoading]       = useState(true);
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
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
        >
          <GitBranch className="w-5 h-5 text-[var(--color-primary-light)] animate-pulse" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">Loading pipeline data…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-[var(--color-primary-light)]" />
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              AI Pipeline Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Pipeline Logs</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Monitor and trigger AI analysis pipeline executions
          </p>
        </div>

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
      </motion.div>

      {/* Architecture Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card-sm p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
          <p className="text-xs font-bold text-[var(--color-text-primary)]">
            PathCareSync Pipeline Architecture
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {pipelineNodes.map((node, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span
                className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[var(--color-text-secondary)]"
                style={{ background: 'rgba(28,41,34,0.8)', border: '1px solid var(--color-border)' }}
              >
                {node}
              </span>
              {i < pipelineNodes.length - 1 && (
                <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] opacity-50" />
              )}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Run History */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
              Run History
            </h3>
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {runs.map((run, i) => {
                const config = statusConfig[run.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                const isSelected = selectedRun?.id === run.id;
                return (
                  <motion.div
                    key={run.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedRun(run)}
                    className="p-3.5 rounded-xl cursor-pointer transition-all"
                    style={isSelected ? {
                      background: 'rgba(107,154,150,0.12)',
                      border: '1px solid rgba(107,154,150,0.3)',
                    } : {
                      background: 'rgba(28,41,34,0.6)',
                      border: '1px solid var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(107,154,150,0.25)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[var(--color-text-primary)] font-mono">{run.id}</span>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${run.status === 'running' ? 'animate-spin' : ''}`}
                          style={{ color: config.color }}
                        />
                        <span className="text-[10px] font-semibold" style={{ color: config.color }}>
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mb-1.5">
                      <span>{typeLabels[run.type] || run.type}</span>
                      <span>{formatDistanceToNow(new Date(run.triggered_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-[var(--color-text-muted)]">
                        <span className="font-semibold text-[var(--color-text-secondary)]">{run.patients_processed}</span> patients
                      </span>
                      <span className="text-[var(--color-text-muted)]">
                        <span className="font-semibold text-[var(--color-text-secondary)]">{run.alerts_generated}</span> alerts
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pipeline DAG */}
        <div className="lg:col-span-3">
          <PipelineDAG run={selectedRun} />
        </div>
      </div>
    </div>
  );
}
