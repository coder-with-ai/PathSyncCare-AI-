import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Clock, AlertTriangle, AlertOctagon, TrendingUp,
  FileQuestion, GitCompare, CheckCircle2, Stethoscope, ChevronRight,
  PlusCircle, ShieldCheck
} from 'lucide-react';
import type { CareCheckpoint, CheckpointEvaluationStatus } from '../../types';
import { reviewCheckpoint } from '../../api/client';

interface CheckpointEvaluationCardProps {
  checkpoints: CareCheckpoint[];
  patientId: string;
  patientName: string;
  onOpenDataEntry?: () => void;
  onCheckpointUpdated?: () => void;
}

const statusConfig: Record<CheckpointEvaluationStatus, {
  label: string;
  badgeClass: string;
  dotColor: string;
  icon: typeof CheckCircle;
  description: string;
}> = {
  'On track': {
    label: 'On track',
    badgeClass: 'badge-low',
    dotColor: '#588157',
    icon: CheckCircle2,
    description: 'Evidence meets approved checkpoint criteria',
  },
  'Due soon': {
    label: 'Due soon',
    badgeClass: 'badge-medium',
    dotColor: '#6B9A96',
    icon: Clock,
    description: 'Checkpoint deadline approaching within window',
  },
  'Overdue': {
    label: 'Overdue',
    badgeClass: 'badge-critical',
    dotColor: '#C0392B',
    icon: AlertOctagon,
    description: 'Required evidence missing after due window',
  },
  'Outside expected range': {
    label: 'Outside expected range',
    badgeClass: 'badge-critical',
    dotColor: '#C0392B',
    icon: AlertTriangle,
    description: 'Valid observation falls outside approved limits',
  },
  'Worsening trend': {
    label: 'Worsening trend',
    badgeClass: 'badge-high',
    dotColor: '#D4860A',
    icon: TrendingUp,
    description: 'Multiple observations indicate concerning drift',
  },
  'Conflicting data': {
    label: 'Conflicting data',
    badgeClass: 'badge-high',
    dotColor: '#D4860A',
    icon: GitCompare,
    description: 'Discrepancy detected across data sources',
  },
  'Insufficient evidence': {
    label: 'Insufficient evidence',
    badgeClass: 'badge-medium',
    dotColor: '#8DBFBB',
    icon: FileQuestion,
    description: 'Not enough valid measurements to evaluate',
  },
  'Resolved': {
    label: 'Resolved',
    badgeClass: 'badge-low',
    dotColor: '#344E41',
    icon: ShieldCheck,
    description: 'Clinician reviewed and recorded decision',
  },
};

