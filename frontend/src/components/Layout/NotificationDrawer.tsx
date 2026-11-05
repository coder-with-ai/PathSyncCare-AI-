import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle2, Zap, GitBranch, Trash2, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: string;
  type: 'critical' | 'alert' | 'pipeline' | 'system';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'critical',
    title: 'Critical Deviation: Vikram Singh',
    desc: 'Serum potassium elevated (5.8 mEq/L) — hyperkalemia risk flagged by Rule Engine.',
    time: '10 mins ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'critical',
    title: 'High Risk Alert: Anita Sharma',
    desc: 'Patient reported statin side effect (myalgia). Doctor review required.',
    time: '35 mins ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'pipeline',
    title: 'RocketRide Pipeline Completed',
    desc: 'Daily Sweep RUN-001 processed 14 patients and generated 4 active alerts.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'ABDM Health Records Synced',
    desc: 'All 14 patient profiles linked to ABHA Gateway successfully.',
    time: '3 hours ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'alert',
    title: 'Care Twin Trajectory Shift: Rajesh Kumar',
    desc: 'Systolic BP trending upward. Confidence gate passed (95%).',
    time: '5 hours ago',
    read: true,
  },
];

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setItems([]);
  };

  const toggleRead = (id: string) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: !n.read } : n)));
  };

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />

          {/* Notification Popover Card */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-14 right-4 z-50 w-96 glass-card overflow-hidden !rounded-2xl border border-[var(--color-border-light)] shadow-2xl"
            style={{
              background: 'rgba(20, 30, 26, 0.96)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
                >
                  <Bell className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
                </div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="badge badge-critical text-[9px]">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-[var(--color-primary-light)] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" /> Mark all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-[var(--color-border)]">
              {items.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
                  No notifications
                </div>
              ) : (
                items.map(item => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleRead(item.id)}
                      className="p-3.5 flex items-start gap-3 cursor-pointer transition-colors"
                      style={{
                        background: !item.read ? 'rgba(107, 154, 150, 0.07)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = 'rgba(36, 53, 44, 0.8)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = !item.read
                          ? 'rgba(107, 154, 150, 0.07)'
                          : 'transparent';
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {item.type === 'critical' ? (
                          <div className="w-6 h-6 rounded-lg bg-[rgba(192,57,43,0.15)] border border-[rgba(192,57,43,0.3)] flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-danger-light)]" />
                          </div>
                        ) : item.type === 'pipeline' ? (
                          <div className="w-6 h-6 rounded-lg bg-[rgba(107,154,150,0.15)] border border-[rgba(107,154,150,0.3)] flex items-center justify-center">
                            <GitBranch className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
                          </div>
                        ) : item.type === 'system' ? (
                          <div className="w-6 h-6 rounded-lg bg-[rgba(88,129,87,0.15)] border border-[rgba(88,129,87,0.3)] flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-[rgba(212,134,10,0.15)] border border-[rgba(212,134,10,0.3)] flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-[var(--color-warning-light)]" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p
                            className={`text-xs font-semibold truncate ${
                              !item.read ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                            }`}
                          >
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                        <span className="text-[9px] text-[var(--color-text-muted)] mt-1.5 block">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="p-3 border-t border-[var(--color-border)] flex items-center justify-between text-[11px]"
                style={{ background: 'rgba(28, 41, 34, 0.7)' }}
              >
                <span className="text-[var(--color-text-muted)]">{items.length} total notifications</span>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[var(--color-danger-light)] hover:underline cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear all
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
