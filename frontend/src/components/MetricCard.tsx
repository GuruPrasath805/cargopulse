import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  color?: 'brand' | 'blue' | 'amber' | 'rose' | 'emerald';
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color = 'brand',
  subtext,
}) => {
  const iconBg = {
    brand: 'bg-orange-50 text-orange-600 border border-orange-200',
    blue: 'bg-blue-50 text-blue-600 border border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border border-rose-200',
    emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-orange-500/30">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-slate-950">{value}</span>
        {change && (
          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
};
