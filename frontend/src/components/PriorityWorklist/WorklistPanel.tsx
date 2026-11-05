import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp, AlertCircle, ChevronUp } from 'lucide-react';
import type { WorklistItem } from '../../types';

interface WorklistPanelProps {
  items: WorklistItem[];
}

const rankColors = [
  { bg: 'rgba(192,57,43,0.14)',  text: '#E74C3C', border: 'rgba(192,57,43,0.3)' },
  { bg: 'rgba(212,134,10,0.14)', text: '#F0A42E', border: 'rgba(212,134,10,0.3)' },
  { bg: 'rgba(107,154,150,0.14)',text: '#8DBFBB', border: 'rgba(107,154,150,0.28)' },
  { bg: 'rgba(88,129,87,0.14)',  text: '#6DA064', border: 'rgba(88,129,87,0.28)' },
  { bg: 'rgba(163,177,138,0.12)',text: '#A3B18A', border: 'rgba(163,177,138,0.22)' },
];

export default function WorklistPanel({ items }: WorklistPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(192,57,43,0.14)', border: '1px solid rgba(192,57,43,0.28)' }}
          >
            <AlertCircle className="w-4 h-4 text-[var(--color-danger-light)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Priority Worklist</h3>
            <p className="text-[10px] text-[var(--color-text-muted)]">AI-ranked patient urgency queue · Today</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.22)', color: 'var(--color-danger-light)' }}
        >
          {items.length} need attention
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2.5">
        {items.slice(0, 5).map((item, i) => {
          const rank = rankColors[i] || rankColors[4];
          const riskPct = Math.round(item.risk_score * 100);
          return (
            <motion.div
              key={item.patient_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, ease: [0.4,0,0.2,1] }}
              onClick={() => navigate(`/patients/${item.patient_id}`)}
              className="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all"
              style={{
                background: 'rgba(28,41,34,0.6)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(107,154,150,0.32)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(36,53,44,0.75)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLDivElement).style.background = 'rgba(28,41,34,0.6)';
              }}
            >
              {/* Rank badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 leading-none"
                style={{ background: rank.bg, color: rank.text, border: `1px solid ${rank.border}` }}
              >
                #{item.rank}
              </div>

              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ring-2 ring-[rgba(255,255,255,0.08)]"
                style={{ background: item.avatar_color }}
              >
                {item.patient_name.split(' ').map((n: string) => n[0]).join('')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">
                  {item.patient_name}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  {item.age}y · {item.disease}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5 opacity-75">
                  {item.urgency_reason}: {item.top_alert}
                </p>
              </div>

              {/* Risk score */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 justify-end">
                  <TrendingUp className="w-3 h-3 text-[var(--color-text-muted)]" />
                  <span className={`text-sm font-bold tabular-nums ${
                    riskPct > 80 ? 'text-[var(--color-danger-light)]' :
                    riskPct > 60 ? 'text-[var(--color-warning-light)]' :
                    'text-[var(--color-accent-light)]'
                  }`}>
                    {riskPct}%
                  </span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold mt-0.5">Risk</p>
                {/* Mini progress bar */}
                <div className="w-14 h-1 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${riskPct}%`,
                      background: riskPct > 80 ? 'var(--color-danger)' :
                                  riskPct > 60 ? 'var(--color-warning)' :
                                  'var(--color-accent)',
                    }}
                  />
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary-light)] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </motion.div>
          );
        })}
      </div>

      {items.length > 5 && (
        <button className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] transition-all hover:text-[var(--color-primary-light)] flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(107,154,150,0.06)', border: '1px solid var(--color-border)' }}
          onClick={() => navigate('/patients')}
        >
          <ChevronUp className="w-3.5 h-3.5 rotate-180" />
          View all {items.length} patients
        </button>
      )}
    </div>
  );
}
