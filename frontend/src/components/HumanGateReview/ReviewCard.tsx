import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Edit, BookOpen, Cpu, Brain, AlertTriangle, Gauge } from 'lucide-react';
import type { Alert } from '../../types';

const sourceInfo: Record<string, { icon: typeof Cpu; label: string; class: string; detail: 'rule_detail' | 'ml_detail' | 'llm_detail' }> = {
  'rule-based': { icon: BookOpen, label: 'Rule-Based', class: 'source-rule', detail: 'rule_detail' },
  'ml-pattern': { icon: Cpu, label: 'ML Pattern', class: 'source-ml', detail: 'ml_detail' },
  'llm-explanation': { icon: Brain, label: 'LLM Explanation', class: 'source-llm', detail: 'llm_detail' },
};

interface ReviewCardProps {
  alert: Alert;
  index: number;
  onAction: (alertId: string, action: string) => void;
}

export default function ReviewCard({ alert, index, onAction }: ReviewCardProps) {
  const source = sourceInfo[alert.source];
  const SourceIcon = source?.icon || Cpu;
  const detail = source ? alert[source.detail] : null;
  const needsReview = alert.confidence < 0.85;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass-card p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
            <span className={`badge ${source?.class}`}>
              <SourceIcon className="w-3 h-3" />
              {source?.label}
            </span>
            {needsReview && (
              <span className="badge badge-high">
                <AlertTriangle className="w-3 h-3" />
                Needs Review
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{alert.title}</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{alert.patient_name} · {alert.disease}</p>
        </div>

        {/* Confidence Meter */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 ml-4">
          <div className="relative w-14 h-14">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(75,85,99,0.2)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke={alert.confidence >= 0.85 ? '#10B981' : alert.confidence >= 0.7 ? '#F59E0B' : '#EF4444'}
                strokeWidth="3"
                strokeDasharray={`${alert.confidence * 97.4} 97.4`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--color-text-primary)]">
                {(alert.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <span className="text-[9px] text-[var(--color-text-muted)] uppercase">Confidence</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--color-text-secondary)] mb-3">{alert.description}</p>

      {/* AI Detail */}
      {detail && (
        <div className="p-3 rounded-lg bg-[var(--color-bg-primary)]/50 border border-[var(--color-border)] mb-4">
          <p className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold mb-1">
            {source?.label} Detail
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{detail}</p>
        </div>
      )}

      {/* Deviation Score */}
      {alert.deviation_score !== null && (
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
          <span className="text-xs text-[var(--color-text-muted)]">Deviation Score:</span>
          <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${alert.deviation_score * 100}%`,
                background: alert.deviation_score > 0.7
                  ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                  : alert.deviation_score > 0.4
                  ? 'linear-gradient(90deg, #3B82F6, #F59E0B)'
                  : 'linear-gradient(90deg, #10B981, #3B82F6)',
              }}
            />
          </div>
          <span className={`text-xs font-bold ${
            alert.deviation_score > 0.7 ? 'text-[var(--color-danger)]' :
            alert.deviation_score > 0.4 ? 'text-[var(--color-warning)]' :
            'text-[var(--color-accent)]'
          }`}>
            {(alert.deviation_score * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => onAction(alert.id, 'accept')}
          className="btn-success"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Accept
        </button>
        <button
          onClick={() => onAction(alert.id, 'modify')}
          className="btn-ghost"
        >
          <Edit className="w-3.5 h-3.5" />
          Modify
        </button>
        <button
          onClick={() => onAction(alert.id, 'dismiss')}
          className="btn-danger"
        >
          <XCircle className="w-3.5 h-3.5" />
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