export default function CheckpointEvaluationCard({
  checkpoints,
  patientId,
  patientName,
  onOpenDataEntry,
  onCheckpointUpdated,
}: CheckpointEvaluationCardProps) {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CareCheckpoint | null>(null);
  const [reviewDecision, setReviewDecision] = useState('Dose Adjusted');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleRecordDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCheckpoint) return;
    setSubmittingReview(true);
    try {
      await reviewCheckpoint(patientId, selectedCheckpoint.id, reviewDecision, reviewNotes, 'Dr. Arun Mehta');
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setSelectedCheckpoint(null);
        setReviewNotes('');
        onCheckpointUpdated?.();
      }, 1200);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
          >
            <Stethoscope className="w-4.5 h-4.5 text-[var(--color-primary-light)]" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Care-Plan Checkpoint Evaluator
              </h3>
              <span className="badge source-rule text-[9px]">Continuous Evaluation</span>
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Core AI Intelligence: Expected vs Actual Clinical Variance
            </p>
          </div>
        </div>

        {onOpenDataEntry && (
          <button
            onClick={onOpenDataEntry}
            className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer py-1.5 px-3"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Record Observation
          </button>
        )}
      </div>

      {/* Checkpoint list */}
      <div className="space-y-4">
        {checkpoints.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
            No active care checkpoints configured for this patient.
          </div>
        ) : (
          checkpoints.map((chk, index) => {
            const config = statusConfig[chk.status] || statusConfig['On track'];
            const StatusIcon = config.icon;

            return (
              <motion.div
                key={chk.id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-4 rounded-2xl transition-all"
                style={{
                  background: 'rgba(28,41,34,0.65)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Top Status & Code Header */}
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[var(--color-primary-light)] px-2 py-0.5 rounded-lg bg-[rgba(107,154,150,0.12)] border border-[rgba(107,154,150,0.25)]">
                      {chk.checkpoint_code}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--color-text-primary)]">
                      {chk.title}
                    </h4>
                  </div>

                  {/* Evaluation Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className={`badge ${config.badgeClass} flex items-center gap-1 py-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {chk.status}
                    </span>
                  </div>
                </div>

                {/* Comparison Grid: Expected vs Actual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {/* Expected Target Box */}
                  <div className="p-3 rounded-xl bg-[rgba(20,30,26,0.5)] border border-[var(--color-border)]">
                    <p className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-1">
                      Target Expectation (Clinician-Configured)
                    </p>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">
                      {chk.expected_range}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mt-1.5">
                      <span>Frequency: {chk.measurement_frequency}</span>
                      <span>Due: {chk.due_date}</span>
                    </div>
                  </div>

                  {/* Actual Observation Box */}
                  <div
                    className="p-3 rounded-xl border transition-colors"
                    style={{
                      background: chk.has_recorded_data ? 'rgba(20,30,26,0.5)' : 'rgba(192,57,43,0.08)',
                      borderColor: chk.has_recorded_data ? 'var(--color-border)' : 'rgba(192,57,43,0.3)',
                    }}
                  >
                    <p className="text-[9px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-1">
                      Latest Actual Telemetry
                    </p>
                    {chk.has_recorded_data ? (
                      <div>
                        <p className="text-xs font-bold text-[var(--color-text-primary)] tabular-nums">
                          {chk.actual_measurement}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mt-1.5">
                          <span>Source: {chk.source || 'Patient-reported'}</span>
                          <span>Recorded: {chk.recorded_date || 'Recent'}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Crucial distinction: missing data is not normal data */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-danger-light)]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>No measurement recorded</span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                          Missing telemetry is not evaluated as normal. Caregiver/ASHA follow-up triggered.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rationale & Review Footnote */}
                <div className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(88,129,87,0.15)] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                      <span className="font-semibold text-[var(--color-primary-light)]">AI Evaluation: </span>
                      {chk.evaluation_rationale}
                    </p>
                    {chk.is_reviewed && chk.reviewed_by && (
                      <p className="text-[10px] text-[var(--color-accent-light)] mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Closed by {chk.reviewed_by} · {chk.clinician_decision || 'Reviewed'}
                      </p>
                    )}
                  </div>

                  {/* Authorised Clinician Action Button */}
                  <button
                    onClick={() => setSelectedCheckpoint(chk)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 text-[var(--color-primary-light)] hover:bg-[rgba(107,154,150,0.15)] transition-colors cursor-pointer"
                    style={{ border: '1px solid rgba(107,154,150,0.3)' }}
                  >
                    <span>Record Decision</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Authorised Clinician Review Modal */}
      <AnimatePresence>
        {selectedCheckpoint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCheckpoint(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md glass-card p-6 !rounded-3xl border border-[var(--color-border-light)] z-10"
              style={{ background: 'rgba(20,30,26,0.98)' }}
            >
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
                Clinician Decision Record
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Checkpoint: {selectedCheckpoint.checkpoint_code} ({selectedCheckpoint.title}) for {patientName}
              </p>

              <form onSubmit={handleRecordDecision} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Clinical Action Decision
                  </label>
                  <select
                    value={reviewDecision}
                    onChange={e => setReviewDecision(e.target.value)}
                    className="form-input"
                  >
                    <option value="Dose Adjusted">Dose Titrated / Adjusted</option>
                    <option value="Confirmed Stable">Confirmed Stable / Continue Pathway</option>
                    <option value="Laboratory Re-ordered">Laboratory Test Re-ordered</option>
                    <option value="Tele-consult Scheduled">Tele-consultation Scheduled</option>
                    <option value="Escalated to Hospital">Escalated to Acute OPD / ER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                    Clinical Notes &amp; Rationale
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter clinical rationale for audit trail..."
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    className="form-input text-xs"
                    required
                  />
                </div>

                {reviewSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Checkpoint resolved &amp; immutable audit event logged.
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setSelectedCheckpoint(null)}
                    className="btn-ghost text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-primary text-xs cursor-pointer"
                  >
                    {submittingReview ? 'Signing...' : 'Approve & Close Checkpoint'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

