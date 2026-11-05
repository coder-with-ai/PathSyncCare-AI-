import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  icon: ReactNode;
  color: string;
  glowColor?: string;
  trend?: { value: number; positive: boolean };
  delay?: number;
  subtitle?: string;
}

export default function KPICard({
  title, value, suffix = '', icon, color, glowColor, trend, delay = 0, subtitle
}: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1400;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased * 100) / 100);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, delay * 100);
    return () => {
      clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, delay]);

  const glow = glowColor || color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="kpi-card group"
      style={{ '--kpi-glow': `${glow}18` } as React.CSSProperties}
    >
      {/* Top colour bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />

      {/* Inner shine */}
      <div
        className="absolute top-0 left-0 right-0 bottom-0 rounded-[20px] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 50%)',
        }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-2 leading-tight">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[var(--color-text-primary)] tabular-nums">
              {suffix === '%' ? displayValue.toFixed(1) : Math.round(displayValue)}
            </span>
            {suffix && (
              <span className="text-sm text-[var(--color-text-muted)] font-medium">{suffix}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
              trend.positive ? 'text-[var(--color-accent-light)]' : 'text-[var(--color-danger-light)]'
            }`}>
              <span className="text-[11px]">{trend.positive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% this week</span>
            </div>
          )}
        </div>

        {/* Icon circle */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 ml-3"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}28`,
          }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}
