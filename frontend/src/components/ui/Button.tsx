import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25 border border-transparent',
  secondary: 'bg-slate-950 text-white hover:bg-black border border-slate-900',
  outline: 'bg-transparent text-slate-900 border-2 border-slate-900 hover:bg-slate-900 hover:text-white',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 border border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  fullWidth,
  leftIcon,
  rightIcon,
  className = '',
  children,
  disabled,
  ...rest
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-xl font-bold tracking-tight transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
