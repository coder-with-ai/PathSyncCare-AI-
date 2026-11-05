import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, Key, Shield, ArrowRight, UserCheck,
  Stethoscope, Activity, Leaf, Lock
} from 'lucide-react';

export default function Login() {
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp]       = useState('');
  const [step, setStep]     = useState<'abha' | 'otp'>('abha');
  const navigate = useNavigate();

  const handleLoginSuccess = (roleName: string) => {
    localStorage.setItem('user_session', JSON.stringify({ role: roleName, loginAt: new Date().toISOString() }));
    navigate('/dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'abha') setStep('otp');
    else handleLoginSuccess('Dr. Arun Mehta');
  };

  // OTP input auto-advance
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
            width:  `${80 + i * 60}px`,
            height: `${80 + i * 60}px`,
            background: `radial-gradient(circle, ${
              i % 2 === 0 ? 'rgba(107,154,150,0.1)' : 'rgba(88,129,87,0.08)'
            }, transparent)`,
            left:  `${12 + i * 18}%`,
            top:   `${8 + i * 14}%`,
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
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Card */}
        <div className="glass-card p-8 shadow-2xl !rounded-3xl">
          {/* Inner top gradient */}
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-t-3xl"
            style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(107,154,150,0.14) 0%, transparent 70%)' }}
          />

          {/* Logo */}
          <div className="text-center mb-7 relative">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.9, delay: 0.1 }}
              className="relative inline-block mb-4"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6B9A96, #588157)' }}
              >
                <HeartPulse className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--color-bg-primary)', border: '2px solid var(--color-bg-primary)' }}
              >
                <Leaf className="w-3 h-3 text-[var(--color-accent-light)]" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">PathCareSync AI</h1>
            <p className="text-xs text-[var(--color-primary-light)] font-semibold mt-1 uppercase tracking-widest opacity-90">
              Adaptive Care Intelligence Platform
            </p>
          </div>

          {/* ABDM Badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(88,129,87,0.1)', border: '1px solid rgba(88,129,87,0.2)' }}
            >
              <Shield className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
              <span className="text-[9px] text-[var(--color-accent-light)] font-bold uppercase tracking-widest">
                ABDM / ABHA Passwordless
              </span>
            </div>
            <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
          </div>

          {/* Quick Demo Access */}
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-3 text-center">
              Quick Demo Access
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Doctor */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleLoginSuccess('Dr. Arun Mehta')}
                className="p-4 rounded-2xl text-left transition-all group cursor-pointer"
                style={{
                  background: 'rgba(107,154,150,0.08)',
                  border: '1px solid rgba(107,154,150,0.2)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(107,154,150,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,154,150,0.14)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(107,154,150,0.2)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,154,150,0.08)';
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Stethoscope className="w-4 h-4 text-[var(--color-primary-light)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">Dr. Arun Mehta</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">Lead Cardiologist</p>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-primary-light)]">
                  Enter Dashboard <ArrowRight className="w-3 h-3" />
                </div>
              </motion.button>

              {/* ASHA Worker */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleLoginSuccess('ASHA Supervisor')}
                className="p-4 rounded-2xl text-left transition-all group cursor-pointer"
                style={{
                  background: 'rgba(88,129,87,0.08)',
                  border: '1px solid rgba(88,129,87,0.2)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(88,129,87,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(88,129,87,0.14)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(88,129,87,0.2)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(88,129,87,0.08)';
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity className="w-4 h-4 text-[var(--color-accent-light)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">ASHA Worker</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)]">Lucknow District</p>
                <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent-light)]">
                  Enter Dashboard <ArrowRight className="w-3 h-3" />
                </div>
              </motion.button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2 mb-5">
            <div className="flex-grow border-t" style={{ borderColor: 'var(--color-border)' }} />
            <span className="flex-shrink mx-3 text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-bold">
              Or Custom ABHA Auth
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
                    ABHA Number / Health ID
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                    <input
                      type="text"
                      value={abhaId}
                      onChange={e => setAbhaId(e.target.value)}
                      placeholder="91-2345-6789-0123"
                      className="w-full h-11 pl-10 pr-4 rounded-xl text-xs font-mono transition-all"
                      style={{
                        background: 'rgba(28,41,34,0.8)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        outline: 'none',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'rgba(107,154,150,0.5)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(107,154,150,0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--color-border)';
                        e.target.style.boxShadow = 'none';
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
                    {[0,1,2,3,4,5].map(i => (
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
                        onFocus={e => {
                          e.target.style.borderColor = 'rgba(107,154,150,0.5)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(107,154,150,0.1)';
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = 'var(--color-border)';
                          e.target.style.boxShadow = 'none';
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
              className="w-full h-11 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(135deg, #6B9A96, #4A7A76)',
                boxShadow: '0 6px 20px rgba(107,154,150,0.35)',
              }}
            >
              <Lock className="w-4 h-4" />
              {step === 'abha' ? 'Request Demo OTP' : 'Verify & Continue'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          {/* Instant access */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => handleLoginSuccess('Guest Clinician')}
              className="w-full h-9 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
              style={{
                background: 'rgba(28,41,34,0.6)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(107,154,150,0.1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(107,154,150,0.25)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(28,41,34,0.6)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-secondary)';
              }}
            >
              <UserCheck className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
              Instant Sandbox Access (No Password Required)
            </button>
          </div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-[var(--color-text-muted)] mt-5"
        >
          PathCareSync AI Demo · ABDM Sandbox Integrated · Made for India 🇮🇳
        </motion.p>
      </motion.div>
    </div>
  );
}
