import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Filter, CheckCircle2 } from 'lucide-react';
import ReviewCard from '../components/HumanGateReview/ReviewCard';
import { getAlerts, reviewAlert } from '../api/client';
import type { Alert } from '../types';

export default function HumanReviewQueue() {
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all' | 'needs_review' | 'high_confidence'>('all');
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    getAlerts({ status: 'active' })
      .then(setAlerts)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (alertId: string, action: string) => {
    await reviewAlert(alertId, action);
    setReviewed(prev => new Set([...prev, alertId]));
  };

  const filteredAlerts = alerts.filter(a => {
    if (reviewed.has(a.id)) return false;
    if (filter === 'needs_review')    return a.confidence < 0.85;
    if (filter === 'high_confidence') return a.confidence >= 0.85;
    return true;
  });

  const needsReviewCount = alerts.filter(a => a.confidence < 0.85 && !reviewed.has(a.id)).length;
  const highConfCount    = alerts.filter(a => a.confidence >= 0.85 && !reviewed.has(a.id)).length;

  const filterTabs: Array<{ id: 'all' | 'needs_review' | 'high_confidence'; label: string; count: number; color: string }> = [
    { id: 'all',              label: 'All Alerts',      count: alerts.length - reviewed.size, color: 'rgba(107,154,150,0.14)' },
    { id: 'needs_review',     label: 'Needs Review',    count: needsReviewCount,  color: 'rgba(212,134,10,0.14)' },
    { id: 'high_confidence',  label: 'High Confidence', count: highConfCount,     color: 'rgba(88,129,87,0.14)'  },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
        >
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary-light)] animate-pulse" />
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">Loading review queue…</p>
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
            <ShieldCheck className="w-4 h-4 text-[var(--color-primary-light)]" />
            <span className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
              Human-in-the-Loop
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">AI Review Queue</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Clinical alerts requiring physician validation before action dispatch
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-3">
          {[
            { label: 'Needs Review',  val: needsReviewCount,  color: 'var(--color-warning-light)',  bg: 'rgba(212,134,10,0.12)',  border: 'rgba(212,134,10,0.25)' },
            { label: 'Auto-Eligible', val: highConfCount,     color: 'var(--color-accent-light)',   bg: 'rgba(88,129,87,0.12)',   border: 'rgba(88,129,87,0.25)' },
            { label: 'Reviewed',      val: reviewed.size,     color: 'var(--color-primary-light)',  bg: 'rgba(107,154,150,0.12)', border: 'rgba(107,154,150,0.25)' },
          ].map(({ label, val, color, bg, border }) => (
            <div key={label} className="glass-card-sm px-4 py-3 text-center min-w-[80px]" style={{ background: bg, border: `1px solid ${border}` }}>
              <p className="text-xl font-bold tabular-nums" style={{ color }}>{val}</p>
              <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Confidence Gate Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card-sm p-4 flex items-center gap-4"
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-1.5 h-10 rounded-full"
            style={{ background: 'linear-gradient(to bottom, var(--color-accent-light), var(--color-danger))' }}
          />
          <div>
            <p className="text-xs font-bold text-[var(--color-text-primary)]">
              Confidence Gate: 0.85
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
              Alerts ≥ 85% confidence are auto-eligible · Below 85% requires physician review
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-light)]" />
          <span className="text-xs text-[var(--color-accent-light)] font-semibold">{highConfCount} auto-eligible</span>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            style={filter === tab.id ? {
              background: tab.color,
              border: '1px solid rgba(107,154,150,0.3)',
              color: 'var(--color-text-primary)',
            } : {
              background: 'rgba(28,41,34,0.6)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {tab.label}
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-16 text-center"
          >
            <ShieldCheck className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-accent-light)' }} />
            <p className="text-sm font-bold text-[var(--color-text-primary)]">All caught up!</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">No alerts pending physician review</p>
          </motion.div>
        ) : (
          filteredAlerts.map((alert, i) => (
            <ReviewCard
              key={alert.id}
              alert={alert}
              index={i}
              onAction={handleAction}
            />
          ))
        )}
      </div>
    </div>
  );
}
