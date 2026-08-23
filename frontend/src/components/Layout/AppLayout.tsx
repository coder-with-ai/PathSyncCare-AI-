import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ABDMModal from './ABDMModal';
import NotificationDrawer from './NotificationDrawer';
import { Bell, Search, ShieldCheck } from 'lucide-react';

export default function AppLayout() {
  const [abdmModalOpen, setAbdmModalOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[260px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 backdrop-blur-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search patients, alerts, pipelines..."
              className="w-80 h-9 pl-10 pr-4 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          <div className="flex items-center gap-4 relative">
            {/* ABDM Connected Trigger Button */}
            <button
              onClick={() => setAbdmModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-[var(--color-text-secondary)] font-medium group-hover:text-emerald-400 transition-colors">
                ABDM Connected
              </span>
            </button>

            {/* Notification Bell Trigger Button */}
            <button
              onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
              className="relative p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-[var(--color-text-secondary)] hover:text-white transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse" />
            </button>

            {/* Notification Drawer Popover */}
            <NotificationDrawer
              isOpen={notifDrawerOpen}
              onClose={() => setNotifDrawerOpen(false)}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>

      {/* ABDM Information Modal */}
      <ABDMModal
        isOpen={abdmModalOpen}
        onClose={() => setAbdmModalOpen(false)}
      />
    </div>
  );
}
