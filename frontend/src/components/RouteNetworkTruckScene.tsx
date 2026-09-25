import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, Compass, ShieldCheck } from 'lucide-react';

export const RouteNetworkTruckScene: React.FC = () => {
  // Path definition across the perspective map
  // Origin: (160, 140) -> turns -> Destination: (840, 280)
  const routePathD = "M 160,140 L 250,155 L 320,195 L 420,180 L 485,250 L 570,230 L 660,305 L 745,280 L 840,290";

  return (
    <div className="relative mx-auto w-full max-w-6xl select-none">
      {/* 3D Perspective Canvas Container */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0c0f14] shadow-2xl shadow-black/80">
        
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-3/4 rounded-full bg-orange-500/15 blur-[100px]" />
        
        {/* Perspective Road Network Grid */}
        <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full overflow-hidden">
          {/* Subtle City Road Network Background (SVG Grid) */}
          <svg className="absolute inset-0 h-full w-full opacity-35" preserveAspectRatio="none" viewBox="0 0 1000 500">
            <defs>
              <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
                <circle cx="0" cy="0" r="1.2" fill="#334155" />
              </pattern>
              
              {/* Secondary faint roads */}
              <linearGradient id="faintRoad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e293b" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <rect width="100%" height="100%" fill="url(#roadGrid)" />

            {/* Minor branch roads criss-crossing the territory */}
            <path d="M 50,80 Q 200,120 350,70 T 700,110 T 950,60" fill="none" stroke="url(#faintRoad)" strokeWidth="1.5" strokeDasharray="6,6" />
            <path d="M 120,450 Q 300,380 480,420 T 800,360 T 980,400" fill="none" stroke="url(#faintRoad)" strokeWidth="1.5" strokeDasharray="8,8" />
            <path d="M 220,20 L 260,480" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
            <path d="M 640,10 L 680,490" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
            <path d="M 450,30 L 490,470" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
            <path d="M 160,140 Q 350,220 570,230" fill="none" stroke="#f97316" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="3,6" />
            <path d="M 570,230 Q 720,200 840,290" fill="none" stroke="#f97316" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="3,6" />
          </svg>

          {/* Glowing Orange Primary Route & Moving Truck Layer */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Route Glow Filter */}
              <filter id="orangeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="7" result="blur1" />
                <feGaussianBlur stdDeviation="3" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Headlight Cone Gradient */}
              <linearGradient id="headlightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#fb923c" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
              </linearGradient>

              {/* Truck Container Gradient */}
              <linearGradient id="truckBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>

              <linearGradient id="truckCab" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>

            {/* 1. Origin Radar Concentric Ripples (160, 140) */}
            <circle cx="160" cy="140" r="45" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.15">
              <animate attributeName="r" values="15;55" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="140" r="30" fill="none" stroke="#f97316" strokeWidth="1.2" opacity="0.25">
              <animate attributeName="r" values="10;38" dur="3s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0" dur="3s" begin="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="160" cy="140" r="14" fill="#ea580c" fillOpacity="0.2" stroke="#fb923c" strokeWidth="1.5" />
            <circle cx="160" cy="140" r="5" fill="#f97316" />

            {/* Origin Pin Graphic */}
            <g transform="translate(150, 102)">
              <rect x="0" y="0" width="20" height="24" rx="10" fill="#ea580c" />
              <circle cx="10" cy="10" r="4" fill="#ffffff" />
              <polygon points="4,18 16,18 10,26" fill="#ea580c" />
            </g>

            {/* 2. Destination Beacon Rings (840, 290) */}
            <circle cx="840" cy="290" r="60" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.15">
              <animate attributeName="r" values="20;70" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="840" cy="290" r="35" fill="none" stroke="#fb923c" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="r" values="10;45" dur="2.8s" begin="0.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="2.8s" begin="0.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="840" cy="290" r="18" fill="#ea580c" fillOpacity="0.25" stroke="#fb923c" strokeWidth="1.8" />
            <circle cx="840" cy="290" r="7" fill="#ffffff" />

            {/* Destination Target Rings Outer */}
            <circle cx="840" cy="290" r="28" fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4,3" />

            {/* 3. Deep Background Glow for Highway */}
            <path
              d={routePathD}
              fill="none"
              stroke="#ea580c"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
              filter="url(#orangeGlow)"
            />

            {/* 4. Core Intense Glowing Orange Route Line */}
            <path
              id="truckRoutePath"
              d={routePathD}
              fill="none"
              stroke="#ff7a00"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#orangeGlow)"
            />

            {/* 5. Moving Pulse Flow Streamers Along Route */}
            <path
              d={routePathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="18 120"
              opacity="0.9"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-276"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </path>

            {/* 6. High-End 3D Animated Freight Truck Moving Along the Route */}
            <g>
              {/* SVG native animateMotion to drive truck precisely along the glowing path */}
              <animateMotion
                dur="10s"
                repeatCount="indefinite"
                rotate="auto"
                path={routePathD}
              />

              {/* Headlight beam illuminating the road ahead */}
              <polygon
                points="18,-14 90,-32 90,32 18,14"
                fill="url(#headlightBeam)"
                opacity="0.85"
              />

              {/* Dynamic road surface shadow under the truck */}
              <ellipse cx="-4" cy="2" rx="28" ry="12" fill="#000000" opacity="0.75" />

              {/* Trailer Container (White/Grey Metallic with Orange Trim) */}
              <g transform="translate(-24, -10)">
                {/* Trailer Box */}
                <rect
                  x="0"
                  y="0"
                  width="32"
                  height="20"
                  rx="3"
                  fill="url(#truckBody)"
                  stroke="#475569"
                  strokeWidth="1"
                />
                {/* CargoPulse Logo / Decal on Trailer */}
                <rect x="3" y="4" width="26" height="4" rx="1" fill="#ea580c" />
                <rect x="3" y="10" width="18" height="2" rx="0.5" fill="#94a3b8" />
                <rect x="3" y="14" width="12" height="2" rx="0.5" fill="#94a3b8" />
                
                {/* Dual Trailer Wheels (Shadowed) */}
                <circle cx="7" cy="20" r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                <circle cx="15" cy="20" r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                <circle cx="7" cy="0" r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                <circle cx="15" cy="0" r="3.5" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
              </g>

              {/* Semi-Truck Cab (Vibrant Orange & Black Windshield) */}
              <g transform="translate(8, -8)">
                {/* Cab Base */}
                <path
                  d="M 0,0 L 14,0 L 17,4 L 17,12 L 14,16 L 0,16 Z"
                  fill="url(#truckCab)"
                  stroke="#c2410c"
                  strokeWidth="1"
                />
                {/* Windshield */}
                <polygon points="7,2 13,2 15,5 15,11 13,14 7,14" fill="#0f172a" opacity="0.9" />
                {/* Front Headlights */}
                <circle cx="16" cy="3" r="1.8" fill="#fffbeb" />
                <circle cx="16" cy="13" r="1.8" fill="#fffbeb" />
                {/* Steer Axle Wheels */}
                <circle cx="8" cy="-2" r="3" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
                <circle cx="8" cy="18" r="3" fill="#0f172a" stroke="#64748b" strokeWidth="0.8" />
              </g>
            </g>
          </svg>

          {/* Floating HUD Nodes / Labels for Logistics Reality */}
          <div className="pointer-events-none absolute top-6 left-6 flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold text-white font-mono">ORIGIN: CHENNAI HUB</span>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-6 flex items-center gap-2 rounded-xl border border-white/10 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[11px] font-bold text-white font-mono">DESTINATION: BLR GATEWAY (ETA 42m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
