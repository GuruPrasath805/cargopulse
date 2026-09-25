import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }> = ({
  className = '',
  hover = false,
  children,
  ...rest
}) => (
  <div
    className={`rounded-2xl border border-slate-200/90 bg-white text-slate-900 shadow-sm ${
      hover ? 'transition-all duration-300 hover:border-orange-500/50 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/5' : ''
    } ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...rest }) => (
  <div className={`border-b border-slate-100 px-5 py-4 ${className}`} {...rest}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', children, ...rest }) => (
  <div className={`px-5 py-4 ${className}`} {...rest}>
    {children}
  </div>
);
