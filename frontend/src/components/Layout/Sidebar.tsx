import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, ShieldCheck, GitBranch, Activity,
  HeartPulse, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: User, label: 'Patients' },
  { to: '/review', icon: ShieldCheck, label: 'Human Review' },
  { to: '/pipeline', icon: GitBranch, label: 'Pipeline Logs' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

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
      {/* Logo */}
      <div className="p-5 border-b border-[var(--color-border)]">
        <button
          onClick={handleLogoClick}
          title="PathCareSync AI — Click to refresh dashboard"
          className="flex items-center gap-3 w-full text-left cursor-pointer group p-1 -m-1 rounded-xl hover:bg-[var(--color-surface-hover)] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center group-hover:scale-105 transition-transform shadow-md">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight group-hover:text-[var(--color-primary-light)] transition-colors">
              PathCareSync
            </h1>
            <p className="text-[10px] text-[var(--color-primary-light)] font-medium tracking-wider uppercase">
              AI Intelligence 🔄
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[10px] text-[var(--color-text-muted)] font-semibold uppercase tracking-wider mb-3 px-3">
          Navigation
        </p>
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Pipeline Status Indicator */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="glass-card-sm p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
              Pipeline Status
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
            <span className="text-[11px] text-[var(--color-accent)]">
              System Operational
            </span>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-purple-500 flex items-center justify-center text-xs font-bold text-white">
            DR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
              Dr. Arun Mehta
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              Cardiologist
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg hover:bg-[var(--color-danger)]/20 hover:text-[var(--color-danger)] transition-colors cursor-pointer text-[var(--color-text-muted)]"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
