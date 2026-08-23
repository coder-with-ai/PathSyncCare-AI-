import { motion } from 'framer-motion';
import { Shield, CreditCard, Phone, MapPin } from 'lucide-react';

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
      className="glass-card p-5 relative overflow-hidden"
    >
      {/* ABDM Header */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-[var(--color-primary)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          ABHA Profile
        </h3>
        <span className="badge source-rule text-[10px]">ABDM Verified</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <CreditCard className="w-4 h-4 text-[var(--color-text-muted)]" />
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase">ABHA Number</p>
            <p className="text-sm font-mono font-medium text-[var(--color-primary-light)]">{abhaId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Contact</p>
            <p className="text-sm text-[var(--color-text-primary)]">{phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
          <div>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Address</p>
            <p className="text-sm text-[var(--color-text-primary)]">{address}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--color-text-muted)]">{name} · {age}y · {gender}</span>
          <span className="text-[10px] text-[var(--color-accent)]">● Connected</span>
        </div>
      </div>
    </motion.div>
  );
}
