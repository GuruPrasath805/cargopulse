import React, { useRef, useState } from 'react';

interface MagicBentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string; // e.g. "255, 122, 0"
  className?: string;
  children: React.ReactNode;
}

export const MagicBento: React.FC<MagicBentoProps> = ({
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 300,
  particleCount = 12,
  glowColor = '255, 122, 0',
  className = '',
  children,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, hover: false });
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
  const [clicked, setClicked] = useState(false);

  // Generate fixed sparkle particle coordinates
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    top: `${(i * 19) % 85 + 5}%`,
    left: `${(i * 27) % 85 + 5}%`,
    size: (i % 3) + 2,
    delay: `${(i * 0.3) % 2.5}s`,
  }));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y, hover: true });

    if (enableTilt || enableMagnetism) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = enableTilt ? ((y - centerY) / centerY) * -6 : 0;
      const rotateY = enableTilt ? ((x - centerX) / centerX) * 6 : 0;
      const translateX = enableMagnetism ? ((x - centerX) / centerX) * 4 : 0;
      const translateY = enableMagnetism ? ((y - centerY) / centerY) * 4 : 0;

      setTransform({ rotateX, rotateY, translateX, translateY });
    }
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, hover: false }));
    setTransform({ rotateX: 0, rotateY: 0, translateX: 0, translateY: 0 });
  };

  const handleClick = () => {
    if (clickEffect) {
      setClicked(true);
      setTimeout(() => setClicked(false), 400);
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-transform duration-200 ease-out hover:shadow-2xl ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translate3d(${transform.translateX}px, ${transform.translateY}px, 0)`,
        transition: mousePos.hover ? 'box-shadow 0.3s ease, border-color 0.3s ease' : 'all 0.5s ease',
      }}
    >
      {/* 1. Dynamic Cursor Spotlight */}
      {enableSpotlight && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: mousePos.hover ? 0.35 : 0,
            background: `radial-gradient(${spotlightRadius}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowColor}, 0.35), transparent 70%)`,
          }}
        />
      )}

      {/* 2. Border Glow Highlight */}
      {enableBorderGlow && (
        <div
          className="pointer-events-none absolute -inset-[1.5px] rounded-[inherit] z-0 transition-opacity duration-300"
          style={{
            opacity: mousePos.hover ? 1 : 0.2,
            background: mousePos.hover
              ? `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, rgba(${glowColor}, 0.9), transparent 70%)`
              : `linear-gradient(135deg, rgba(${glowColor}, 0.2), transparent 60%)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1.5px',
          }}
        />
      )}

      {/* 3. Floating Sparkling Stars */}
      {enableStars && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          {particles.map(p => (
            <span
              key={p.id}
              className="absolute rounded-full bg-orange-400 animate-pulse transition-opacity duration-500"
              style={{
                top: p.top,
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: p.delay,
                opacity: mousePos.hover ? 0.65 : 0.15,
                boxShadow: `0 0 6px rgba(${glowColor}, 0.8)`,
              }}
            />
          ))}
        </div>
      )}

      {/* 4. Click ripple flash */}
      {clickEffect && clicked && (
        <span
          className="pointer-events-none absolute inset-0 z-20 animate-ping rounded-[inherit]"
          style={{
            backgroundColor: `rgba(${glowColor}, 0.2)`,
          }}
        />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

export default MagicBento;
