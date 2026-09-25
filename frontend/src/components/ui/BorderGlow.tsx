import React, { useRef, useState } from 'react';

interface BorderGlowProps {
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean;
  colors?: string[];
  className?: string;
  children: React.ReactNode;
}

export const BorderGlow: React.FC<BorderGlowProps> = ({
  edgeSensitivity = 30,
  glowColor = '255 122 0',
  backgroundColor = '#ffffff',
  borderRadius = 24,
  glowRadius = 50,
  glowIntensity = 1.0,
  colors = ['#ff7a00', '#fb923c', '#ea580c'],
  className = '',
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; isHover: boolean }>({
    x: 0,
    y: 0,
    isHover: false,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y, isHover: true });
  };

  const handleMouseLeave = () => {
    setCoords(prev => ({ ...prev, isHover: false }));
  };

  const primaryGlow = colors[0] || '#ff7a00';
  const secondaryGlow = colors[1] || '#fb923c';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        padding: '1.5px',
      }}
    >
      {/* Dynamic Cursor Spotlight Border Glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: coords.isHover ? glowIntensity : 0.15,
          background: coords.isHover
            ? `radial-gradient(${glowRadius * 3}px circle at ${coords.x}px ${coords.y}px, ${primaryGlow}, ${secondaryGlow}, transparent 70%)`
            : `linear-gradient(135deg, ${primaryGlow}40, transparent 40%, ${secondaryGlow}30)`,
        }}
      />

      {/* Inner Card Background */}
      <div
        className="relative z-10 h-full w-full overflow-hidden transition-colors"
        style={{
          backgroundColor,
          borderRadius: `${borderRadius - 1.5}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default BorderGlow;
