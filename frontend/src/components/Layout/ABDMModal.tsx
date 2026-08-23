import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Activity, Server, FileText, CheckCircle2, RefreshCw, Database } from 'lucide-react';
import { useState } from 'react';

interface ABDMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ABDMModal({ isOpen, onClose }: ABDMModalProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('2 mins ago');

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync('Just now');
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl glass-card overflow-hidden z-10 border border-[var(--color-border-light)]"
          >
            {/* Top Tricolor Accent */}
            <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                      Ayushman Bharat Digital Mission (ABDM)
                    </h3>
                    <span className="badge badge-low text-[10px]">Connected</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    National Health Stack Integration Gateway · Sandbox Environment
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Overview Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
                    <Server className="w-3.5 h-3.5" />
                    HFR Registry ID
                  </div>
                  <p className="text-sm font-mono font-bold text-[var(--color-text-primary)]">IN1810002941</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Lucknow District Hospital</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold mb-1">
                    <Database className="w-3.5 h-3.5" />
                    ABHA Records Synced
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">14 Patients (100%)</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Last synced {lastSync}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    Consent Manager
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Active Gateway</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">NHA Gateway M2 API</p>
                </div>
              </div>

              {/* ABDM API Services Live Status */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  ABDM Gateway Microservices
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'ABHA Seed & Verification Service (v2.0)', status: 'Operational', latency: '42ms', code: '200 OK' },
                    { name: 'Health Information Provider (HIP) Data Node', status: 'Operational', latency: '68ms', code: '200 OK' },
                    { name: 'Health Information User (HIU) Telemetry', status: 'Operational', latency: '55ms', code: '200 OK' },
                    { name: 'National Health Claims Exchange (NHCX) Connector', status: 'Standby', latency: '120ms', code: '200 OK' },
                  ].map((svc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-border)]">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-[var(--color-text-primary)]">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-[var(--color-text-muted)]">{svc.latency}</span>
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                          {svc.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo ABDM Log Stream */}
              <div>
                <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Recent ABDM Gateway Transactions</span>
                  <FileText className="w-3.5 h-3.5" />
                </h4>
                <div className="p-3 rounded-xl bg-black/50 font-mono text-[11px] space-y-1.5 text-slate-300 border border-[var(--color-border)]">
                  <p className="text-emerald-400">[2026-08-23 14:40:12] ABDM-GW :: AUTH_SUCCESS abha_id="91-2345-6789-0123" patient="Rajesh Kumar"</p>
                  <p className="text-blue-400">[2026-08-23 14:35:04] ABDM-GW :: HIP_DISCHARGE_SUMMARY_PUSH status=ACK facility="Lucknow Dist Hosp"</p>
                  <p className="text-slate-400">[2026-08-23 14:10:00] ABDM-GW :: CONSENT_GRANT token_exp="2026-09-23" hiu_id="PATHCARESYNC_HIU"</p>
                  <p className="text-purple-400">[2026-08-23 13:52:18] ABDM-GW :: FHIR_R4_BUNDLE_VALIDATED records=14 validation_passed=true</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-muted)]">
                National Health Authority (NHA) Sandbox API v2.0
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn-ghost text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing ABDM...' : 'Force ABDM Re-sync'}
                </button>
                <button onClick={onClose} className="btn-primary text-xs">
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
