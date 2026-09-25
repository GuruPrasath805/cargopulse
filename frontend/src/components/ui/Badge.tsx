import React from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  danger: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  info: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  brand: 'bg-brand-950/60 text-brand-300 border-brand-800/60',
};

export const Badge: React.FC<{ tone?: Tone; className?: string; children: React.ReactNode }> = ({
  tone = 'neutral',
  className = '',
  children,
}) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${toneClasses[tone]} ${className}`}
  >
    {children}
  </span>
);

export const statusToTone = (status?: string): Tone => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
    case 'SUSPENDED':
      return 'danger';
    default:
      return 'neutral';
  }
};
