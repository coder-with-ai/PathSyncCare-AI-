import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Filter, Zap } from 'lucide-react';
import ReviewCard from '../components/HumanGateReview/ReviewCard';
import { getAlerts, reviewAlert } from '../api/client';
import type { Alert } from '../types';

export default function HumanReviewQueue() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'high_confidence'>('all');
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
    if (filter === 'needs_review') return a.confidence < 0.85;
    if (filter === 'high_confidence') return a.confidence >= 0.85;
    return true;
  });

  const needsReviewCount = alerts.filter(a => a.confidence < 0.85 && !reviewed.has(a.id)).length;
  const highConfCount = alerts.filter(a => a.confidence >= 0.85 && !reviewed.has(a.id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
          <Zap className="w-5 h-5 animate-pulse" />
          <span className="text-sm">Loading review queue...</span>
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
            <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
            Human-in-the-Loop Review
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            AI alerts requiring clinical validation before action dispatch
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="glass-card-sm p-3 text-center">
            <p className="text-lg font-bold text-[var(--color-warning)]">{needsReviewCount}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Needs Review</p>
            <p className="text-[9px] text-[var(--color-text-muted)]">Confidence &lt; 85%</p>
          </div>
          <div className="glass-card-sm p-3 text-center">
            <p className="text-lg font-bold text-[var(--color-accent)]">{highConfCount}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Auto-Eligible</p>
            <p className="text-[9px] text-[var(--color-text-muted)]">Confidence ≥ 85%</p>
          </div>
          <div className="glass-card-sm p-3 text-center">
            <p className="text-lg font-bold text-[var(--color-primary)]">{reviewed.size}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">Reviewed Today</p>
          </div>
        </div>
      </div>

      {/* Confidence Gate Explanation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card-sm p-4 flex items-center gap-4"
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-2 h-8 rounded-full bg-gradient-to-b from-[var(--color-accent)] to-[var(--color-danger)]" />
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">Confidence Gate: 0.85</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Alerts with confidence ≥ 85% are auto-eligible · Below 85% requires human review
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
        {(['all', 'needs_review', 'high_confidence'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              filter === f
                ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] border border-[var(--color-primary)]/30'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            {f === 'all' ? 'All Alerts' : f === 'needs_review' ? '⚠ Needs Review' : '✓ High Confidence'}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <ShieldCheck className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-3" />
            <p className="text-sm text-[var(--color-text-primary)]">All caught up!</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">No alerts pending review</p>
          </div>
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
