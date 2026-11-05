import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Brain, Cpu, BookOpen, ChevronRight } from 'lucide-react';
import type { Alert } from '../../types';

const severityStyles: Record<string, { badge: string; dot: string }> = {
  critical: { badge: 'badge-critical', dot: 'bg-[var(--color-danger)]' },
  high:     { badge: 'badge-high',     dot: 'bg-[var(--color-warning)]' },
  medium:   { badge: 'badge-medium',   dot: 'bg-[var(--color-primary-light)]' },
  low:      { badge: 'badge-low',      dot: 'bg-[var(--color-accent-light)]' },
};

const sourceStyles: Record<string, { class: string; icon: typeof Cpu; label: string }> = {
  'rule-based':     { class: 'source-rule', icon: BookOpen, label: 'Rule'  },
  'ml-pattern':     { class: 'source-ml',   icon: Cpu,      label: 'ML'    },
  'llm-explanation':{ class: 'source-llm',  icon: Brain,    label: 'LLM'   },
};

interface AlertFeedProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export default function AlertFeed({ alerts, onAlertClick }: AlertFeedProps) {
  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,134,10,0.15)', border: '1px solid rgba(212,134,10,0.3)' }}
          >
            <AlertTriangle className="w-4 h-4 text-[var(--color-warning-light)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Recent Clinical Alerts</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">AI-generated deviation signals</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(212,134,10,0.12)', border: '1px solid rgba(212,134,10,0.25)', color: 'var(--color-warning-light)' }}
          >
            {alerts.length} alerts
          </span>
        </div>
      </div>

      {/* Alert rows */}
      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
        {alerts.slice(0, 8).map((alert, i) => {
          const source = sourceStyles[alert.source];
          const severity = severityStyles[alert.severity] || { badge: 'badge-low', dot: 'bg-green-500' };
          const SourceIcon = source?.icon || Cpu;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onAlertClick?.(alert)}
              className="group flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer transition-all"
              style={{
                background: 'rgba(28,41,34,0.6)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(107,154,150,0.3)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(36,53,44,0.75)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(28,41,34,0.6)';
              }}
            >
              {/* Severity dot */}
              <div className="flex-shrink-0 mt-1.5">
                <div className={`w-2 h-2 rounded-full ${severity.dot} ring-2 ring-[rgba(255,255,255,0.08)]`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${severity.badge}`}>{alert.severity}</span>
                  {source && (
                    <span className={`badge ${source.class}`}>
                      <SourceIcon className="w-2.5 h-2.5" />
                      {source.label}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate leading-snug">
                  {alert.title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {alert.patient_name} · {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                </p>
              </div>

              {/* Deviation score */}
              {alert.deviation_score !== null && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold">Dev.</p>
                  <p className={`text-sm font-bold tabular-nums ${
                    alert.deviation_score > 0.7 ? 'text-[var(--color-danger-light)]' :
                    alert.deviation_score > 0.5 ? 'text-[var(--color-warning-light)]' :
                    'text-[var(--color-accent-light)]'
                  }`}>
                    {(alert.deviation_score * 100).toFixed(0)}%
                  </p>
                </div>
              )}

              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] transition-colors flex-shrink-0 mt-1" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
