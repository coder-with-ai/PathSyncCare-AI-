import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import type { WorklistItem } from '../../types';

interface WorklistPanelProps {
  items: WorklistItem[];
}

export default function WorklistPanel({ items }: WorklistPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
          Priority Worklist — Today
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          {items.length} patients need attention
        </span>
      </div>
      <div className="space-y-3">
        {items.slice(0, 5).map((item, i) => (
          <motion.div
            key={item.patient_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => navigate(`/patients/${item.patient_id}`)}
            className="flex items-center gap-4 p-3 rounded-xl bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 cursor-pointer transition-all group"
          >
            {/* Rank */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              i === 0 ? 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' :
              i === 1 ? 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]' :
              'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
            }`}>
              #{item.rank}
            </div>

            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: item.avatar_color }}
            >
              {item.patient_name.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {item.patient_name}
                <span className="text-xs text-[var(--color-text-muted)] ml-2">
                  {item.age}y · {item.disease}
                </span>
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">
                {item.urgency_reason}: {item.top_alert}
              </p>
            </div>

            {/* Risk Score */}
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[var(--color-text-muted)]" />
                <span className={`text-sm font-bold ${
                  item.risk_score > 0.8 ? 'text-[var(--color-danger)]' :
                  item.risk_score > 0.6 ? 'text-[var(--color-warning)]' :
                  'text-[var(--color-accent)]'
                }`}>
                  {(item.risk_score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)]">Risk</p>
            </div>

            <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
