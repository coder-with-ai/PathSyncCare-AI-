import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const COLORS: Record<string, string> = {
  'Hypertension': '#3B82F6',
  'Type 2 Diabetes': '#F59E0B',
  'Tuberculosis': '#10B981',
  'Coronary Artery Disease': '#EF4444',
  'Chronic Kidney Disease': '#8B5CF6',
  'Stroke Recovery': '#EC4899',
  'Depression': '#06B6D4',
};

interface DiseaseDistributionProps {
  data: Record<string, number>;
}

export default function DiseaseDistribution({ data }: DiseaseDistributionProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-5"
    >
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        Disease Distribution
      </h3>
      <div className="flex items-center gap-4">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(17, 24, 39, 0.95)',
                  border: '1px solid rgba(75, 85, 99, 0.4)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f1f5f9',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {chartData.map(({ name, value }) => (
            <div key={name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: COLORS[name] || '#6B7280' }}
              />
              <span className="text-xs text-[var(--color-text-secondary)] flex-1 truncate">
                {name}
              </span>
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
