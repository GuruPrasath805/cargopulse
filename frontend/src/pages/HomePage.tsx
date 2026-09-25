import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Radar,
  GitCommit,
  RotateCcw,
  Navigation,
  BrainCircuit,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Truck,
  ShieldCheck,
} from 'lucide-react';
import { PORTALS } from '../config/portals';
import { getAccent } from '../config/accentStyles';
import { Button } from '../components/ui/Button';
import { RouteNetworkTruckScene } from '../components/RouteNetworkTruckScene';
import { BrandedContainerTruck } from '../components/BrandedContainerTruck';
import { ChromaGrid, ChromaGridItem } from '../components/ui/ChromaGrid';
import { BlurText } from '../components/ui/BlurText';
import { SpecularButton } from '../components/ui/SpecularButton';
import { SpotlightCard } from '../components/ui/SpotlightCard';

const FEATURE_ITEMS: ChromaGridItem[] = [
  {
    icon: Network,
    title: 'Supply Chain Digital Twin',
    subtitle: 'A live interactive network graph mapping every supplier, hub, corridor and client — click any node for live capacity and risk.',
    handle: '@cargopulse/digital-twin',
    borderColor: '#ff7a00',
    gradient: 'linear-gradient(145deg, #fff7ed, #ffffff)',
    url: '#portals',
  },
  {
    icon: Radar,
    title: 'Multi-Factor Risk Radar',
    subtitle: 'A real-time 0–100 composite score across highway bottlenecks, stock deficits, supplier variance and warehouse stress.',
    handle: '@cargopulse/risk-radar',
    borderColor: '#f97316',
    gradient: 'linear-gradient(145deg, #fff7ed, #ffffff)',
    url: '#portals',
  },
  {
    icon: BrainCircuit,
    title: 'Predictive Stockout Forecasts',
    subtitle: 'Consumption-velocity modeling projects exact stockout dates and recommends optimal reorder quantities.',
    handle: '@cargopulse/ai-forecasts',
    borderColor: '#ea580c',
    gradient: 'linear-gradient(145deg, #fff7ed, #ffffff)',
    url: '#portals',
  },
  {
    icon: Navigation,
    title: 'Live Telematics & Tracking',
    subtitle: 'Simulated GPS, speed and cold-chain telemetry with milestone checkpoints from origin hub to destination dock.',
    handle: '@cargopulse/telematics',
    borderColor: '#ff7a00',
    gradient: 'linear-gradient(145deg, #fff7ed, #ffffff)',
    url: '#portals',
  },
  {
    icon: GitCommit,
    title: 'End-to-End Traceability',
    subtitle: 'Audit any SKU or lot through a full 6-stage custody trail — sourcing, QC, bin placement, dispatch, transit, delivery.',
    handle: '@cargopulse/traceability',
    borderColor: '#f97316',
    gradient: 'linear-gradient(145deg, #fff7ed, #ffffff)',
    url: '#portals',
  },
  {
    icon: RotateCcw,
    title: 'Reverse Logistics Triage',
    subtitle: 'RMA returns routed through an inspection workflow: restock, repair, replace, or scrap — fully audited.',
    handle: '@cargopulse/reverse-rma',
    borderColor: '#ea580c',
    gradient: 'linear-gradient(145deg, #fff7ed, #ffffff)',
    url: '#portals',
  },
];

