import { motion } from 'framer-motion';
import { Shield, CreditCard, Phone, MapPin, Wifi } from 'lucide-react';

interface ABHACardProps {
  abhaId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
}

export default function ABHACard({ abhaId, name, age, gender, phone, address }: ABHACardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 relative !overflow-hidden"
    >
      {/* Indian tricolor accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] flex">
        <div className="flex-1" style={{ background: '#FF9933' }} />
        <div className="flex-1" style={{ background: '#FFFFFF' }} />
        <div className="flex-1" style={{ background: '#138808' }} />
      </div>

      {/* Background watermark */}
      <div
        className="absolute right-3 bottom-3 opacity-5 pointer-events-none"
        style={{ transform: 'rotate(-15deg)' }}
      >
        <Shield className="w-20 h-20 text-[var(--color-primary)]" />
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 mt-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(107,154,150,0.15)', border: '1px solid rgba(107,154,150,0.25)' }}
        >
          <Shield className="w-3.5 h-3.5 text-[var(--color-primary-light)]" />
        </div>
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">ABHA Profile</h3>
        <span className="badge source-rule text-[9px] ml-auto flex items-center gap-1">
          <Wifi className="w-2.5 h-2.5" />
          ABDM Verified
        </span>
      </div>

      <div className="space-y-3">
        {/* ABHA Number */}
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(28,41,34,0.6)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
            <div>
              <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">ABHA Number</p>
              <p className="text-sm font-mono font-semibold text-[var(--color-primary-light)] tracking-wide">{abhaId}</p>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2.5">
          <Phone className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" />
          <div>
            <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Contact</p>
            <p className="text-sm text-[var(--color-text-primary)]">{phone}</p>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Address</p>
            <p className="text-sm text-[var(--color-text-primary)] leading-snug">{address}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
        <span className="text-[10px] text-[var(--color-text-muted)]">{name} · {age}y · {gender}</span>
        <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent-light)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-light)] animate-pulse" />
          Connected
        </span>
      </div>
    </motion.div>
  );
}
