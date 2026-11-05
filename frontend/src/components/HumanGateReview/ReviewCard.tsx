import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Edit3, BookOpen, Cpu, Brain, AlertTriangle, Gauge } from 'lucide-react';
import type { Alert } from '../../types';

const sourceInfo: Record<string, {
  icon: typeof Cpu;
  label: string;
  class: string;
  detail: 'rule_detail' | 'ml_detail' | 'llm_detail';
  accent: string;
}> = {
  'rule-based':     { icon: BookOpen, label: 'Rule-Based',    class: 'source-rule', detail: 'rule_detail', accent: '#8DBFBB' },
  'ml-pattern':     { icon: Cpu,      label: 'ML Pattern',    class: 'source-ml',   detail: 'ml_detail',  accent: '#A3B18A' },
  'llm-explanation':{ icon: Brain,    label: 'LLM Explained', class: 'source-llm',  detail: 'llm_detail', accent: '#6DA064' },
};

interface ReviewCardProps {
  alert: Alert;
  index: number;
  onAction: (alertId: string, action: string) => void;
}

export default function ReviewCard({ alert, index, onAction }: ReviewCardProps) {
  const source      = sourceInfo[alert.source];
  const SourceIcon  = source?.icon || Cpu;
  const detail      = source ? (alert as any)[source.detail] : null;
  const needsReview = alert.confidence < 0.85;

  const circleCircumference = 2 * Math.PI * 15.5; // ≈ 97.4

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      className="glass-card p-6"
    >
      {/* Severity colour top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]"
        style={{
          background:
            alert.severity === 'critical' ? 'linear-gradient(90deg, var(--color-danger), transparent)' :
            alert.severity === 'high'     ? 'linear-gradient(90deg, var(--color-warning), transparent)' :
            alert.severity === 'medium'   ? 'linear-gradient(90deg, var(--color-primary-light), transparent)' :
            'linear-gradient(90deg, var(--color-accent-light), transparent)',
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
            {source && (
              <span className={`badge ${source.class}`}>
                <SourceIcon className="w-3 h-3" />
                {source.label}
              </span>
            )}
            {needsReview && (
              <span className="badge badge-high flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Needs Review
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">{alert.title}</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{alert.patient_name} · {alert.disease}</p>
        </div>

        {/* Confidence ring */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 ml-5">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke={
                  alert.confidence >= 0.85 ? '#588157' :
                  alert.confidence >= 0.70 ? '#D4860A' : '#C0392B'
                }
                strokeWidth="3"
                strokeDasharray={`${alert.confidence * circleCircumference} ${circleCircumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--color-text-primary)] tabular-nums">
                {(alert.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <span className="text-[8px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">
            Confidence
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">{alert.description}</p>

      {/* AI Detail */}
      {detail && (
        <div
          className="p-3.5 rounded-xl mb-4"
          style={{ background: 'rgba(20,30,26,0.6)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            {source && <SourceIcon className="w-3.5 h-3.5" style={{ color: source.accent }} />}
            <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-widest">
              {source?.label} Rationale
            </p>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{detail}</p>
        </div>
      )}

      {/* Deviation Score bar */}
      {alert.deviation_score !== null && (
        <div className="flex items-center gap-3 mb-4">
          <Gauge className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
          <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">Deviation:</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${alert.deviation_score * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                background: alert.deviation_score > 0.7
                  ? 'linear-gradient(90deg, var(--color-warning), var(--color-danger))'
                  : alert.deviation_score > 0.4
                  ? 'linear-gradient(90deg, var(--color-primary-light), var(--color-warning))'
                  : 'linear-gradient(90deg, var(--color-accent), var(--color-primary-light))',
              }}
            />
          </div>
          <span className={`text-xs font-bold tabular-nums flex-shrink-0 ${
            alert.deviation_score > 0.7 ? 'text-[var(--color-danger-light)]' :
            alert.deviation_score > 0.4 ? 'text-[var(--color-warning-light)]' :
            'text-[var(--color-accent-light)]'
          }`}>
            {(alert.deviation_score * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button onClick={() => onAction(alert.id, 'accept')} className="btn-success">
          <CheckCircle className="w-3.5 h-3.5" />
          Accept
        </button>
        <button onClick={() => onAction(alert.id, 'modify')} className="btn-ghost">
          <Edit3 className="w-3.5 h-3.5" />
          Modify
        </button>
        <button onClick={() => onAction(alert.id, 'dismiss')} className="btn-danger">
          <XCircle className="w-3.5 h-3.5" />
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
