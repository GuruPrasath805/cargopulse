import React, { useRef, useState } from 'react';
import { ExternalLink, LucideIcon } from 'lucide-react';

export interface ChromaGridItem {
  image?: string;
  icon?: LucideIcon;
  title: string;
  subtitle: string;
  handle: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
}

interface ChromaGridProps {
  items: ChromaGridItem[];
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  className?: string;
}

export const ChromaGrid: React.FC<ChromaGridProps> = ({
  items,
  radius = 300,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(prev => ({ ...prev, active: false }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${className}`}
    >
      {/* Background Interactive Radial Bloom Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 z-0"
        style={{
          opacity: mousePos.active ? 0.35 : 0.08,
          background: `radial-gradient(${radius}px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 122, 0, 0.4), rgba(251, 146, 60, 0.15), transparent 70%)`,
        }}
      />

      {/* Feature Grid Items with Chroma Orange Cards */}
      <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const borderColor = item.borderColor || '#ff7a00';
          const cardGradient = item.gradient || 'linear-gradient(145deg, #fff7ed, #ffffff)';

          return (
            <div
              key={item.title + idx}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-orange-500/50"
              style={{
                background: cardGradient,
              }}
            >
              {/* Card Header with Icon / Image and Handle */}
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 transition-transform group-hover:scale-110"
                    style={{ borderColor }}
                  >
                    {Icon ? (
                      <Icon className="h-6 w-6 text-orange-600" />
                    ) : item.image ? (
                      <img src={item.image} alt={item.title} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <span className="font-bold text-orange-600">CP</span>
                    )}
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-600 border border-slate-200 group-hover:border-orange-300 group-hover:text-orange-700 transition">
                    {item.handle}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="mt-5 text-lg font-bold text-slate-950 group-hover:text-orange-600 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                  {item.subtitle}
                </p>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Core
                </span>
                <a
                  href={item.url || '#portals'}
                  className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition"
                >
                  Explore <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChromaGrid;
