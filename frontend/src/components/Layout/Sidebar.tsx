import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, ShieldCheck, GitBranch, Activity,
  HeartPulse, LogOut, Leaf
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Overview & KPIs' },
  { to: '/patients',  icon: Users,            label: 'Patients',  desc: 'Patient registry' },
  { to: '/review',    icon: ShieldCheck,       label: 'Human Review', desc: 'AI validation queue' },
  { to: '/pipeline',  icon: GitBranch,         label: 'Pipeline Logs', desc: 'AI pipeline runs' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate  = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (location.pathname === '/dashboard') {
      window.location.reload();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <aside className="sidebar">
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 0%, rgba(107,154,150,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Logo / Brand */}
      <div className="relative p-5 border-b border-[var(--color-border)]">
        <button
          onClick={handleLogoClick}
          title="PathCareSync AI — Click to refresh dashboard"
          className="flex items-center gap-3 w-full text-left cursor-pointer group p-1 -m-1 rounded-xl hover:bg-[rgba(107,154,150,0.08)] transition-all"
        >
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6B9A96, #588157)' }}
          >
            <HeartPulse className="w-5 h-5 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent-light)] animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight group-hover:text-[var(--color-primary-light)] transition-colors">
              PathCareSync
            </h1>
            <p className="text-[10px] text-[var(--color-primary-light)] font-semibold tracking-widest uppercase opacity-80">
              AI · Intelligence
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[9px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mb-3 px-3">
          Clinical Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label, desc }, i) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <NavLink
                to={to}
                className={`sidebar-link group ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[var(--color-primary)]/20'
                    : 'bg-[rgba(255,255,255,0.03)] group-hover:bg-[rgba(107,154,150,0.1)]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium leading-tight">{label}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] leading-tight mt-0.5 opacity-70">{desc}</p>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-light)] flex-shrink-0" />
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="px-4 pb-3">
        <div className="glass-card-sm p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Activity className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
              System Status
            </span>
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'AI Pipeline', ok: true },
              { label: 'ABDM Gateway', ok: true },
              { label: 'TimescaleDB',  ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-muted)]">{label}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-[var(--color-accent-light)] animate-pulse' : 'bg-[var(--color-danger)]'}`} />
                  <span className={`text-[9px] font-semibold ${ok ? 'text-[var(--color-accent-light)]' : 'text-[var(--color-danger)]'}`}>
                    {ok ? 'Live' : 'Down'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User / Logout */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6B9A96, #344E41)' }}
            >
              DR
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[var(--color-bg-primary)] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent-light)]" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
              Dr. Arun Mehta
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Leaf className="w-2.5 h-2.5 text-[var(--color-sage)]" />
              <p className="text-[10px] text-[var(--color-text-muted)]">Lead Cardiologist</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg hover:bg-[var(--color-danger)]/15 hover:text-[var(--color-danger)] transition-all cursor-pointer text-[var(--color-text-muted)] group"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </aside>
  );
}
