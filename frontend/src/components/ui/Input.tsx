import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, error, hint, children }) => (
  <div className="space-y-1.5">
    <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-800">
      {label}
    </label>
    {children}
    {hint && !error && <p className="text-[11px] text-slate-500">{hint}</p>}
    {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  accentRing?: string;
}

export const Input: React.FC<InputProps> = ({ className = '', accentRing = 'focus:border-orange-500 focus:ring-orange-500/20', ...rest }) => (
  <input
    className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:ring-2 ${accentRing} ${className}`}
    {...rest}
  />
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  accentRing?: string;
}

export const Select: React.FC<SelectProps> = ({ className = '', accentRing = 'focus:border-orange-500 focus:ring-orange-500/20', children, ...rest }) => (
  <select
    className={`w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 ${accentRing} ${className}`}
    {...rest}
  >
    {children}
  </select>
);
