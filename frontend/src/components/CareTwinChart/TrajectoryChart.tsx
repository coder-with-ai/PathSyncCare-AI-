import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';
import type { TrajectoryPoint, Milestone } from '../../types';

interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  milestones?: Milestone[];
  vitalType?: string;
  unit?: string;
}

export default function TrajectoryChart({ data, milestones, vitalType = 'Vital', unit = '' }: TrajectoryChartProps) {
  // Find milestone days for reference lines
  const milestoneDays = milestones?.map((m, i) => ({
    day: (i + 1) * Math.floor(data.length > 0 ? data[data.length - 1].day / (milestones.length + 1) : 10) * (i + 1),
    title: m.title,
    status: m.status,
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Care Twin — Expected vs Actual Trajectory
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {vitalType} ({unit}) over time since discharge
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[var(--color-primary)]" />
            <span className="text-[11px] text-[var(--color-text-muted)]">Expected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[var(--color-accent)]" />
            <span className="text-[11px] text-[var(--color-text-muted)]">Actual</span>
          </div>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="expectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.2)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: 'Days since discharge', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(75, 85, 99, 0.4)',
                borderRadius: '10px',
                fontSize: '12px',
                color: '#f1f5f9',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
              formatter={(value: any, name: any) => [
                `${value} ${unit}`,
                name === 'expected' ? '🎯 Expected' : '📊 Actual'
              ]}
              labelFormatter={(label) => `Day ${label}`}
            />
            {milestoneDays.map((ms, i) => (
              <ReferenceLine
                key={i}
                x={ms.day}
                stroke={ms.status === 'overdue' ? '#EF4444' : ms.status === 'completed' ? '#10B981' : '#6B7280'}
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
            ))}
            <Area
              type="monotone"
              dataKey="expected"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#expectedGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#3B82F6', stroke: '#1e3a5f' }}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#actualGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#10B981', stroke: '#064e3b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
