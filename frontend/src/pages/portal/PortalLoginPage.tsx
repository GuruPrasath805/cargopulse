import React, { useState } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  UserPlus,
  KeyRound,
  X,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPortalByKey } from '../../config/portals';
import { getAccent } from '../../config/accentStyles';
import { Button } from '../../components/ui/Button';
import { Input, FormField } from '../../components/ui/Input';
import { ApiClient } from '../../services/api';

export const PortalLoginPage: React.FC = () => {
  const { portalKey = '' } = useParams();
  const portal = getPortalByKey(portalKey);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [simulatedCodeHelper, setSimulatedCodeHelper] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);
    setSimulatedCodeHelper(null);
    setForgotLoading(true);
    try {
      const res = await ApiClient.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(res.message);
      if (res.code) {
        setSimulatedCodeHelper(res.code);
        setResetCode(res.code);
      }
      setForgotStep('VERIFY');
    } catch (err: any) {
      setForgotError(err.message || 'Failed to request reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (newPassword.length < 8) {
      setForgotError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match. Please verify and re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await ApiClient.post('/auth/reset-password', {
        email: forgotEmail,
        code: resetCode,
        newPassword,
      });
      setForgotSuccess(res.message);
      setEmail(forgotEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep('REQUEST');
        setForgotSuccess(null);
      }, 2000);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  if (!portal) return <Navigate to="/" replace />;
  if (user && (user.role === portal.role || user.role === 'ADMIN')) return <Navigate to={portal.dashboardPath} replace />;

  const Icon = portal.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password, portal.role);
      navigate(portal.dashboardPath);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPortalDuties = () => {
    switch (portal.role) {
      case 'WAREHOUSE_MANAGER':
        return {
          purpose: 'Centralized warehouse orchestration, SKU inventory optimization, dynamic zone bin allocation, and inbound Goods Receipt Note (GRN) verification.',
          duties: [
            { title: 'Dynamic Bin Allocation', desc: 'Configure Zone A (fast-moving) through Zone D (climate-controlled) storage racks with utilization metrics.' },
            { title: 'Inbound Verification & GRN', desc: 'Scan Bill of Lading (BOL), verify pallet counts against POs, and generate verified Goods Receipt Notes.' },
            { title: 'Safety Stock Automation', desc: 'Monitor daily burn rates and trigger automated replenishment before production lines stall.' },
            { title: 'Cycle Audit Ledgers', desc: 'Enforce double-entry physical inventory reconciliations with automated quarantine ledgers.' },
          ],
        };
      case 'LOGISTICS_MANAGER':
        return {
          purpose: 'Line-haul transport intelligence, dynamic RouteIQ dispatch optimization, live vehicle telematics, and electronic proof of delivery.',
          duties: [
            { title: 'RouteIQ Dynamic Routing', desc: 'Corridor optimization bypassing highway bottlenecks, adverse monsoon waterlogging, and toll delays.' },
            { title: 'Live GPS Telematics', desc: 'Monitor real-time vehicle coordinates, speed telemetry, and cold-chain temperature sensors every 60 seconds.' },
            { title: 'Digital Proof of Delivery (e-POD)', desc: 'Verify OTP handovers, consignee digital signatures, and immediate receipt dispatches.' },
            { title: 'Carrier SLA Governance', desc: 'Track on-time performance rates, driver turnaround times (TAT), and line-haul exception flags.' },
          ],
        };
      case 'SUPPLIER':
        return {
          purpose: 'Procurement order lifecycle management, Advanced Shipping Notice (ASN) transmission, and 3-way matching invoice clearance.',
          duties: [
            { title: 'Purchase Order Acceptance', desc: 'Review, acknowledge, and confirm scheduled delivery milestones for inbound POs within 4 hours.' },
            { title: 'Advanced Shipping Notice (ASN)', desc: 'Generate digital ASNs with package dimensions, weight, and carrier waybills prior to dispatch.' },
            { title: 'Quality & Batch Compliance', desc: 'Upload Certificate of Analysis (COA) documentation to prevent dock inspection hold-ups.' },
            { title: '3-Way Match Invoicing', desc: 'Automated 3-way matching between PO, ASN, and warehouse GRN for fast invoice clearance.' },
          ],
        };
      case 'CUSTOMER':
        return {
          purpose: 'Consignee delivery visibility, minute-by-minute vehicle GPS tracking, and seamless 48-hour return (RMA) ticket processing.',
          duties: [
            { title: 'Live Consignment Tracking', desc: 'Enter any tracking code (e.g. SH-10234) for real-time truck GPS coordinates and live ETA countdown.' },
            { title: 'Electronic Delivery Receipts', desc: 'Download signed proof-of-delivery documents and delivery inspection receipts instantly.' },
            { title: '1-Click RMA Return Filing', desc: 'File return or replacement claims within 48 hours with photo verification and automated airway bills.' },
            { title: 'PulseAI Delivery Assistant', desc: 'Ask PulseAI 24/7 for delivery rescheduling, driver details, and transit milestones.' },
          ],
        };
      default:
        return {
          purpose: 'Unified logistics intelligence and multi-tier supply chain execution.',
          duties: [
            { title: 'Real-Time Telemetry', desc: 'Complete visibility across suppliers, warehouses, and consignees.' },
            { title: 'PulseAI Assistance', desc: 'Natural language queries grounded directly in live operational database records.' },
            { title: 'Role-Based Governance', desc: 'Enterprise access control enforcing strict data boundaries.' },
            { title: 'Audit Trail Accountability', desc: 'Every transaction is logged with timestamps and operator credentials.' },
          ],
        };
    }
  };

  const dutiesInfo = getPortalDuties();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12">
      
      {/* ================= LEFT HALF: SOLID ORANGE BACKGROUND ================= */}
      <div className="lg:col-span-6 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden shadow-2xl">
        {/* Subtle background decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />

        {/* Top bar: Back Link & Logo */}
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
                <span className="rounded-full bg-white text-orange-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {portal.shortLabel}
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">{portal.title}</p>
            </div>
          </div>
        </div>

        {/* Middle Content: Purpose & Duties */}
        <div className="relative z-10 my-8 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-3 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              Purpose of this Login
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold leading-tight text-white">
              {portal.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-50 leading-relaxed max-w-xl">
              {dutiesInfo.purpose}
            </p>
          </div>

          {/* 4 Cards: What You Will Do in this Portal */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-200">
              Key Operations & What You Will Do Once Logged In:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dutiesInfo.duties.map((duty, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 p-3.5 text-white shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-amber-200 shrink-0" />
                    <h4 className="text-xs font-bold text-white leading-tight">{duty.title}</h4>
                  </div>
                  <p className="text-[11px] text-orange-100 leading-relaxed pl-6">
                    {duty.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Callout: Need an Account? Create Account */}
        <div className="relative z-10 pt-4 border-t border-white/20">
          <div className="rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
            <div>
              <p className="text-xs font-bold flex items-center gap-1.5">
                <UserPlus className="h-4 w-4 text-amber-200" />
                <span>New Operator or Partner?</span>
              </p>
              <p className="text-[11px] text-orange-100 mt-0.5">
                Apply for authorized role credentials with identity verification.
              </p>
            </div>
            {portal.allowSelfRegister && (
              <Link to={portal.registerPath} className="shrink-0">
                <button className="flex items-center gap-1.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 text-xs font-bold shadow-md transition">
                  <span>Create Account</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* ================= RIGHT HALF: CLEAN SIGN-IN FORM ================= */}
      <div className="lg:col-span-6 bg-slate-50 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5">
          
          <div className="mb-6 border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Enterprise Access</span>
            <h2 className="font-serif text-2xl font-bold text-slate-950 mt-1">Sign In</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter authorized credentials for {portal.title}.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Authorized Corporate Email" htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@cargopulse.io"
                  className="pl-10 text-xs"
                />
              </div>
            </FormField>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email || '');
                    setForgotError(null);
                    setForgotSuccess(null);
                    setSimulatedCodeHelper(null);
                    setForgotStep('REQUEST');
                    setShowForgot(true);
                  }}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-10 text-xs"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Admin Root Review Helper */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs text-purple-900 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                <span className="text-[11px] leading-tight">
                  <strong>Admin Review:</strong> Root admins can sign in with <code className="bg-purple-100 text-purple-800 px-1 py-0.5 rounded font-mono font-bold">admin@cargopulse.io</code> to inspect this portal's data.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@cargopulse.io');
                  setPassword('password123');
                }}
                className="shrink-0 text-[10px] font-bold text-purple-700 bg-white border border-purple-300 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition shadow-xs"
              >
                Fill Admin
              </button>
            </div>

            <Button
              type="submit"
              size="md"
              variant="primary"
              className="w-full justify-center bg-orange-500 hover:bg-orange-600 font-bold text-sm shadow-lg shadow-orange-500/20 py-3"
              isLoading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In to {portal.shortLabel}
            </Button>
          </form>

          {/* ================= FORGOT PASSWORD MODAL ================= */}
          {showForgot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgot(false);
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 border border-orange-200 text-orange-600">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-950">Reset Password</h3>
                    <p className="text-xs text-slate-500">
                      {forgotStep === 'REQUEST' ? 'Receive a 6-digit verification code' : 'Verify code & choose a new password'}
                    </p>
                  </div>
                </div>

                {forgotSuccess && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                {simulatedCodeHelper && (
                  <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                    <span className="font-bold block">Developer / Direct Verification Notice:</span>
                    <span className="text-[11px]">SMTP is not configured on Render, so your OTP code is: <code className="bg-amber-200 font-mono font-bold px-1.5 py-0.5 rounded text-amber-950">{simulatedCodeHelper}</code> (auto-filled).</span>
                  </div>
                )}

                {forgotError && (
                  <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotStep === 'REQUEST' ? (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <FormField label="Registered Corporate Email" htmlFor="forgot-email">
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="forgot-email"
                          type="email"
                          required
                          autoFocus
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="operator@cargopulse.io"
                          className="pl-10 text-xs"
                        />
                      </div>
                    </FormField>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full justify-center bg-orange-500 hover:bg-orange-600 font-bold text-xs py-2.5"
                      isLoading={forgotLoading}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Send Verification Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <FormField label="6-Digit Verification Code" htmlFor="reset-code">
                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="reset-code"
                          type="text"
                          required
                          autoFocus
                          maxLength={6}
                          value={resetCode}
                          onChange={e => setResetCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="pl-10 text-xs font-mono tracking-widest text-center text-sm font-bold"
                        />
                      </div>
                    </FormField>

                    <FormField label="New Password (min 8 characters)" htmlFor="new-password">
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="pl-10 pr-10 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormField>

                    <FormField label="Confirm New Password" htmlFor="confirm-password">
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="confirm-password"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="pl-10 text-xs"
                        />
                      </div>
                    </FormField>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setForgotStep('REQUEST')}
                        className="text-xs"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="flex-1 justify-center bg-orange-500 hover:bg-orange-600 font-bold text-xs py-2.5"
                        isLoading={forgotLoading}
                        rightIcon={<Check className="h-4 w-4" />}
                      >
                        Update Password
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Footer Security Badge */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Zero-Trust RBAC Secured</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">256-bit TLS</span>
          </div>

        </div>
      </div>

    </div>
  );
};