export const HomePage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAnimationComplete = () => {
    console.log('Headline animation completed!');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* ================= NAVBAR (SpecularButton Navigation with Home First) ================= */}
      <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-3 group">
            <img src="/cargopulse-logo.png" alt="CargoPulse Logo" className="h-11 w-11 object-contain group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <div className="flex items-center tracking-tight font-serif text-xl font-extrabold text-slate-950">
                <span>Cargo</span>
                <span className="text-orange-500">Pulse</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-500 tracking-wider">Track. Manage. Predict. Deliver.</span>
            </div>
          </a>

          {/* SpecularButton Desktop Navigation (Home FIRST!) */}
          <nav className="hidden items-center gap-2 md:flex">
            <SpecularButton href="#top" size="sm" radius={14} lineColor="#ff7a00" followMouse>
              Home
            </SpecularButton>
            <SpecularButton href="#platform" size="sm" radius={14} lineColor="#ff7a00" followMouse>
              Platform
            </SpecularButton>
            <SpecularButton href="#features" size="sm" radius={14} lineColor="#ff7a00" followMouse>
              Features
            </SpecularButton>
            <SpecularButton href="#portals" size="sm" radius={14} lineColor="#ff7a00" followMouse>
              Portals
            </SpecularButton>
            <SpecularButton href="#about" size="sm" radius={14} lineColor="#ff7a00" followMouse>
              About
            </SpecularButton>
          </nav>

          {/* SpecularButton Action Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/warehouse/login">
              <SpecularButton
                as="span"
                size="sm"
                radius={14}
                textColor="#0f172a"
                lineColor="#0f172a"
                baseColor="#ffffff"
                followMouse
                className="border border-slate-300"
              >
                Sign in
              </SpecularButton>
            </Link>
            <a href="#portals">
              <SpecularButton
                as="span"
                size="sm"
                radius={14}
                textColor="#ffffff"
                lineColor="#ffffff"
                baseColor="#ff7a00"
                followMouse
                className="shadow-md shadow-orange-500/30"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </SpecularButton>
            </a>
          </div>

          <button className="md:hidden text-slate-800 p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden shadow-lg">
            <div className="flex flex-col gap-3 text-sm font-bold text-slate-800">
              <a href="#top" onClick={() => setMenuOpen(false)} className="text-orange-600">Home</a>
              <a href="#platform" onClick={() => setMenuOpen(false)} className="hover:text-orange-600">Platform</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="hover:text-orange-600">Features</a>
              <a href="#portals" onClick={() => setMenuOpen(false)} className="hover:text-orange-600">Portals</a>
              <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-orange-600">About</a>
              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <Link to="/warehouse/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 rounded-xl border-2 border-slate-900 text-xs font-bold text-slate-900">
                  Sign in
                </Link>
                <a href="#portals" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white">
                  Get started
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO (Two-Column: Left Context + Right Branded Container Truck) ================= */}
      <section id="top" className="relative overflow-hidden pt-12 pb-16 bg-gradient-to-b from-orange-50/50 via-white to-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 right-1/4 h-[450px] w-[600px] rounded-full bg-orange-500/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* LEFT COLUMN: Hero Context, BlurText Headline & Actions */}
            <div className="lg:col-span-6 xl:col-span-6 text-left">
              {/* Telemetry Badge */}
              <div className="inline-flex items-center gap-2 overflow-hidden rounded-full border border-orange-500/30 bg-orange-50 px-4 py-1.5 text-xs font-bold text-orange-600 shadow-xs mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                </span>
                Live GPS & Cold-Chain Telemetry
                <span className="badge-shimmer absolute inset-y-0 left-0 w-1/3 skew-x-12 bg-white/40" />
              </div>

              {/* BlurText Headline Animation (Letter-by-Letter) */}
              <h1 className="flex flex-col font-serif leading-[1.06] tracking-tight">
                <BlurText
                  text="Track. Manage. Predict."
                  delay={35}
                  animateBy="letters"
                  direction="top"
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.12] tracking-tight text-slate-950 font-serif"
                />
                <div className="mt-1">
                  <BlurText
                    text="Deliver — All in One Pulse."
                    delay={35}
                    animateBy="letters"
                    direction="top"
                    onAnimationComplete={handleAnimationComplete}
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.12] tracking-tight text-slate-950 font-serif"
                  />
                </div>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                CargoPulse unifies suppliers, warehouses, fleet and last-mile delivery into a single digital twin &mdash;
                with predictive risk intelligence built in.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="#portals">
                  <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/25 hover:bg-orange-600 hover:shadow-orange-500/40 transition transform hover:-translate-y-0.5">
                    Explore the platform <ArrowRight className="h-4 w-4" />
                  </button>
                </a>
                <a href="#features">
                  <button className="rounded-xl border-2 border-slate-900 bg-white px-7 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition shadow-sm">
                    See what's inside
                  </button>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">99.8% On-Time SLA</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">Zero-Trust RBAC Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-slate-900">PulseAI Copilot 24/7</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Real Commercial Truck Photo with CargoPulse Logo on Container (Direct Photo, Not inside a box) */}
            <div className="lg:col-span-6 xl:col-span-6 flex justify-center items-center">
              <div className="relative w-full max-w-2xl mx-auto group">
                {/* Natural roadway ambient glow */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent blur-3xl pointer-events-none" />

                {/* The Truck Photograph directly standing in the hero */}
                <img
                  src="/real-truck.jpg"
                  alt="CargoPulse Heavy Haulage Container Truck"
                  className="relative z-10 w-full h-auto object-cover rounded-3xl shadow-2xl drop-shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
                />

                {/* Floating telemetry pill directly overlaid on vehicle photo */}
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-slate-950/75 backdrop-blur-md px-3.5 py-1.5 text-xs text-white border border-white/20 shadow-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-[11px] tracking-wide">CargoPulse Heavy Container Fleet</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= PLATFORM INTRO ================= */}
      <section id="platform" className="mx-auto max-w-5xl px-6 py-20 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-orange-500">The Platform</span>
        <h2 className="mt-3 font-serif text-3xl font-bold text-slate-950 sm:text-4xl">
          One system of record for your entire supply chain
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base leading-relaxed">
          Traditional logistics tools only answer "how much stock do I have?" CargoPulse answers where a product
          originated, where it's allocated right now, its live transit status, what's predicted next, and how
          returns are being handled — end to end.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            ['4', 'Role-based portals'],
            ['15+', 'Operational modules'],
            ['6', 'Stage custody trail'],
            ['24/7', 'Live telemetry'],
          ].map(([stat, label]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-orange-500/40 transition">
              <p className="font-serif text-4xl font-extrabold text-orange-500">{stat}</p>
              <p className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SIGNATURE FEATURES (ChromaGrid with Orange Spotlight) ================= */}
      <section id="features" className="border-y border-slate-200 bg-slate-50/80 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Signature Features</span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-slate-950 sm:text-4xl">Built for real logistics complexity</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">Interactive chromatic telemetry radar tracking operational nodes.</p>
          </div>
          
          {/* ChromaGrid Component */}
          <div className="mt-14">
            <ChromaGrid items={FEATURE_ITEMS} radius={320} />
          </div>
        </div>
      </section>

      {/* ================= MODULE / PORTAL DIRECTORY (MagicBento 3D Tilt + Stars + Glow) ================= */}
      <section id="portals" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-500">Choose Your Portal</span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-slate-950 sm:text-4xl">Every role, its own workspace</h2>
          <p className="mt-4 text-sm text-slate-600 sm:text-base leading-relaxed">
            Each portal has its own sign-in, registration and dashboard. New accounts are reviewed by an
            administrator before first login — nothing gets in without approval.
          </p>
        </div>

        {/* 4 Public Role Portals wrapped in SpotlightCard */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PORTALS.map(portal => {
            const accent = getAccent(portal.accent);
            const Icon = portal.icon;
            const spotlightColor =
              portal.key === 'warehouse' ? 'rgba(255, 122, 0, 0.25)' :
              portal.key === 'logistics' ? 'rgba(59, 130, 246, 0.25)' :
              portal.key === 'supplier' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(6, 182, 212, 0.25)';

            return (
              <SpotlightCard
                key={portal.key}
                spotlightColor={spotlightColor}
                className="custom-spotlight-card h-full"
              >
                <div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.iconWrap}`}>
                    <Icon className={`h-6 w-6 ${accent.iconText}`} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-950">{portal.title}</h3>
                  <p className={`mt-0.5 text-xs font-bold ${accent.text}`}>{portal.tagline}</p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">{portal.description}</p>

                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                    {portal.modules.slice(0, 3).map(m => (
                      <li key={m.path} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                        {m.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  <Link to={portal.loginPath} className="w-full">
                    <Button variant="outline" size="sm" fullWidth className="border-slate-300 text-slate-800 hover:bg-slate-900 hover:text-white font-bold">
                      Sign in
                    </Button>
                  </Link>
                  {portal.allowSelfRegister && (
                    <Link to={portal.registerPath} className="w-full">
                      <Button size="sm" fullWidth className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20">
                        Register
                      </Button>
                    </Link>
                  )}
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Security / Admin Approval Notice */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600 shadow-sm">
          <p>
            🔒 <strong className="text-slate-900">Admin Approval Protected:</strong> First-time user registrations for all portals require authorization by platform administrators before initial login.
          </p>
        </div>
      </section>

      {/* ================= CTA BAND ================= */}
      <section id="about" className="mx-6 sm:mx-12 my-12 rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 py-16 px-6 text-white shadow-2xl shadow-orange-500/20 text-center">
        <div className="relative mx-auto max-w-3xl">
          <Sparkles className="mx-auto h-8 w-8 text-white" />
          <h2 className="mt-4 font-serif text-3xl font-bold text-white sm:text-4xl">Ready to see your supply chain clearly?</h2>
          <p className="mt-3 text-sm text-white/90 sm:text-base leading-relaxed">
            Register for the portal that matches your role — approval typically only takes a moment.
          </p>
          <a href="#portals" className="mt-8 inline-block">
            <button className="rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-black hover:scale-105 transition transform">
              Find your portal
            </button>
          </a>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-slate-950 text-slate-300 py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div>
              <div className="flex items-center gap-2.5">
                <img src="/cargopulse-logo.png" alt="CargoPulse" className="h-8 w-8 object-contain" />
                <span className="font-serif text-base font-bold text-white">CargoPulse</span>
              </div>
              <p className="mt-2 max-w-xs text-xs text-slate-400 leading-relaxed">
                End-to-end supply chain visibility & logistics management, from sourcing to last-mile delivery.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-xs sm:grid-cols-3">
              <div>
                <p className="font-bold text-white">Portals</p>
                <ul className="mt-2.5 space-y-2 text-slate-400">
                  {PORTALS.map(p => (
                    <li key={p.key}>
                      <Link to={p.loginPath} className="hover:text-orange-400 transition">{p.shortLabel}</Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-bold text-white">Platform</p>
                <ul className="mt-2.5 space-y-2 text-slate-400">
                  <li><a href="#features" className="hover:text-orange-400 transition">Features</a></li>
                  <li><a href="#platform" className="hover:text-orange-400 transition">Overview</a></li>
                  <li><a href="#portals" className="hover:text-orange-400 transition">Portals Directory</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-[11px] text-slate-500">
            © {new Date().getFullYear()} CargoPulse. Track. Manage. Predict. Deliver.
          </div>
        </div>
      </footer>
    </div>
  );
};
