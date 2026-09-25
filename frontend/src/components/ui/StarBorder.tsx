import React from 'react';

export interface StarBorderProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export const StarBorder: React.FC<StarBorderProps> = ({
  as: Component = 'button',
  className = '',
  color = '#ff7a00',
  speed = '4s',
  children,
  ...props
}) => {
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-full p-[1.5px] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${className}`}
      {...props}
    >
      {/* Animated rotating star gradient beam around border */}
      <span
        className="pointer-events-none absolute -inset-[150%] animate-[spin_linear_infinite]"
        style={{
          animationDuration: speed,
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${color} 60deg, transparent 120deg, ${color} 240deg, transparent 360deg)`,
        }}
      />
      {/* Inner surface */}
      <span className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-50 hover:text-orange-600 shadow-xs">
        {children}
      </span>
    </Component>
  );
};

export default StarBorder;
