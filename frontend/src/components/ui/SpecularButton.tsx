import React, { useRef, useState } from 'react';

export interface SpecularButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  as?: React.ElementType;
  size?: 'sm' | 'md' | 'lg';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  [key: string]: any;
}

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  as: Component = 'a',
  size = 'md',
  radius = 18,
  tint = '#ffffff',
  tintOpacity = 0.15,
  blur = 0,
  textColor = '#0f172a',
  lineColor = '#ff7a00',
  baseColor = '#ffffff',
  intensity = 1,
  shineSize = 10,
  followMouse = true,
  className = '',
  onClick,
  children,
  ...props
}) => {
  const btnRef = useRef<HTMLElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; hover: boolean }>({
    x: 50,
    y: 50,
    hover: false,
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current || !followMouse) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y, hover: true });
  };

  const handleMouseLeave = () => {
    setCoords(prev => ({ ...prev, hover: false }));
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm',
  }[size];

  return (
    <Component
      ref={btnRef as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center overflow-hidden font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${sizeClasses} ${className}`}
      style={{
        borderRadius: `${radius}px`,
        backgroundColor: baseColor,
        color: textColor,
        boxShadow: coords.hover
          ? `0 4px 18px rgba(255, 122, 0, ${0.2 * intensity})`
          : '0 1px 3px rgba(0,0,0,0.06)',
      }}
      {...props}
    >
      {/* Specular sheen gradient border reflection */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          padding: '1.5px',
          background: coords.hover
            ? `radial-gradient(${shineSize * 10}px circle at ${coords.x}% ${coords.y}%, ${lineColor}, transparent 75%)`
            : `linear-gradient(135deg, ${lineColor}40, transparent 60%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
      />

      {/* Surface light reflection tint */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: coords.hover ? tintOpacity : 0,
          background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, ${tint}, transparent 60%)`,
        }}
      />

      {/* Label Content */}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </Component>
  );
};

export default SpecularButton;
