import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, CheckCircle2, Zap, GitBranch, Trash2 } from 'lucide-react';
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
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" />

          {/* Popover Card */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-14 right-8 z-50 w-96 glass-card overflow-hidden border border-[var(--color-border-light)] shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[var(--color-primary-light)]" />
                <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="badge badge-critical text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[var(--color-primary-light)] hover:underline"
                >
                  Mark read
                </button>
                <button onClick={onClose} className="p-1 text-[var(--color-text-muted)] hover:text-white">
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
                      className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        !item.read ? 'bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10' : 'hover:bg-[var(--color-surface-hover)]'
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {item.type === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-[var(--color-danger)]" />
                        ) : item.type === 'pipeline' ? (
                          <GitBranch className="w-4 h-4 text-[var(--color-accent)]" />
                        ) : item.type === 'system' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Zap className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className={`text-xs font-semibold truncate ${!item.read ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                        <span className="text-[10px] text-[var(--color-text-muted)] mt-1.5 block">
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
              <div className="p-3 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--color-text-muted)]">{items.length} total alerts</span>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[var(--color-danger)] hover:underline"
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
