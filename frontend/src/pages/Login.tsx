import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, Key, Shield, ArrowRight, UserCheck, Stethoscope, Activity } from 'lucide-react';

export default function Login() {
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'abha' | 'otp'>('abha');
  const navigate = useNavigate();

  const handleLoginSuccess = (roleName: string) => {
    localStorage.setItem('user_session', JSON.stringify({ role: roleName, loginAt: new Date().toISOString() }));
    navigate('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'abha') {
      setStep('otp');
    } else {
      handleLoginSuccess('Dr. Arun Mehta');
    }
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${80 + i * 60}px`,
              height: `${80 + i * 60}px`,
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(59,130,246,0.08)' : 'rgba(16,185,129,0.06)'}, transparent)`,
              left: `${15 + i * 18}%`,
              top: `${10 + i * 15}%`,
            }}
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass-card p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20"
            >
              <HeartPulse className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              PathCareSync AI
            </h1>
            <p className="text-xs text-[var(--color-primary-light)] font-medium mt-1 uppercase tracking-wider">
              Adaptive Care Intelligence Platform
            </p>
          </div>

          {/* ABDM Badge */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-[var(--color-border)]" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider">
                ABDM / ABHA Passwordless Demo Portal
              </span>
            </div>
            <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-[var(--color-border)]" />
          </div>

          {/* Preset One-Click Role Selector */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 text-center">
              Quick Demo Access (No Password Required)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLoginSuccess('Dr. Arun Mehta')}
                className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">Dr. Arun Mehta</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">Lead Cardiologist</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-primary-light)] group-hover:underline">
                  Enter Dashboard <ArrowRight className="w-3 h-3" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleLoginSuccess('ASHA Supervisor')}
                className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-[var(--color-accent)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">ASHA Worker</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">Lucknow District</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 group-hover:underline">
                  Enter Dashboard <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
            <span className="flex-shrink mx-3 text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">Or Custom ABHA Auth</span>
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
          </div>

          {/* Custom ABHA / OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {step === 'abha' ? (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                  ABHA Number / Health ID
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={abhaId}
                    onChange={(e) => setAbhaId(e.target.value)}
                    placeholder="91-2345-6789-0123"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors font-mono"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  Enter Demo OTP (Any 6 Digits)
                </label>
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      value={otp[i] || ''}
                      onChange={(e) => {
                        const newOtp = otp.split('');
                        newOtp[i] = e.target.value;
                        setOtp(newOtp.join(''));
                        if (e.target.value && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      className="w-10 h-11 text-center rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-base font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[var(--color-primary)]/20 transition-all cursor-pointer"
            >
              {step === 'abha' ? 'Request Demo OTP' : 'Verify & Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Single Click Skip */}
          <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
            <button
              onClick={() => handleLoginSuccess('Guest Clinician')}
              className="w-full h-9 rounded-xl bg-[var(--color-bg-tertiary)]/50 border border-[var(--color-border)] text-[11px] text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-surface-hover)] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Instant Sandbox Access (No Password Required)
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-[var(--color-text-muted)] mt-4">
          PathCareSync AI Demo · ABDM Sandbox Integrated · Made for India 🇮🇳
        </p>
      </motion.div>
    </div>
  );
}
