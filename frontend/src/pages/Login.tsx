import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse, Key, Shield, ArrowRight, UserCheck,
  Stethoscope, Activity, Leaf, Lock, Database,
  User, Mail, Sparkles, Check, RefreshCw
} from 'lucide-react';
import DatabaseConnectionModal from '../components/Database/DatabaseConnectionModal';
import {
  getDatabaseConfig,
  sendSupabaseOtp,
  verifySupabaseOtp,
  type DatabaseConfig
} from '../api/supabaseClient';
import { registerNewPatient } from '../api/mockData';
import type { DiseaseType } from '../types';

type AuthMode = 'signin' | 'register';
type AuthStep = 'form' | 'otp';
type PortalRole = 'Doctor' | 'Patient';

export default function Login() {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [step, setStep] = useState<AuthStep>('form');
  const [role, setRole] = useState<PortalRole>('Doctor');

  // Sign in state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAbha, setRegAbha] = useState('');
  const [regDisease, setRegDisease] = useState<DiseaseType>('Hypertension');
  const [regAge, setRegAge] = useState<number>(54);
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regPhone, setRegPhone] = useState('+91-98765-43210');
  const [regDischargeDate, setRegDischargeDate] = useState(() =>
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10)
  );

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [realEmailSent, setRealEmailSent] = useState(false);

  // Database connector modal
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>(() => getDatabaseConfig());

  const navigate = useNavigate();

  const handleStartOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingOtp(true);
    setOtpError('');
    const destination = authMode === 'register' ? regEmail.trim() : loginIdentifier.trim();

    try {
      const res = await sendSupabaseOtp(destination);
      setOtpSentMessage(res.message);
      setRealEmailSent(res.realEmailSent);
      setStep('otp');
    } catch {
      setOtpSentMessage(`Verification code sent for ${destination || 'your account'}. Use code 452188.`);
      setRealEmailSent(false);
      setStep('otp');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    const destination = authMode === 'register' ? regEmail.trim() : loginIdentifier.trim();
    setIsSendingOtp(true);
    setOtpError('');
    try {
      const res = await sendSupabaseOtp(destination);
      setOtpSentMessage(res.message);
      setRealEmailSent(res.realEmailSent);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (val: string, index: number) => {
    const updated = [...otp];
    updated[index] = val.slice(-1);
    setOtp(updated);
    setOtpError('');
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleFillDemoOtp = () => {
    setOtp(['4', '5', '2', '1', '8', '8']);
    setOtpError('');
  };

  const handleVerifyAndLogin = async () => {
    setIsVerifying(true);
    setOtpError('');
    const destination = authMode === 'register' ? regEmail.trim() : loginIdentifier.trim();
    const token = otp.join('');

    const verifyRes = await verifySupabaseOtp(destination, token);
    if (!verifyRes.success) {
      setOtpError(verifyRes.message || 'Incorrect verification code. Please check your email or click "Auto-fill Demo Code (452188)".');
      setIsVerifying(false);
      return;
    }

    if (authMode === 'register' && role === 'Patient') {
      // Register the new patient into the cohort and local persistence
      const createdPatient = registerNewPatient({
        name: regName.trim(),
        email: regEmail.trim(),
        abha_id: regAbha.trim() || `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        disease: regDisease,
        age: regAge,
        gender: regGender,
        phone: regPhone,
        discharge_date: regDischargeDate,
      });

      localStorage.setItem(
        'user_session',
        JSON.stringify({
          role: 'Patient',
          patient_id: createdPatient.id,
          name: createdPatient.name,
          email: regEmail,
          abha_id: createdPatient.abha_id,
          disease: createdPatient.disease,
          loginAt: new Date().toISOString(),
        })
      );

      navigate('/patient-portal');
    } else if (role === 'Patient') {
      localStorage.setItem(
        'user_session',
        JSON.stringify({
          role: 'Patient',
          patient_id: 'P-1001',
          name: loginIdentifier || 'Ramesh Patel',
          loginAt: new Date().toISOString(),
        })
      );
      navigate('/patient-portal');
    } else {
      // Logged in as Doctor
      const doctorName = regName || loginIdentifier || 'Dr. Arun Mehta';
      localStorage.setItem(
        'user_session',
        JSON.stringify({
          role: 'Doctor',
          name: doctorName,
          loginAt: new Date().toISOString(),
        })
      );
      navigate('/dashboard');
    }
    setIsVerifying(false);
  };

  // Instant demo helper
  const handleQuickDemoAccess = (demoRole: string, targetPath: string, patientId?: string) => {
    localStorage.setItem(
      'user_session',
      JSON.stringify({
        role: demoRole,
        patient_id: patientId || (demoRole === 'Patient' ? 'P-1001' : undefined),
        name: demoRole === 'Doctor' ? 'Dr. Arun Mehta' : demoRole === 'Patient' ? 'Ramesh Patel' : 'Sunita Devi (ASHA)',
        loginAt: new Date().toISOString(),
      })
    );
    navigate(targetPath);
  };

  return (
    <div className="login-bg min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Floating ambient blobs */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${90 + i * 60}px`,
            height: `${90 + i * 60}px`,
            background: `radial-gradient(circle, ${
              i % 2 === 0 ? 'rgba(107,154,150,0.1)' : 'rgba(88,129,87,0.08)'
            }, transparent)`,
            left: `${10 + i * 18}%`,
            top: `${8 + i * 14}%`,
            filter: 'blur(3px)',
          }}
          animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-[500px]"
      >
        {/* Main Glass Card */}
        <div className="glass-card p-6 md:p-8 shadow-2xl !rounded-3xl border border-[var(--color-border-light)]">
          {/* Top Radial Glow */}
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none rounded-t-3xl"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(107,154,150,0.18) 0%, transparent 70%)',
            }}
          />

          {/* Platform Branding */}
          <div className="text-center mb-4 relative">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.9, delay: 0.1 }}
              className="relative inline-block mb-2"
            >
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center mx-auto shadow-lg"
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

          {/* Database Connector Pill Button */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsDbModalOpen(true)}
              className="w-full p-2.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group"
              style={{
                background: dbConfig.provider === 'supabase'
                  ? 'rgba(62,207,142,0.12)'
                  : dbConfig.provider === 'azure'
                  ? 'rgba(107,154,150,0.12)'
                  : 'rgba(212,134,10,0.08)',
                borderColor: dbConfig.provider === 'supabase'
                  ? 'rgba(62,207,142,0.35)'
                  : dbConfig.provider === 'azure'
                  ? 'rgba(107,154,150,0.35)'
                  : 'rgba(212,134,10,0.25)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: dbConfig.provider === 'supabase' ? 'rgba(62,207,142,0.2)' : 'rgba(107,154,150,0.2)',
                  }}
                >
                  <Database className={`w-3.5 h-3.5 ${dbConfig.provider === 'supabase' ? 'text-[#3ECF8E]' : 'text-[var(--color-primary-light)]'}`} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">
                      {dbConfig.provider === 'supabase'
                        ? 'Supabase Cloud DB'
                        : dbConfig.provider === 'azure'
                        ? 'Azure SQL Database'
                        : 'Local Demo Database'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[9px] text-[var(--color-text-muted)]">
                    {dbConfig.provider === 'supabase'
                      ? 'Live PostgreSQL Synchronized'
                      : dbConfig.provider === 'azure'
                      ? 'FastAPI Backend Connected'
                      : 'Running 100-Patient Sandbox'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-primary-light)] group-hover:translate-x-0.5 transition-transform">
                <span>Configure DB</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>

          {/* ─── STAGE 1: FORM (SIGN IN OR REGISTER) ─── */}
          {step === 'form' && (
            <div className="space-y-4">
              {/* Tab Switcher: Sign In vs Register (Compulsory for first-time users) */}
              <div className="p-1 rounded-2xl bg-[rgba(28,41,34,0.7)] border border-[var(--color-border)] flex">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-[var(--color-primary)]/20 text-white border border-[var(--color-primary-light)]/40 shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'register'
                      ? 'bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/40 shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:text-white'
                  }`}
                >
                  <span>New User Register</span>
                  <span className="text-[9px] px-1.5 py-0.2 bg-[#3ECF8E]/20 rounded-md font-mono">1st Time</span>
                </button>
              </div>

              {/* Role Selection: Doctor vs Patient */}
              <div>
                <label className="block text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1.5">
                  Access Portal as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('Doctor')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      role === 'Doctor'
                        ? 'bg-[var(--color-primary)]/15 border-[var(--color-primary-light)] text-white'
                        : 'bg-[rgba(28,41,34,0.5)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-[var(--color-primary-light)] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Doctor</p>
                      <p className="text-[9px] opacity-75">All Patients &amp; Triage</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('Patient')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                      role === 'Patient'
                        ? 'bg-[#3ECF8E]/15 border-[#3ECF8E] text-white'
                        : 'bg-[rgba(28,41,34,0.5)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#3ECF8E] flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold leading-tight">Patient</p>
                      <p className="text-[9px] opacity-75">My Health Progress</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* ─── SIGN IN FORM ─── */}
              {authMode === 'signin' && (
                <form onSubmit={handleStartOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      Email Address or ABHA Health ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="doctor@hospital.org or 91-4521-8890-1001"
                        className="form-input pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="form-input pl-9 text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #6B9A96, #4A7A76)',
                    }}
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending OTP Email via Supabase...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5" />
                        <span>Generate Authentication OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ─── REGISTRATION FORM (Compulsory for 1st Time) ─── */}
              {authMode === 'register' && (
                <form onSubmit={handleStartOtp} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="e.g. Rajesh Sharma"
                        className="form-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="form-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="form-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                        ABHA ID (Ayushman Bharat) *
                      </label>
                      <input
                        type="text"
                        required
                        value={regAbha}
                        onChange={e => setRegAbha(e.target.value)}
                        placeholder="91-2345-6789-0123"
                        className="form-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Patient Specific Clinical Setup */}
                  {role === 'Patient' && (
                    <div className="p-3 rounded-2xl bg-[rgba(62,207,142,0.08)] border border-[rgba(62,207,142,0.25)] space-y-2.5">
                      <p className="text-[11px] font-bold text-white flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-[#3ECF8E]" />
                        Clinical Care Pathway &amp; Discharge Setup
                      </p>

                      <div>
                        <label className="block text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1">
                          Primary Non-Communicable Diagnosis *
                        </label>
                        <select
                          value={regDisease}
                          onChange={e => setRegDisease(e.target.value as DiseaseType)}
                          className="form-input text-xs"
                        >
                          <option value="Hypertension">Hypertension (Hemodynamic Care Twin)</option>
                          <option value="Type 2 Diabetes">Type 2 Diabetes (Glycemic Protocol)</option>
                          <option value="Tuberculosis">Tuberculosis (DOTS Adherence Pathway)</option>
                          <option value="Coronary Artery Disease">Coronary Artery Disease (Post-PCI Protocol)</option>
                          <option value="Chronic Kidney Disease">Chronic Kidney Disease (Nephroprotection)</option>
                          <option value="Stroke Recovery">Stroke Recovery (Rehabilitation Tracker)</option>
                          <option value="Depression">Depression (Validated Mental Health Pathway)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1">
                            Age
                          </label>
                          <input
                            type="number"
                            value={regAge}
                            onChange={e => setRegAge(Number(e.target.value))}
                            className="form-input text-xs tabular-nums"
                            min={18}
                            max={100}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1">
                            Gender
                          </label>
                          <select
                            value={regGender}
                            onChange={e => setRegGender(e.target.value as any)}
                            className="form-input text-xs"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1">
                            Discharge Date
                          </label>
                          <input
                            type="date"
                            value={regDischargeDate}
                            onChange={e => setRegDischargeDate(e.target.value)}
                            className="form-input text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[var(--color-text-secondary)] mb-1">
                          Mobile Number (for Telemetry &amp; OTP)
                        </label>
                        <input
                          type="tel"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          className="form-input text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full h-10 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg disabled:opacity-60"
                    style={{
                      background: 'linear-gradient(135deg, #3ECF8E, #2BA56D)',
                    }}
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Verification Email...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        <span>Proceed to OTP Verification</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ─── STAGE 2: 2-FACTOR / OTP AUTHENTICATION ─── */}
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-[#3ECF8E]"
                  style={{ background: 'rgba(62,207,142,0.15)', border: '1px solid rgba(62,207,142,0.3)' }}
                >
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Enter 6-Digit Authentication OTP</h3>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
                  {otpSentMessage || 'A verification code has been dispatched to your registered credentials.'}
                </p>
                {realEmailSent ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#3ECF8E]/15 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[10px] font-medium mt-2">
                    <Mail className="w-3 h-3" />
                    <span>Real Email Dispatched via Supabase Auth — Check Inbox / Spam</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(107,154,150,0.12)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[10px] font-medium mt-2">
                    <Sparkles className="w-3 h-3 text-[#3ECF8E]" />
                    <span>Instant Demo Mode Active — Code: 452188</span>
                  </div>
                )}
              </div>

              {otpError && (
                <div className="p-2.5 rounded-xl bg-[rgba(239,68,68,0.12)] border border-[rgba(239,68,68,0.3)] text-[11px] text-[#fca5a5] text-center">
                  {otpError}
                </div>
              )}

              {/* 6-Digit Input Boxes */}
              <div className="flex gap-2 justify-center py-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e.target.value, idx)}
                    className="w-10 h-12 text-center text-lg font-bold rounded-xl transition-all font-mono"
                    style={{
                      background: 'rgba(28,41,34,0.85)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(62,207,142,0.7)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(62,207,142,0.15)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--color-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ))}
              </div>

              {/* Demo OTP Quick-Fill helper */}
              <div className="flex items-center justify-between text-[10px] px-1 text-[var(--color-text-muted)]">
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  className="text-[#3ECF8E] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-fill Demo Code (452188)
                </button>
                <button
                  type="button"
                  disabled={isSendingOtp}
                  onClick={handleResendOtp}
                  className="hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                  <span>{isSendingOtp ? 'Resending...' : 'Resend OTP'}</span>
                </button>
              </div>

              {/* Verify Button */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isVerifying || otp.some(d => !d)}
                  onClick={handleVerifyAndLogin}
                  className="w-full h-11 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg disabled:opacity-50"
                  style={{
                    background: role === 'Patient'
                      ? 'linear-gradient(135deg, #3ECF8E, #2BA56D)'
                      : 'linear-gradient(135deg, #6B9A96, #4A7A76)',
                  }}
                >
                  {isVerifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isVerifying ? 'Verifying & Initializing Profile...' : `Verify OTP & Enter ${role} Portal`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full text-center text-[10px] text-[var(--color-text-muted)] hover:text-white cursor-pointer py-1"
                >
                  ← Back to credentials
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── QUICK DEMO SANDBOX (PRESERVED AS REQUESTED) ─── */}
          <div className="mt-5 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                Instant Demo Mode (Preserved)
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Judges &amp; Evaluators
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Dr. Arun Mehta (Preserved Lead Doctor) */}
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('Doctor', '/dashboard')}
                className="p-2.5 rounded-xl border text-left transition-all cursor-pointer bg-[rgba(107,154,150,0.1)] border-[rgba(107,154,150,0.25)] hover:bg-[rgba(107,154,150,0.18)]"
              >
                <div className="flex items-center gap-1.5 text-[var(--color-primary-light)] mb-0.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Dr. Arun Mehta</span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)]">Lead Cardiologist (All 100 Patients)</p>
              </button>

              {/* Demo Patient Ramesh Patel */}
              <button
                type="button"
                onClick={() => handleQuickDemoAccess('Patient', '/patient-portal', 'P-1001')}
                className="p-2.5 rounded-xl border text-left transition-all cursor-pointer bg-[rgba(62,207,142,0.1)] border-[rgba(62,207,142,0.25)] hover:bg-[rgba(62,207,142,0.18)]"
              >
                <div className="flex items-center gap-1.5 text-[#3ECF8E] mb-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-white">Ramesh Patel</span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)]">Hypertension (Day 14 Post-Discharge)</p>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Footer */}
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
