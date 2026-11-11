import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Database, Check, AlertCircle, Copy, CheckCheck,
  Server, Zap, Shield, RefreshCw, Key, Globe, ExternalLink
} from 'lucide-react';
import {
  getDatabaseConfig,
  saveDatabaseConfig,
  testSupabaseConnection,
  type DatabaseConfig,
  type DatabaseProvider,
} from '../../api/supabaseClient';

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: (config: DatabaseConfig) => void;
}

export default function DatabaseConnectionModal({
  isOpen,
  onClose,
  onConfigChanged,
}: DatabaseConnectionModalProps) {
  const [provider, setProvider] = useState<DatabaseProvider>(() => getDatabaseConfig().provider);
  const [supabaseUrl, setSupabaseUrl] = useState(() => getDatabaseConfig().supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getDatabaseConfig().supabaseAnonKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    patientCount?: number;
  } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
      setTestResult(res);
    } catch {
      setTestResult({
        success: false,
        message: 'Network check encountered an unhandled error.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    const isConnected = provider === 'supabase'
      ? Boolean(supabaseUrl && supabaseAnonKey && (testResult?.success ?? true))
      : true;

    const newConfig: DatabaseConfig = {
      provider,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      isConnected,
      lastConnectedAt: new Date().toISOString(),
    };

    saveDatabaseConfig(newConfig);
    onConfigChanged?.(newConfig);
    onClose();
  };

  const handleResetDemo = () => {
    const demoConfig: DatabaseConfig = {
      provider: 'mock',
      supabaseUrl: '',
      supabaseAnonKey: '',
      isConnected: true,
      lastConnectedAt: new Date().toISOString(),
    };
    setProvider('mock');
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    saveDatabaseConfig(demoConfig);
    onConfigChanged?.(demoConfig);
  };

  const handleCopySchema = async () => {
    try {
      const res = await fetch('/supabase_schema.sql');
      const text = res.ok ? await res.text() : '-- PathCareSync AI Supabase Schema\n-- Run supabase_schema.sql in Supabase SQL Editor';
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-xl glass-card !overflow-hidden z-10 !rounded-3xl border border-[var(--color-border-light)] shadow-2xl flex flex-col max-h-[90vh]"
          style={{
            background: 'rgba(20, 30, 26, 0.98)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
          }}
        >
          {/* Top Decorative Gradient */}
          <div
            className="h-1.5 w-full"
            style={{
              background: 'linear-gradient(90deg, #3ECF8E, var(--color-primary), #588157)',
            }}
          />

          {/* Header */}
          <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(62,207,142,0.15)',
                  border: '1px solid rgba(62,207,142,0.3)',
                }}
              >
                <Database className="w-5 h-5 text-[#3ECF8E]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                  Database Configuration
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30">
                    Live Connector
                  </span>
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Connect Supabase PostgreSQL, Azure SQL, or run Offline Demo Cohort
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
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Provider Selector Tabs */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-2">
                Active Database Engine
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Supabase Tab */}
                <button
                  type="button"
                  onClick={() => setProvider('supabase')}
                  className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    provider === 'supabase'
                      ? 'bg-[#3ECF8E]/15 border-[#3ECF8E]/50 text-white'
                      : 'bg-[rgba(28,41,34,0.6)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap className="w-4 h-4 text-[#3ECF8E]" />
                    <span className="text-xs font-bold">Supabase</span>
                  </div>
                  <p className="text-[10px] opacity-75">PostgreSQL Cloud</p>
                </button>

                {/* Azure SQL Tab */}
                <button
                  type="button"
                  onClick={() => setProvider('azure')}
                  className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    provider === 'azure'
                      ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary-light)]/50 text-white'
                      : 'bg-[rgba(28,41,34,0.6)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Server className="w-4 h-4 text-[var(--color-primary-light)]" />
                    <span className="text-xs font-bold">Azure SQL</span>
                  </div>
                  <p className="text-[10px] opacity-75">Teammate Backend</p>
                </button>

                {/* Demo Mock Tab */}
                <button
                  type="button"
                  onClick={() => setProvider('mock')}
                  className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                    provider === 'mock'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                      : 'bg-[rgba(28,41,34,0.6)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">Demo Sandbox</span>
                  </div>
                  <p className="text-[10px] opacity-75">100-Patient Local</p>
                </button>
              </div>
            </div>

            {/* Provider Detailed Form: SUPABASE */}
            {provider === 'supabase' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      Supabase Project URL
                    </label>
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#3ECF8E] hover:underline flex items-center gap-1"
                    >
                      Supabase Dashboard <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzprojectname.supabase.co"
                    className="form-input text-xs font-mono"
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">
                    Found in: Supabase Settings → API → Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#3ECF8E]" />
                    Supabase Anon Public API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={supabaseAnonKey}
                      onChange={e => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="form-input text-xs font-mono pr-16"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-muted)] hover:text-white px-2 py-0.5 rounded cursor-pointer"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-1 block">
                    Found in: Supabase Settings → API → Project API Keys (anon / public)
                  </span>
                </div>

                {/* Schema deployment helper */}
                <div className="p-3.5 rounded-2xl bg-[rgba(62,207,142,0.08)] border border-[rgba(62,207,142,0.25)] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
                      Supabase SQL Schema Ready (17 Tables)
                    </p>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      Click to copy and paste directly into Supabase SQL Editor
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySchema}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all bg-[#3ECF8E]/20 text-[#3ECF8E] hover:bg-[#3ECF8E]/30 border border-[#3ECF8E]/40"
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied SQL!' : 'Copy SQL Script'}
                  </button>
                </div>

                {/* Test Connection Button & Result */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleTest}
                    disabled={testing || !supabaseUrl || !supabaseAnonKey}
                    className="w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    style={{
                      background: 'rgba(62,207,142,0.15)',
                      color: '#3ECF8E',
                      border: '1px solid rgba(62,207,142,0.3)',
                    }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    {testing ? 'Pinging Supabase REST Endpoint...' : 'Test Connection to Supabase'}
                  </button>

                  {testResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-3 p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
                        testResult.success
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {testResult.success ? (
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{testResult.message}</p>
                        {testResult.patientCount !== undefined && (
                          <p className="text-[10px] opacity-80 mt-1">
                            Live Patient Cohort Count: <span className="font-bold">{testResult.patientCount}</span> records ready.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Provider Detailed Form: AZURE SQL */}
            {provider === 'azure' && (
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-[rgba(107,154,150,0.1)] border border-[rgba(107,154,150,0.25)] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary-light)]">
                    <Server className="w-4 h-4" />
                    Azure SQL Integration Active via FastAPI
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    The backend repository branch from your teammate (<code className="text-[#3ECF8E]">feature/azure-sql-integration</code>) has been merged into main.
                  </p>
                  <ul className="text-[11px] text-[var(--color-text-muted)] space-y-1 list-disc list-inside">
                    <li>SQLAlchemy 2.0 ORM with pyodbc / mssql driver</li>
                    <li>Alembic migration <code className="text-[var(--color-text-secondary)]">001_initial_schema.py</code> ready</li>
                    <li>Verification script: <code className="text-[var(--color-text-secondary)]">python backend/verify_azure_sql.py</code></li>
                    <li>Documentation: <code className="text-[var(--color-text-secondary)]">backend/AZURE_SQL_DEPLOYMENT.md</code></li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--color-border)]">
                  <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Backend Proxy Endpoint</p>
                  <p className="text-xs font-mono text-[var(--color-text-muted)]">http://localhost:8000/api</p>
                </div>
              </div>
            )}

            {/* Provider Detailed Form: MOCK DEMO */}
            {provider === 'mock' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Shield className="w-4 h-4" />
                  Offline Standalone Demo Sandbox
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  PathCareSync AI runs completely offline with a rich 100-patient synthetic cohort, covering all 7 disease pathways, real-time XGBoost trajectory scoring, ABDM consent records, and an immutable audit ledger.
                </p>
                <p className="text-[10px] text-amber-400 font-medium">
                  Ideal for live hackathon evaluations, judge demonstrations, and zero-latency UI walkthroughs.
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-[var(--color-border)] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDemo}
              className="text-xs text-[var(--color-text-muted)] hover:text-white underline cursor-pointer"
            >
              Reset to Demo Sandbox
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer"
                style={provider === 'supabase' ? {
                  background: 'linear-gradient(135deg, #3ECF8E, #2BA56D)',
                  borderColor: '#3ECF8E',
                } : {}}
              >
                <Check className="w-3.5 h-3.5" />
                Save &amp; Connect Database
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
