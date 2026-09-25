import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, AlertTriangle, KeyRound, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboardPage } from './AdminDashboardPage';
import { Button } from '../../components/ui/Button';
import { Input, FormField } from '../../components/ui/Input';

export const AdminEntryPage: React.FC = () => {
  const { user, login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <span className="text-xs font-bold">Verifying security clearance...</span>
        </div>
      </div>
    );
  }

  // Already authenticated as admin -> show admin dashboard
  if (user && user.role === 'ADMIN') {
    return <AdminDashboardPage />;
  }

  // Logged in as non-admin
  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 shadow-sm">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-serif text-2xl font-bold text-slate-950">Administrative Clearance Required</h1>
          <p className="mt-2 text-xs text-slate-600">
            You are currently signed in as <strong className="text-slate-900">{user.name}</strong> ({user.role.replace(/_/g, ' ')}).
            This console is restricted strictly to platform administrators.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 text-xs shadow-md transition"
              onClick={() => logout()}
            >
              Sign out & sign in as Admin
            </button>
            <button
              className="w-full rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold py-2.5 text-xs transition"
              onClick={() => window.location.href = '/'}
            >
              Return to public website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, 'ADMIN');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const adminCapabilities = [
    { title: 'Identity & Aadhar Verification', desc: 'Inspect uploaded employee photos, aadhar cards, experience levels, and residential addresses before granting access.' },
    { title: 'Operational Directives Dispatch', desc: 'Directly send high-priority SOP alerts, weather warnings, and audit directives to any module manager with branded logo.' },
    { title: 'Multi-Tier Module Governance', desc: 'Centralized administrative oversight across Warehouse, Logistics, Supplier, and Customer portals.' },
    { title: 'Zero-Trust Audit Trails', desc: 'Trace every security event, role modification, and sensitive access attempt with immutable timestamps.' },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      
      {/* ================= LEFT HALF: SOLID ORANGE BACKGROUND ================= */}
      <div className="lg:col-span-6 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />

        {/* Top: Back Link & Logo */}
        <div className="relative z-10 space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white/90 hover:text-white transition bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md"
          >
            <ArrowLeft className="h-4 w-4" /> Back to CargoPulse Platform
          </Link>

          <div className="flex items-center gap-3 pt-2">
            <img src="/cargopulse-logo.png" alt="CargoPulse" className="h-12 w-12 object-contain rounded-2xl bg-white p-1 shadow-lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-black tracking-tight text-white">CargoPulse</span>
                <span className="rounded-full bg-slate-950 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">Platform Administration & Governance</p>
            </div>
          </div>
        </div>

        {/* Middle: Purpose & Responsibilities */}
        <div className="relative z-10 my-8 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-3 backdrop-blur-md">
              <KeyRound className="h-3.5 w-3.5 text-amber-200" />
              Restricted Access Console
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold leading-tight text-white">
              Platform Governance & Security
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-50 leading-relaxed max-w-xl">
              Central administration portal for multi-tier supply chain management. Verify identity documents (photos & Aadhar cards), approve pending operators, dispatch operational directives, and monitor live risk telemetry.
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-200">
              Administrative Controls & Powers:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {adminCapabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-3.5 text-white shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-amber-200 shrink-0" />
                    <h4 className="text-xs font-bold text-white leading-tight">{cap.title}</h4>
                  </div>
                  <p className="text-[11px] text-orange-100 leading-relaxed pl-6">
                    {cap.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: SOC2 info */}
        <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs text-orange-100">
          <span>Immutable audit trails enabled for all administrative actions.</span>
          <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-[10px]">SOC2 Type II</span>
        </div>

      </div>

      {/* ================= RIGHT HALF: ADMIN LOGIN FORM ================= */}
      <div className="lg:col-span-6 bg-slate-50 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5">
          
          <div className="mb-6 border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Root Authentication</span>
            <h2 className="font-serif text-2xl font-bold text-slate-950 mt-1">Admin Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter authorized root credentials to proceed.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Administrator Email Address" htmlFor="admin-email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@cargopulse.io"
                  className="pl-10 text-xs"
                />
              </div>
            </FormField>

            <FormField label="Master Password" htmlFor="admin-password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 text-xs"
                />
              </div>
            </FormField>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              size="md"
              variant="primary"
              className="w-full justify-center bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 py-3"
              isLoading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Verify Clearance & Sign In
            </Button>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Hardware MFA Protected</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">TLS 1.3 Strict</span>
          </div>

        </div>
      </div>

    </div>
  );
};
