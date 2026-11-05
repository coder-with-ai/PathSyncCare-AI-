import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
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

      <div className="flex-1 ml-[264px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-8"
          style={{
            background: 'rgba(20, 30, 26, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(88, 129, 87, 0.18)',
          }}
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search patients, alerts, pipelines…"
              className="w-80 h-9 pl-10 pr-4 rounded-xl text-sm transition-all"
              style={{
                background: 'rgba(28, 41, 34, 0.7)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
              onFocus={e => {
                (e.target as HTMLInputElement).style.borderColor = 'rgba(107,154,150,0.5)';
                (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(107,154,150,0.1)';
              }}
              onBlur={e => {
                (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)';
                (e.target as HTMLInputElement).style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="flex items-center gap-3 relative">
            {/* ABDM Connected */}
            <button
              onClick={() => setAbdmModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer group"
              style={{
                background: 'rgba(88, 129, 87, 0.1)',
                border: '1px solid rgba(88, 129, 87, 0.2)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(88,129,87,0.4)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(88,129,87,0.16)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(88,129,87,0.2)';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(88,129,87,0.1)';
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[var(--color-accent-light)] animate-pulse" />
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-light)]" />
              <span className="text-xs text-[var(--color-accent-light)] font-semibold">
                ABDM Connected
              </span>
            </button>

            {/* Notification Bell */}
            <motion.button
              onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2.5 rounded-xl transition-colors cursor-pointer"
              style={{
                background: 'rgba(28, 41, 34, 0.7)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Bell className="w-4.5 h-4.5 text-[var(--color-text-secondary)]" style={{ width: 18, height: 18 }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse" />
            </motion.button>

            {/* Notification Drawer */}
            <NotificationDrawer
              isOpen={notifDrawerOpen}
              onClose={() => setNotifDrawerOpen(false)}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>

      {/* ABDM Modal */}
      <ABDMModal
        isOpen={abdmModalOpen}
        onClose={() => setAbdmModalOpen(false)}
      />
    </div>
  );
}
