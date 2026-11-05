import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Activity, Server, FileText, CheckCircle2, RefreshCw, Database, Terminal } from 'lucide-react';
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
    }, 1200);
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
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl glass-card !overflow-hidden z-10 !rounded-3xl border border-[var(--color-border-light)] shadow-2xl"
            style={{
              background: 'rgba(20, 30, 26, 0.98)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
            }}
          >
            {/* Top Tricolor Accent */}
            <div className="h-1.5 flex w-full">
              <div className="flex-1" style={{ background: '#FF9933' }} />
              <div className="flex-1" style={{ background: '#FFFFFF' }} />
              <div className="flex-1" style={{ background: '#138808' }} />
            </div>

            {/* Header */}
            <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(88,129,87,0.15)',
                    border: '1px solid rgba(88,129,87,0.3)',
                  }}
                >
                  <ShieldCheck className="w-5 h-5 text-[var(--color-accent-light)]" />
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
                className="p-2 rounded-xl hover:bg-[var(--color-surface-hover)] transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div
                  className="p-4 rounded-2xl"
                  style={{ background: 'rgba(28,41,34,0.7)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold mb-1" style={{ color: 'var(--color-accent-light)' }}>
                    <Server className="w-3.5 h-3.5" />
                    HFR Registry ID
                  </div>
                  <p className="text-sm font-mono font-bold text-[var(--color-text-primary)]">IN1810002941</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Lucknow District Hospital</p>
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{ background: 'rgba(28,41,34,0.7)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold mb-1" style={{ color: 'var(--color-primary-light)' }}>
                    <Database className="w-3.5 h-3.5" />
                    ABHA Records Synced
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">14 Patients (100%)</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Last synced {lastSync}</p>
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{ background: 'rgba(28,41,34,0.7)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold mb-1" style={{ color: 'var(--color-sage)' }}>
                    <Activity className="w-3.5 h-3.5" />
                    Consent Manager
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Active Gateway</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">NHA Gateway M2 API</p>
                </div>
              </div>

              {/* ABDM Microservices List */}
              <div>
                <h4 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3">
                  ABDM Gateway Microservices
                </h4>
                <div className="space-y-2">
                  {[
                    { name: 'ABHA Seed & Verification Service (v2.0)', latency: '42ms', code: '200 OK' },
                    { name: 'Health Information Provider (HIP) Data Node', latency: '68ms', code: '200 OK' },
                    { name: 'Health Information User (HIU) Telemetry', latency: '55ms', code: '200 OK' },
                    { name: 'National Health Claims Exchange (NHCX) Connector', latency: '120ms', code: '200 OK' },
                  ].map((svc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3.5 rounded-xl transition-all"
                      style={{
                        background: 'rgba(28,41,34,0.6)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-light)] flex-shrink-0" />
                        <span className="text-xs font-medium text-[var(--color-text-primary)]">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-[11px] text-[var(--color-text-muted)]">{svc.latency}</span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                          style={{
                            background: 'rgba(88,129,87,0.15)',
                            color: 'var(--color-accent-light)',
                            border: '1px solid rgba(88,129,87,0.3)',
                          }}
                        >
                          {svc.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demo ABDM Log Stream */}
              <div>
                <h4 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Recent ABDM Gateway Transactions
                  </span>
                  <FileText className="w-3.5 h-3.5" />
                </h4>
                <div
                  className="p-4 rounded-2xl font-mono text-[11px] space-y-2 border"
                  style={{
                    background: 'rgba(12, 18, 15, 0.85)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <p style={{ color: 'var(--color-accent-light)' }}>
                    [2026-08-23 14:40:12] ABDM-GW :: AUTH_SUCCESS abha_id="91-2345-6789-0123" patient="Rajesh Kumar"
                  </p>
                  <p style={{ color: 'var(--color-primary-light)' }}>
                    [2026-08-23 14:35:04] ABDM-GW :: HIP_DISCHARGE_SUMMARY_PUSH status=ACK facility="Lucknow Dist Hosp"
                  </p>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    [2026-08-23 14:10:00] ABDM-GW :: CONSENT_GRANT token_exp="2026-09-23" hiu_id="PATHCARESYNC_HIU"
                  </p>
                  <p style={{ color: 'var(--color-sage)' }}>
                    [2026-08-23 13:52:18] ABDM-GW :: FHIR_R4_BUNDLE_VALIDATED records=14 validation_passed=true
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className="p-4 border-t border-[var(--color-border)] flex items-center justify-between flex-wrap gap-2"
              style={{ background: 'rgba(28, 41, 34, 0.7)' }}
            >
              <span className="text-xs text-[var(--color-text-muted)]">
                National Health Authority (NHA) Sandbox API v2.0
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="btn-ghost text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing ABDM...' : 'Force ABDM Re-sync'}
                </button>
                <button onClick={onClose} className="btn-primary text-xs cursor-pointer">
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
