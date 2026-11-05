import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Pill, Stethoscope, Lightbulb, Target, AlertCircle } from 'lucide-react';
import type { VitalReading } from '../../types';

interface VitalsGridProps {
  vitals: VitalReading[];
  medications: string[];
  disease?: string;
}

const doctorSuggestionsByDisease: Record<string, { suggestion: string; target: string; warning: string }> = {
  'Hypertension': {
    suggestion: 'Maintain strict low-sodium DASH diet (< 2g Na/day). Record BP log twice daily (morning & night before meds). Schedule anti-hypertensive titration if SBP > 140 on 3 consecutive days.',
    target:  'Target SBP < 130 mmHg for cardiac & renal protection',
    warning: 'Avoid OTC decongestants and NSAIDs as they elevate BP',
  },
  'Type 2 Diabetes': {
    suggestion: 'Check fasting and 2-hr post-prandial blood glucose daily. Perform foot inspection nightly for micro-cuts or numbness. Recheck HbA1c & lipid panel in 30 days.',
    target:  'Target HbA1c < 7.0% & Fasting Glucose 80-130 mg/dL',
    warning: 'Carry fast-acting glucose tablets for hypoglycemia prevention',
  },
  'Tuberculosis': {
    suggestion: 'Ensure strict daily DOTS adherence with ASHA supervisor. Adopt high-protein, calorie-dense diet. Monitor weight bi-weekly and report any nausea or yellowing of eyes immediately.',
    target:  'Complete 6-month DOTS regimen without interruption',
    warning: 'Never skip DOTS doses to prevent drug-resistant TB (MDR-TB)',
  },
  'Coronary Artery Disease': {
    suggestion: 'Participate in Phase 2 cardiac rehabilitation walking (30 mins daily). Strict adherence to Dual Antiplatelet Therapy (DAPT). Seek emergency care immediately if resting angina occurs.',
    target:  'Target Heart Rate < 70 bpm & LDL-C < 55 mg/dL',
    warning: 'Do not discontinue Aspirin/Clopidogrel without cardiologist review',
  },
  'Chronic Kidney Disease': {
    suggestion: 'Restrict fluid intake to 1.2L/day and limit high-potassium foods (bananas, potatoes, coconut water). Monitor morning body weight. Avoid all NSAID painkillers.',
    target:  'Maintain eGFR stability and K+ < 5.0 mEq/L',
    warning: 'Prepare AV fistula access timeline if eGFR drops below 20 mL/min',
  },
  'Stroke Recovery': {
    suggestion: 'Continue daily physiotherapy & occupational speech therapy. Install bathroom handrails for fall safety. Maintain strict BP control (< 130/80) to prevent secondary stroke.',
    target:  'Functional independence score recovery > 80%',
    warning: 'Perform monthly PHQ-9 screening for post-stroke depression',
  },
  'Depression': {
    suggestion: 'Maintain consistent daily antidepressant regimen (full effect requires 4-6 weeks). Attend weekly CBT psychotherapy sessions and adhere to fixed sleep/wake cycles.',
    target:  'Target PHQ-9 score reduction > 50%',
    warning: 'Provide 24/7 crisis helpline and immediate doctor visit if mood worsens',
  },
};

const vitalLabels: Record<string, string> = {
  bp_systolic:  'Blood Pressure (Sys)',
  bp_diastolic: 'Blood Pressure (Dia)',
  hba1c:        'HbA1c',
  egfr:         'eGFR',
  heart_rate:   'Heart Rate',
  spo2:         'SpO₂',
  weight:       'Weight',
  phq9:         'PHQ-9 Score',
};

export default function VitalsGrid({ vitals, medications, disease = 'Hypertension' }: VitalsGridProps) {
  // Latest reading per vital type
  const latestByType: Record<string, VitalReading> = {};
  vitals.forEach(v => {
    if (!latestByType[v.type] || new Date(v.timestamp) > new Date(latestByType[v.type].timestamp)) {
      latestByType[v.type] = v;
    }
  });

  // Trend direction
  const trends: Record<string, 'up' | 'down' | 'stable'> = {};
  const types = [...new Set(vitals.map(v => v.type))];
  types.forEach(type => {
    const readings = vitals
      .filter(v => v.type === type)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (readings.length >= 2) {
      const last = readings[readings.length - 1].value;
      const prev = readings[readings.length - 2].value;
      trends[type] = last > prev * 1.02 ? 'up' : last < prev * 0.98 ? 'down' : 'stable';
    } else {
      trends[type] = 'stable';
    }
  });

  const entries   = Object.entries(latestByType);
  const docGuide  = doctorSuggestionsByDisease[disease] || doctorSuggestionsByDisease['Hypertension'];

  return (
    <div className="space-y-4">
      {/* Latest Vitals */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(107,154,150,0.15)' }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
          </div>
          Latest Vitals
        </h3>
        <div className="grid grid-cols-2 gap-2.5">
          {entries.map(([type, reading], i) => {
            const trend = trends[type];
            const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
            const trendColor =
              trend === 'up'   ? 'var(--color-danger-light)' :
              trend === 'down' ? 'var(--color-accent-light)' :
              'var(--color-text-muted)';
            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-2xl"
                style={{ background: 'rgba(28,41,34,0.6)', border: '1px solid var(--color-border)' }}
              >
                <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider mb-1.5">
                  {vitalLabels[type] || type}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--color-text-primary)] tabular-nums">
                    {reading.value}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{reading.unit}</span>
                  <TrendIcon className="w-3.5 h-3.5 ml-auto" style={{ color: trendColor }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current Medications */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <Pill className="w-4 h-4 text-[var(--color-primary-light)]" />
          Current Medications
        </h3>
        <div className="space-y-2">
          {medications.map((med, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs py-1">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--color-primary-light)' }}
              />
              <span className="text-[var(--color-text-secondary)]">{med}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Doctor's Clinical Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
        style={{ borderLeft: '3px solid var(--color-primary)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[var(--color-primary-light)]" />
            Clinical Guidance
          </h3>
          <span className="badge source-llm text-[9px] flex items-center gap-1">
            <Lightbulb className="w-2.5 h-2.5" />
            AI Protocol
          </span>
        </div>

        <div className="space-y-3">
          {/* Main suggestion */}
          <div
            className="p-3 rounded-xl"
            style={{ background: 'rgba(28,41,34,0.7)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-[9px] text-[var(--color-primary-light)] font-bold uppercase tracking-wider mb-1.5">
              {disease} Care Advice
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {docGuide.suggestion}
            </p>
          </div>

          {/* Target */}
          <div
            className="p-2.5 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(88,129,87,0.1)', border: '1px solid rgba(88,129,87,0.22)' }}
          >
            <Target className="w-3.5 h-3.5 text-[var(--color-accent-light)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-bold text-[var(--color-accent-light)] uppercase tracking-wider">Target Goal</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{docGuide.target}</p>
            </div>
          </div>

          {/* Warning */}
          <div
            className="p-2.5 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(212,134,10,0.1)', border: '1px solid rgba(212,134,10,0.22)' }}
          >
            <AlertCircle className="w-3.5 h-3.5 text-[var(--color-warning-light)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-bold text-[var(--color-warning-light)] uppercase tracking-wider">Clinical Precaution</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{docGuide.warning}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
