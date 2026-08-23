import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import type { Milestone } from '../../types';

const statusConfig = {
  completed: { icon: CheckCircle, color: 'var(--color-accent)', label: 'Completed', dotClass: 'timeline-dot-completed' },
  overdue: { icon: AlertTriangle, color: 'var(--color-danger)', label: 'Overdue', dotClass: 'timeline-dot-overdue' },
  pending: { icon: Clock, color: 'var(--color-text-muted)', label: 'Pending', dotClass: 'timeline-dot-pending' },
  in_progress: { icon: Loader2, color: 'var(--color-primary)', label: 'In Progress', dotClass: 'timeline-dot-in_progress' },
};

interface CarePlanTimelineProps {
  milestones: Milestone[];
}

export default function CarePlanTimeline({ milestones }: CarePlanTimelineProps) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-5">
        Care Plan Timeline
      </h3>
      <div className="relative pl-8">
        <div className="timeline-line" />
        <div className="space-y-5">
          {milestones.map((milestone, i) => {
            const config = statusConfig[milestone.status];
            const Icon = config.icon;
            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex gap-4"
              >
                <div
                  className={`timeline-dot ${config.dotClass}`}
                  style={{ marginTop: '4px' }}
                />
                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-4">
                      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                      <span className="text-[11px] font-medium" style={{ color: config.color }}>
                        {config.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-[var(--color-text-muted)]">
                      Due: {milestone.due_date}
                    </span>
                    {milestone.completed_date && (
                      <span className="text-[11px] text-[var(--color-accent)]">
                        ✓ Completed: {milestone.completed_date}
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
