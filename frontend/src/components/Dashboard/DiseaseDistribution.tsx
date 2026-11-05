import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

// Nature-inspired colours aligned with the design palette
const COLORS: Record<string, string> = {
  'Hypertension':           '#6B9A96',
  'Type 2 Diabetes':        '#D4860A',
  'Tuberculosis':           '#588157',
  'Coronary Artery Disease':'#C0392B',
  'Chronic Kidney Disease': '#A3B18A',
  'Stroke Recovery':        '#8DBFBB',
  'Depression':             '#7D9668',
};

interface DiseaseDistributionProps {
  data: Record<string, number>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div className="glass-card-sm px-3 py-2 !rounded-xl !overflow-visible">
        <p className="text-xs font-bold text-[var(--color-text-primary)]">{name}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{value} patients</p>
      </div>
    );
  }
  return null;
};

export default function DiseaseDistribution({ data }: DiseaseDistributionProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
        >
          <Activity className="w-4 h-4 text-[var(--color-primary-light)]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Disease Distribution</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">{total} patients across {chartData.length} NCDs</p>
        </div>
      </div>

      {/* Donut chart */}
      <div className="relative w-full h-40 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              startAngle={90}
              endAngle={450}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name] || '#6B7280'}
                  opacity={0.9}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-[var(--color-text-primary)] tabular-nums">{total}</span>
          <span className="text-[9px] text-[var(--color-text-muted)] uppercase font-semibold tracking-wider">Patients</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {chartData.map(({ name, value }) => {
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <div key={name} className="flex items-center gap-2.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: COLORS[name] || '#6B7280' }}
              />
              <span className="text-[11px] text-[var(--color-text-secondary)] flex-1 truncate">{name}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${Math.max(pct * 0.8, 6)}px`,
                    background: COLORS[name] || '#6B7280',
                    opacity: 0.6,
                  }}
                />
                <span className="text-[11px] font-bold text-[var(--color-text-primary)] tabular-nums w-5 text-right">{value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
