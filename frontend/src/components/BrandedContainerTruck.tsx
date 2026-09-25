import React from 'react';
import { ShieldCheck, Radio, Thermometer, Navigation, CheckCircle2 } from 'lucide-react';

export const BrandedContainerTruck: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto select-none">
      {/* Ambient background glow behind truck */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 blur-2xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-md">
        
        {/* Top Status Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-slate-900 tracking-tight">BharatBenz 2823R &bull; Multi-Axle Line-Haul</span>
          </div>
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-extrabold text-orange-600 border border-orange-200">
            FLEET UNIT #CP-904
          </span>
        </div>

        {/* Detailed SVG Illustration of Branded Container Truck */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-200/40 p-4 pt-6 border border-slate-200/60">
          <svg
            viewBox="0 0 760 280"
            className="w-full h-auto drop-shadow-xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Ground Shadow */}
            <ellipse cx="380" cy="256" rx="340" ry="14" fill="#0f172a" fillOpacity="0.16" filter="blur(6px)" />
            <ellipse cx="380" cy="254" rx="320" ry="8" fill="#0f172a" fillOpacity="0.22" />

            {/* --- TRAILER CONTAINER BODY --- */}
            {/* Main Container Box */}
            <rect x="50" y="38" width="460" height="156" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="3" />
            
            {/* Container Corrugation Ribs */}
            {[...Array(14)].map((_, i) => (
              <line
                key={i}
                x1={75 + i * 31}
                y1="40"
                x2={75 + i * 31}
                y2="192"
                stroke="#e2e8f0"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
            ))}

            {/* Bottom Red/White Reflective Safety Tape */}
            <rect x="50" y="186" width="460" height="8" fill="#f87171" rx="1" />
            {[...Array(15)].map((_, i) => (
              <rect key={i} x={50 + i * 31} y="186" width="16" height="8" fill="#ffffff" />
            ))}

            {/* Top Roof Edge & Corner Castings */}
            <rect x="46" y="34" width="468" height="8" rx="3" fill="#94a3b8" />
            <rect x="46" y="34" width="16" height="16" rx="2" fill="#64748b" />
            <rect x="498" y="34" width="16" height="16" rx="2" fill="#64748b" />
            <rect x="46" y="180" width="16" height="16" rx="2" fill="#64748b" />
            <rect x="498" y="180" width="16" height="16" rx="2" fill="#64748b" />

            {/* Orange Brand Dynamic Wave Strip on Container */}
            <path
              d="M52 145 C 160 145, 220 100, 360 100 C 430 100, 480 120, 508 125 L 508 140 C 480 135, 430 115, 360 115 C 220 115, 160 160, 52 160 Z"
              fill="#ff7a00"
              fillOpacity="0.9"
            />
            <path
              d="M52 153 C 160 153, 220 112, 360 112 C 430 112, 480 130, 508 135 L 508 142 C 480 137, 430 120, 360 120 C 220 120, 160 161, 52 161 Z"
              fill="#f97316"
              fillOpacity="0.4"
            />

            {/* EMBEDDED CARGOPULSE LOGO ON CONTAINER */}
            <g transform="translate(195, 62)">
              {/* Outer Circular Logo Badge */}
              <circle cx="36" cy="36" r="34" fill="#ffffff" stroke="#ff7a00" strokeWidth="3.5" />
              <circle cx="36" cy="36" r="28" fill="#ff7a00" />
              {/* Image element embedding official logo */}
              <image href="/cargopulse-logo.png" x="8" y="8" width="56" height="56" />

              {/* Text Branding on Container */}
              <text x="82" y="32" fill="#0f172a" fontSize="26" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="-0.5">
                Cargo<tspan fill="#ff7a00">Pulse</tspan>
              </text>
              <text x="83" y="50" fill="#64748b" fontSize="10" fontWeight="700" fontFamily="system-ui, sans-serif" letterSpacing="2">
                LOGISTICS INTELLIGENCE
              </text>
            </g>

            {/* Container Details & Technical Markings */}
            <text x="65" y="60" fill="#94a3b8" fontSize="9" fontWeight="700" fontFamily="monospace">
              CP-40HC-9812
            </text>
            <text x="65" y="72" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              MAX GROSS: 32,500 KG
            </text>
            <text x="65" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace">
              TARE WT: 3,850 KG
            </text>

            {/* --- TRAILER CHASSIS & UNDERCARRIAGE --- */}
            {/* Chassis I-Beam */}
            <rect x="60" y="194" width="460" height="12" fill="#334155" rx="2" />
            {/* Mudguard arches */}
            <rect x="110" y="196" width="165" height="10" fill="#1e293b" rx="4" />
            {/* Trailer Landing Gear (Legs) */}
            <rect x="390" y="196" width="12" height="42" fill="#475569" />
            <rect x="384" y="234" width="24" height="6" fill="#1e293b" rx="2" />

            {/* --- TRACTOR TRUCK CABIN --- */}
            {/* Cabin Body Base */}
            <path
              d="M510 206 L 510 90 C 510 75, 525 64, 545 64 L 635 64 C 655 64, 668 76, 680 96 L 714 150 C 720 160, 722 170, 722 182 L 722 206 Z"
              fill="#0f172a"
              stroke="#1e293b"
              strokeWidth="2"
            />
            {/* Cabin Roof Fairing (Aerodynamic Wind Deflector in Orange) */}
            <path
              d="M512 66 L 512 40 C 512 36, 525 32, 545 32 L 625 32 C 645 32, 658 40, 668 54 L 676 66 Z"
              fill="#ff7a00"
              stroke="#ea580c"
              strokeWidth="2"
            />
            {/* Windshield Glass */}
            <path
              d="M625 74 L 565 74 C 555 74, 550 78, 550 86 L 550 135 L 678 135 L 650 92 C 644 80, 636 74, 625 74 Z"
              fill="#38bdf8"
              fillOpacity="0.4"
              stroke="#0284c7"
              strokeWidth="2"
            />
            {/* Side Window */}
            <path
              d="M550 86 L 525 86 C 520 86, 518 90, 518 96 L 518 135 L 550 135 Z"
              fill="#38bdf8"
              fillOpacity="0.3"
              stroke="#0284c7"
              strokeWidth="1.5"
            />
            {/* Driver Silhouette */}
            <circle cx="536" cy="110" r="10" fill="#0f172a" fillOpacity="0.7" />
            <path d="M524 135 C 524 124, 532 120, 536 120 C 540 120, 548 124, 548 135 Z" fill="#0f172a" fillOpacity="0.7" />

            {/* Front Grille */}
            <rect x="702" y="162" width="22" height="38" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <line x1="705" y1="170" x2="720" y2="170" stroke="#64748b" strokeWidth="2" />
            <line x1="705" y1="178" x2="720" y2="178" stroke="#64748b" strokeWidth="2" />
            <line x1="705" y1="186" x2="720" y2="186" stroke="#64748b" strokeWidth="2" />
            <line x1="705" y1="194" x2="720" y2="194" stroke="#ff7a00" strokeWidth="2" />

            {/* Front Headlight (Illuminated) */}
            <rect x="712" y="172" width="12" height="12" rx="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Light beam glow */}
            <path d="M724 174 L 755 160 L 755 200 L 724 184 Z" fill="#fef08a" fillOpacity="0.15" />

            {/* Side Mirror */}
            <rect x="668" y="90" width="6" height="24" rx="2" fill="#ff7a00" />
            {/* Door Handle */}
            <rect x="560" y="148" width="14" height="4" rx="2" fill="#94a3b8" />
            {/* Cabin Side Accent Line */}
            <line x1="510" y1="168" x2="695" y2="168" stroke="#ff7a00" strokeWidth="4" />

            {/* Fuel Tank & Battery Box */}
            <rect x="525" y="196" width="60" height="24" rx="6" fill="#64748b" stroke="#334155" strokeWidth="2" />
            <line x1="532" y1="196" x2="532" y2="220" stroke="#334155" strokeWidth="2" />
            <line x1="578" y1="196" x2="578" y2="220" stroke="#334155" strokeWidth="2" />

            {/* --- WHEELS (5 HEAVY-DUTY DUAL AXLES) --- */}
            {/* Trailer Wheel 1 */}
            <g transform="translate(132, 224)">
              <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
              <circle cx="0" cy="0" r="18" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="0" cy="0" r="8" fill="#475569" />
              <circle cx="0" cy="0" r="3" fill="#ff7a00" />
            </g>

            {/* Trailer Wheel 2 */}
            <g transform="translate(192, 224)">
              <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
              <circle cx="0" cy="0" r="18" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="0" cy="0" r="8" fill="#475569" />
              <circle cx="0" cy="0" r="3" fill="#ff7a00" />
            </g>

            {/* Trailer Wheel 3 */}
            <g transform="translate(252, 224)">
              <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
              <circle cx="0" cy="0" r="18" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="0" cy="0" r="8" fill="#475569" />
              <circle cx="0" cy="0" r="3" fill="#ff7a00" />
            </g>

            {/* Tractor Rear Drive Wheel */}
            <g transform="translate(615, 224)">
              <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
              <circle cx="0" cy="0" r="18" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="0" cy="0" r="8" fill="#475569" />
              <circle cx="0" cy="0" r="3" fill="#ff7a00" />
            </g>

            {/* Tractor Front Steer Wheel */}
            <g transform="translate(685, 224)">
              <circle cx="0" cy="0" r="28" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
              <circle cx="0" cy="0" r="18" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
              <circle cx="0" cy="0" r="8" fill="#475569" />
              <circle cx="0" cy="0" r="3" fill="#ff7a00" />
            </g>

          </svg>
        </div>

        {/* Live Operational Telematics Pills Bar */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 text-[11px]">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <Navigation className="h-3 w-3 text-orange-500" />
              <span className="font-semibold">GPS Telematics</span>
            </div>
            <p className="font-bold text-slate-900 font-mono text-[10px]">12.9815° N, 80.0152° E</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <Thermometer className="h-3 w-3 text-blue-500" />
              <span className="font-semibold">Cold Storage</span>
            </div>
            <p className="font-bold text-slate-900 font-mono text-[10px]">+4.2°C Stabilized</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <Radio className="h-3 w-3 text-emerald-500" />
              <span className="font-semibold">Corridor Route</span>
            </div>
            <p className="font-bold text-slate-900 text-[10px] truncate">NH-44 Express Line</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
            <div className="flex items-center gap-1.5 text-slate-500 mb-0.5">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span className="font-semibold">Security Seal</span>
            </div>
            <p className="font-bold text-emerald-700 font-mono text-[10px]">#CP-8849-OK</p>
          </div>
        </div>

      </div>
    </div>
  );
};
