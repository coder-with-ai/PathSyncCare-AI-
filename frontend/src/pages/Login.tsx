import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, Key, Shield, ArrowRight, UserCheck,
  Stethoscope, Activity, Leaf, Lock, Database,
  User
} from 'lucide-react';
import DatabaseConnectionModal from '../components/Database/DatabaseConnectionModal';
import { getDatabaseConfig, type DatabaseConfig } from '../api/supabaseClient';

export default function Login() {
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'abha' | 'otp'>('abha');
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => getDatabaseConfig());
  const navigate = useNavigate();

  const handleLoginSuccess = (roleName: string, path: string = '/dashboard') => {
    localStorage.setItem('user_session', JSON.stringify({ role: roleName, loginAt: new Date().toISOString() }));
    navigate(path);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'abha') {
      setStep('otp');
    } else {
      handleLoginSuccess('Dr. Arun Mehta');
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const newOtp = otp.split('');
    newOtp[idx] = e.target.value.slice(-1);
    setOtp(newOtp.join(''));
    if (e.target.value && e.target.nextElementSibling) {
      (e.target.nextElementSibling as HTMLInputElement).focus();
    }
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Floating ambient blobs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${80 + i * 60}px`,
            height: `${80 + i * 60}px`,
            background: `radial-gradient(circle, ${
              i % 2 === 0 ? 'rgba(107,154,150,0.1)' : 'rgba(88,129,87,0.08)'
            }, transparent)`,
            left: `${12 + i * 18}%`,
            top: `${8 + i * 14}%`,
            filter: 'blur(2px)',
          }}
          animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* Main Glass Card */}
        <div className="glass-card p-7 md:p-8 shadow-2xl !rounded-3xl border border-[var(--color-border-light)]">
          {/* Inner top gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-t-3xl"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(107,154,150,0.16) 0%, transparent 70%)',
            }}
          />

          {/* Logo & Platform Header */}
          <div className="text-center mb-5 relative">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.9, delay: 0.1 }}
              className="relative inline-block mb-3"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6B9A96, #588157)' }}
              >
                <HeartPulse className="w-7 h-7 text-white" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-bg-primary)', border: '2px solid var(--color-bg-primary)' }}
              >
                <Leaf className="w-3 h-3 text-[var(--color-accent-light)]" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">PathCareSync AI</h1>
            <p className="text-xs text-[var(--color-primary-light)] font-semibold mt-0.5 uppercase tracking-widest opacity-90">
              Adaptive Care Intelligence Platform
            </p>
          </div>

          {/* Connect Database Button / Badge (User Requested) */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => setIsDbModalOpen(true)}
              className="w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group"
              style={{
                background: dbConfig.provider === 'supabase'
                  ? 'rgba(62,207,142,0.12)'
                  : dbConfig.provider === 'azure'
                  ? 'rgba(107,154,150,0.12)'
                  : 'rgba(212,134,10,0.1)',
                borderColor: dbConfig.provider === 'supabase'
                  ? 'rgba(62,207,142,0.35)'
                  : dbConfig.provider === 'azure'
                  ? 'rgba(107,154,150,0.35)'
                  : 'rgba(212,134,10,0.3)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: dbConfig.provider === 'supabase' ? 'rgba(62,207,142,0.2)' : 'rgba(107,154,150,0.2)',
                  }}
                >
                  <Database className={`w-4 h-4 ${dbConfig.provider === 'supabase' ? 'text-[#3ECF8E]' : 'text-[var(--color-primary-light)]'}`} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {dbConfig.provider === 'supabase'
                        ? 'Supabase Database'
                        : dbConfig.provider === 'azure'
                        ? 'Azure SQL Database'
                        : 'Local Demo Database'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)]">
                    {dbConfig.provider === 'supabase'
                      ? 'Connected to PostgreSQL Cloud'
                      : dbConfig.provider === 'azure'
                      ? 'Connected via FastAPI Backend'
                      : 'Running 100-Patient Sandbox'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary-light)] group-hover:translate-x-0.5 transition-transform">
                <span>Configure DB</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Quick Access Roles: Doctor, Patient, ASHA */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-2.5 text-center">
              Select Portal Access Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Doctor Dashboard */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleLoginSuccess('Dr. Arun Mehta', '/dashboard')}
                className="p-3 rounded-2xl text-left transition-all border cursor-pointer bg-[rgba(107,154,150,0.08)] border-[rgba(107,154,150,0.25)] hover:bg-[rgba(107,154,150,0.15)] hover:border-[rgba(107,154,150,0.4)]"
              >
                <div className="flex items-center gap-1.5 mb-1 text-[var(--color-primary-light)]">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Doctor</span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)]">Cardiology</p>
                <span className="text-[9px] text-[var(--color-primary-light)] font-semibold mt-2 block">
                  Dashboard →
                </span>
              </motion.button>

              {/* Patient Portal */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleLoginSuccess('Ramesh Patel', '/patient-portal')}
                className="p-3 rounded-2xl text-left transition-all border cursor-pointer bg-[rgba(62,207,142,0.1)] border-[rgba(62,207,142,0.3)] hover:bg-[rgba(62,207,142,0.18)] hover:border-[#3ECF8E]"
              >
                <div className="flex items-center gap-1.5 mb-1 text-[#3ECF8E]">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Patient</span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)]">Ramesh Patel</p>
                <span className="text-[9px] text-[#3ECF8E] font-semibold mt-2 block">
                  Track Health →
                </span>
              </motion.button>

              {/* ASHA Worker */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleLoginSuccess('ASHA Supervisor', '/patients')}
                className="p-3 rounded-2xl text-left transition-all border cursor-pointer bg-[rgba(88,129,87,0.08)] border-[rgba(88,129,87,0.25)] hover:bg-[rgba(88,129,87,0.15)] hover:border-[rgba(88,129,87,0.4)]"
              >
                <div className="flex items-center gap-1.5 mb-1 text-[var(--color-accent-light)]">
                  <Activity className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">ASHA</span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)]">Community</p>
                <span className="text-[9px] text-[var(--color-accent-light)] font-semibold mt-2 block">
                  Cohort →
                </span>
              </motion.button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-1 mb-4">
            <div className="flex-grow border-t" style={{ borderColor: 'var(--color-border)' }} />
            <span className="flex-shrink mx-3 text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">
              Or Sign In with ABHA ID
            </span>
            <div className="flex-grow border-t" style={{ borderColor: 'var(--color-border)' }} />
          </div>

          {/* ABHA / OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 'abha' ? (
                <motion.div
                  key="abha"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">
                    ABHA Number / National Health ID
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      value={abhaId}
                      onChange={e => setAbhaId(e.target.value)}
                      placeholder="91-4521-8890-1001"
                      className="w-full h-11 pl-10 pr-4 rounded-xl text-xs font-mono transition-all"
                      style={{
                        background: 'rgba(28,41,34,0.8)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2 text-center">
                    Enter Demo OTP (Any 6 Digits)
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={otp[i] || ''}
                        onChange={e => handleOtpChange(e, i)}
                        className="w-10 h-11 text-center rounded-xl text-base font-bold transition-all"
                        style={{
                          background: 'rgba(28,41,34,0.8)',
                          border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)',
                          outline: 'none',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #6B9A96, #4A7A76)',
              }}
            >
              <Lock className="w-4 h-4" />
              {step === 'abha' ? 'Request Instant OTP' : 'Verify & Enter Portal'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          {/* Sandbox direct button */}
          <div className="mt-4 pt-3.5 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => handleLoginSuccess('Guest Clinician')}
              className="w-full h-9 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all bg-[rgba(28,41,34,0.6)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white"
            >
              <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
              Instant Sandbox Access (No Password Required)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 space-y-1">
          <p className="text-[10px] text-[var(--color-text-muted)] flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-[var(--color-accent-light)]" />
            <span>ABDM Integrated · HIPAA Security Rule Aligned · Made for India 🇮🇳</span>
          </p>
          <p className="text-[9px] text-[var(--color-text-muted)]">
            Supabase PostgreSQL &amp; Azure SQL Live Synchronized
          </p>
        </div>
      </motion.div>

      {/* Database Configuration Modal */}
      <DatabaseConnectionModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onConfigChanged={cfg => setDbConfig(cfg)}
      />
    </div>
  );
}
