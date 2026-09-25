import React from 'react';
import { Truck } from 'lucide-react';

export const HighwayTruckShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative mx-auto w-full max-w-5xl select-none ${className}`}>
      {/* Outer frame with subtle orange glow shadow on white ground */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 p-2 shadow-2xl shadow-orange-500/10">
        <div className="relative h-[260px] sm:h-[380px] lg:h-[460px] w-full overflow-hidden rounded-2xl bg-slate-950">
          {/* Realistic truck on highway background visual */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
            style={{
              backgroundImage: "url('/hero-truck.jpg')",
            }}
          />

          {/* Golden hour sunset vignette and contrast gradient */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

          {/* Dynamic Highway Road Motion Streaks */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 overflow-hidden z-10">
            <div className="road-motion-streak bottom-5 w-40" style={{ animationDelay: '0s', animationDuration: '1.2s' }} />
            <div className="road-motion-streak bottom-10 w-64" style={{ animationDelay: '0.4s', animationDuration: '1.4s' }} />
            <div className="road-motion-streak bottom-16 w-32" style={{ animationDelay: '0.8s', animationDuration: '1.1s' }} />
            <div className="road-motion-streak bottom-8 w-52" style={{ animationDelay: '1.1s', animationDuration: '1.3s' }} />
          </div>

          {/* Truck Container Branding Decal (Orange & White on Black) */}
          <div className="absolute top-6 left-6 z-20">
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-black/65 px-4 py-2 backdrop-blur-md shadow-xl">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white font-black shadow-md shadow-orange-500/40">
                <Truck className="h-4 w-4" />
              </div>
              <div className="flex items-center tracking-tight font-serif text-sm font-extrabold text-white">
                <span>Cargo</span>
                <span className="text-orange-500">Pulse</span>
              </div>
              <span className="ml-1 rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-400 border border-orange-500/30">
                FLEET
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
