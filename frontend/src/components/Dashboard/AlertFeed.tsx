import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Brain, Cpu, BookOpen } from 'lucide-react';
import type { Alert } from '../../types';

const severityStyles: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const sourceStyles: Record<string, { class: string; icon: typeof Cpu; label: string }> = {
  'rule-based': { class: 'source-rule', icon: BookOpen, label: 'Rule' },
  'ml-pattern': { class: 'source-ml', icon: Cpu, label: 'ML' },
  'llm-explanation': { class: 'source-llm', icon: Brain, label: 'LLM' },
};

interface AlertFeedProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export default function AlertFeed({ alerts, onAlertClick }: AlertFeedProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--color-warning)]" />
          Recent Alerts
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {alerts.length} alerts
        </span>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {alerts.slice(0, 8).map((alert, i) => {
          const source = sourceStyles[alert.source];
          const SourceIcon = source?.icon || Cpu;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAlertClick?.(alert)}
              className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-border)] hover:border-[var(--color-border-light)] cursor-pointer transition-all hover:bg-[var(--color-bg-tertiary)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`badge ${severityStyles[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <span className={`badge ${source?.class}`}>
                      <SourceIcon className="w-3 h-3" />
                      {source?.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {alert.patient_name} · {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                  </p>
                </div>
                {alert.deviation_score !== null && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--color-text-muted)]">Deviation</p>
                    <p className={`text-sm font-bold ${alert.deviation_score > 0.7 ? 'text-[var(--color-danger)]' : alert.deviation_score > 0.5 ? 'text-[var(--color-warning)]' : 'text-[var(--color-accent)]'}`}>
                      {(alert.deviation_score * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
