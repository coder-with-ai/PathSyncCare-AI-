import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, Loader2, Calendar } from 'lucide-react';
import type { Milestone } from '../../types';

const statusConfig = {
  completed:   { icon: CheckCircle, colorVar: 'var(--color-accent-light)',   label: 'Completed',   dotClass: 'timeline-dot-completed'   },
  overdue:     { icon: AlertTriangle,colorVar: 'var(--color-danger-light)',  label: 'Overdue',     dotClass: 'timeline-dot-overdue'     },
  pending:     { icon: Clock,       colorVar: 'var(--color-text-muted)',     label: 'Pending',     dotClass: 'timeline-dot-pending'     },
  in_progress: { icon: Loader2,     colorVar: 'var(--color-primary-light)',  label: 'In Progress', dotClass: 'timeline-dot-in_progress' },
};

interface CarePlanTimelineProps {
  milestones: Milestone[];
}

export default function CarePlanTimeline({ milestones }: CarePlanTimelineProps) {
  const completed = milestones.filter(m => m.status === 'completed').length;
  const progress  = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--color-primary-light)]" />
          Care Plan Timeline
        </h3>
        <span className="text-[10px] font-bold text-[var(--color-accent-light)]">
          {completed}/{milestones.length} done
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
          />
        </div>
        <p className="text-[9px] text-[var(--color-text-muted)] mt-1">{progress}% plan completed</p>
      </div>

      {/* Timeline items */}
      <div className="relative pl-8">
        <div className="timeline-line" />
        <div className="space-y-5">
          {milestones.map((milestone, i) => {
            const config = statusConfig[milestone.status] || statusConfig.pending;
            const Icon   = config.icon;
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative flex gap-4"
              >
                <div
                  className={`timeline-dot ${config.dotClass}`}
                  style={{ marginTop: '4px' }}
                />
                <div className="flex-1 pb-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug">
                      {milestone.title}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Icon
                        className={`w-3.5 h-3.5 ${milestone.status === 'in_progress' ? 'animate-spin' : ''}`}
                        style={{ color: config.colorVar }}
                      />
                      <span className="text-[10px] font-semibold" style={{ color: config.colorVar }}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{milestone.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-[var(--color-text-muted)]">Due: {milestone.due_date}</span>
                    {milestone.completed_date && (
                      <span className="text-[10px] text-[var(--color-accent-light)]">
                        ✓ {milestone.completed_date}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
