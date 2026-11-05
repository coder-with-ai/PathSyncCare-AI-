import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import { GitMerge, TrendingUp } from 'lucide-react';
import type { TrajectoryPoint, Milestone } from '../../types';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  milestones?: Milestone[];
  vitalType?: string;
  unit?: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-sm px-4 py-3 !rounded-2xl !overflow-visible min-w-[160px]">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">Day {label} post-discharge</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-xs text-[var(--color-text-secondary)]">
                {p.dataKey === 'expected' ? 'Expected' : 'Actual'}
              </span>
            </div>
            <span className="text-xs font-bold text-[var(--color-text-primary)] tabular-nums">
              {p.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function TrajectoryChart({
  data, milestones, vitalType = 'Vital', unit = ''
}: TrajectoryChartProps) {
  const milestoneDays = milestones?.map((m, i) => ({
    day: (i + 1) * Math.floor(data.length > 0 ? data[data.length - 1].day / (milestones.length + 1) : 10) * (i + 1),
    title: m.title,
    status: m.status,
  })) || [];

  // Check if there's any significant deviation
  const maxDev = data.reduce((max, d) => {
    if (d.actual == null || d.expected == null) return max;
    return Math.max(max, Math.abs((d.actual - d.expected) / (d.expected || 1)));
  }, 0);
  const hasDeviation = maxDev > 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
          >
            <GitMerge className="w-4.5 h-4.5 text-[var(--color-primary-light)]" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Care Twin — Expected vs Actual Trajectory
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {vitalType} ({unit}) · days since hospital discharge
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasDeviation && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(212,134,10,0.12)', border: '1px solid rgba(212,134,10,0.25)' }}
            >
              <TrendingUp className="w-3 h-3 text-[var(--color-warning-light)]" />
              <span className="text-[10px] font-bold text-[var(--color-warning-light)] uppercase tracking-wide">
                Deviation Detected
              </span>
            </div>
          )}
          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 rounded-full bg-[var(--color-primary-light)]" />
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Expected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 rounded-full bg-[var(--color-accent-light)]" />
              <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Actual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6B9A96" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6B9A96" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#588157" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#588157" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="rgba(88,129,87,0.14)" />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6A8768', fontSize: 11 }}
              label={{ value: 'Days since discharge', position: 'insideBottom', offset: -12, fill: '#6A8768', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6A8768', fontSize: 11 }}
              label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#6A8768', fontSize: 11 }}
            />

            <Tooltip content={<CustomTooltip unit={unit} />} />

            {/* Milestone reference lines */}
            {milestoneDays.map((ms, i) => (
              <ReferenceLine
                key={i}
                x={ms.day}
                stroke={
                  ms.status === 'overdue'     ? '#C0392B' :
                  ms.status === 'completed'   ? '#588157' :
                  ms.status === 'in_progress' ? '#6B9A96' : '#5A6E5A'
                }
                strokeDasharray="5 5"
                strokeOpacity={0.55}
                strokeWidth={1.5}
              />
            ))}

            <Area
              type="monotone"
              dataKey="expected"
              stroke="#6B9A96"
              strokeWidth={2.5}
              fill="url(#expectedGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#6B9A96', stroke: '#1C2922', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#588157"
              strokeWidth={2.5}
              fill="url(#actualGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#588157', stroke: '#1C2922', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[9px] text-[var(--color-text-muted)] text-center mt-2 opacity-60 italic">
        Illustrative sample data — not validated clinical predictions
      </p>
    </motion.div>
  );
}
