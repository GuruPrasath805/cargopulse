import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['DELIVERED', 'COMPLETED', 'RECEIVED', 'APPROVED', 'RESTOCK', 'LOW', 'OPTIMAL', 'AVAILABLE'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DISPATCHED', 'PROCESSING', 'REPAIR'].includes(normalized)) {
    colorClasses = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['PENDING', 'ORDERED', 'PACKED', 'REQUESTED', 'MODERATE', 'ELEVATED'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['DELAYED', 'CRITICAL', 'DAMAGED', 'FAILED', 'CANCELLED', 'REJECTED', 'SCRAP', 'CRITICAL RISK'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${padding} tracking-wide font-medium`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
