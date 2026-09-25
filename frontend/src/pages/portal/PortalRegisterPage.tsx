import React, { useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Building2,
  Phone,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  LogIn,
  Camera,
  CreditCard,
  Briefcase,
  MapPin,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPortalByKey } from '../../config/portals';
import { Button } from '../../components/ui/Button';
import { Input, FormField } from '../../components/ui/Input';

export const PortalRegisterPage: React.FC = () => {
  const { portalKey = '' } = useParams();
  const portal = getPortalByKey(portalKey);
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');

  // Identity Verification Fields requested by user:
  // photo of employee, aadhar card photo, years of experience, address
  const [photoUrl, setPhotoUrl] = useState('');
  const [aadharCardUrl, setAadharCardUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState('3-5 Years (Mid-Senior)');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!portal || !portal.allowSelfRegister) return <Navigate to="/" replace />;

  const needsCompany = portal.role === 'SUPPLIER' || portal.role === 'CUSTOMER';

  // Handle Photo File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Aadhar Card File Upload
  const handleAadharUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadharCardUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!address.trim()) {
      setError('Please provide your residential / operational address for identity verification.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role: portal.role,
        companyName: companyName || undefined,
        phone: phone || undefined,
        photoUrl: photoUrl || undefined,
        aadharCardUrl: aadharCardUrl || undefined,
        experienceYears,
        address,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPortalDuties = () => {
    switch (portal.role) {
      case 'WAREHOUSE_MANAGER':
        return {
          purpose: 'Establish verified warehouse leadership access to configure dynamic storage bays, supervise inbound manifests, and reconcile cyclic counts.',
          duties: [
            { title: 'Dynamic Bin Allocation', desc: 'Configure Zone A through Zone D rack coordinates and manage real-time utilization.' },
            { title: 'Inbound Verification & GRN', desc: 'Scan Bill of Lading, log discrepancies, and generate verified Goods Receipt Notes.' },
            { title: 'Safety Stock Automation', desc: 'Configure automatic PO trigger thresholds to prevent stockout bottlenecks.' },
            { title: 'PulseAI Assistance', desc: 'Use AI copilot to forecast cycle counts and optimize put-away routes.' },
          ],
        };
      case 'LOGISTICS_MANAGER':
        return {
          purpose: 'Authorize line-haul logistics coordinators to orchestrate fleet movements, telematics, and route detours.',
          duties: [
            { title: 'RouteIQ Optimization', desc: 'Generate multi-drop corridors avoiding severe weather and highway congestion.' },
            { title: 'GPS Fleet Telematics', desc: 'Live telematics tracking with 60-second coordinate updates and speed alerts.' },
            { title: 'e-POD Sign-Off', desc: 'Inspect OTP signatures and digital delivery confirmations in real time.' },
            { title: 'Line-Haul SLAs', desc: 'Maintain carrier turnaround times and review transit exception tickets.' },
          ],
        };
      case 'SUPPLIER':
        return {
          purpose: 'Onboard verified vendor partners to acknowledge purchase orders, submit ASNs, and expedite payment cycles.',
          duties: [
            { title: 'PO Acknowledgement', desc: 'Accept and confirm scheduled delivery milestones for inbound POs within 4 hours.' },
            { title: 'ASN Submissions', desc: 'Transmit digital packing lists and freight waybills prior to vehicle departure.' },
            { title: 'Quality Certifications', desc: 'Attach COA compliance sheets to guarantee direct dock-to-stock clearance.' },
            { title: '3-Way Match Invoicing', desc: 'Automated invoice matching against warehouse GRNs for expedited settlement.' },
          ],
        };
      case 'CUSTOMER':
        return {
          purpose: 'Provide enterprise consignees with transparent consignment tracking, digital PODs, and 48-hour RMA returns.',
          duties: [
            { title: 'Live GPS Tracking', desc: 'Trace delivery trucks in real time with minute-by-minute ETA predictions.' },
            { title: 'Digital Proof of Delivery', desc: 'Download signed receipts and delivery photos immediately upon drop-off.' },
            { title: 'Hassle-Free Returns (RMA)', desc: 'Submit return or exchange claims within 48 hours with automated airway bills.' },
            { title: 'PulseAI Support', desc: 'Direct assistant communication for gate passes, delivery windows, and updates.' },
          ],
        };
      default:
        return {
          purpose: 'Authorize new operators to participate in the CargoPulse supply chain intelligence network.',
          duties: [
            { title: 'End-to-End Visibility', desc: 'Track operations across suppliers, warehouses, and consignees.' },
            { title: 'Zero-Trust Governance', desc: 'All accounts require administrative review for enterprise security.' },
            { title: 'Role-Based Permissions', desc: 'Scoped module access ensuring data isolation.' },
            { title: 'PulseAI Assistance', desc: 'AI-guided workflows and natural language operational queries.' },
          ],
        };
    }
  };

  const dutiesInfo = getPortalDuties();

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 border border-orange-500/30 text-orange-500 shadow-md">
            <Clock className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-bold text-slate-950">Registration Submitted</h1>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Thank you, <strong className="text-slate-900">{name.split(' ')[0]}</strong>. Your identity verification and application for the <strong className="text-slate-900">{portal.title}</strong> have been submitted.
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 text-left space-y-1.5">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Identity Verification in Progress
            </p>
            <p>1. Administrator will review your Employee Photo, Aadhar Card, experience, and address.</p>
            <p>2. Upon approval, an official credentials email with the CargoPulse logo will be sent to <strong className="text-slate-900">{email}</strong>.</p>
          </div>
          <Link to={portal.loginPath}>
            <button className="mt-6 w-full rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 text-sm shadow-md transition">
              Back to Sign In
            </button>
          </Link>
        </div>
      </div>
    );
  }

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
                <span className="rounded-full bg-white text-orange-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  {portal.shortLabel}
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">New Operator Registration</p>
            </div>
          </div>
        </div>

        {/* Middle: Purpose & What You Will Do */}
        <div className="relative z-10 my-8 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white mb-3 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              Purpose of Portal Registration
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold leading-tight text-white">
              Join {portal.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-orange-50 leading-relaxed">
              {dutiesInfo.purpose}
            </p>
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-200">
              What You Will Do Once Authorized:
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

        {/* Bottom: Sign In Callout */}
        <div className="relative z-10 pt-4 border-t border-white/20">
          <div className="rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
            <div>
              <p className="text-xs font-bold flex items-center gap-1.5">
                <LogIn className="h-4 w-4 text-amber-200" />
                <span>Already Have an Account?</span>
              </p>
              <p className="text-[11px] text-orange-100 mt-0.5">
                Sign in to your authorized workspace immediately.
              </p>
            </div>
            <Link to={portal.loginPath} className="shrink-0">
              <button className="flex items-center gap-1.5 rounded-xl bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 text-xs font-bold shadow-md transition">
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>

      </div>

      {/* ================= RIGHT HALF: REGISTRATION WITH IDENTITY VERIFICATION ================= */}
      <div className="lg:col-span-6 bg-slate-50 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">Operator Onboarding</span>
            <h2 className="font-serif text-2xl font-bold text-slate-950 mt-1">Create Account & Identity Verification</h2>
            <p className="text-xs text-slate-500 mt-0.5">Please provide your details and identity documents for administrator approval.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Primary Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Full Name" htmlFor="name">
                <div className="relative">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Vikramaditya Rao" className="pl-10 text-xs" />
                </div>
              </FormField>

              <FormField label="Corporate Email Address" htmlFor="email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="vikram@cargopulse.io" className="pl-10 text-xs" />
                </div>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Contact Phone" htmlFor="phone">
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="pl-10 text-xs" />
                </div>
              </FormField>

              <FormField label="Years of Experience" htmlFor="experience">
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    id="experience"
                    value={experienceYears}
                    onChange={e => setExperienceYears(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="0-1 Years (Entry Level)">0–1 Years (Entry Level)</option>
                    <option value="1-3 Years (Associate)">1–3 Years (Associate)</option>
                    <option value="3-5 Years (Mid-Senior)">3–5 Years (Mid-Senior)</option>
                    <option value="5-8 Years (Lead Specialist)">5–8 Years (Lead Specialist)</option>
                    <option value="8+ Years (Operations Director)">8+ Years (Operations Director)</option>
                  </select>
                </div>
              </FormField>
            </div>

            {needsCompany && (
              <FormField label="Organization / Company Name" htmlFor="company">
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="company" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nexus Supply Solutions Pvt Ltd" className="pl-10 text-xs" />
                </div>
              </FormField>
            )}

            {/* Address Input */}
            <FormField label="Residential / Operational Address" htmlFor="address">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <textarea
                  id="address"
                  required
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Plot 14-18, SIPCOT Logistics Park, Sriperumbudur, Tamil Nadu - 602105"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </FormField>

            {/* IDENTITY VERIFICATION UPLOADS: Photo of Employee & Aadhar Card Photo */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Mandatory Identity Verification Documents:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Employee Photo Upload */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-orange-500" />
                      Employee Photo
                    </span>
                    {photoUrl && <span className="text-[10px] text-emerald-600 font-bold">Attached ✓</span>}
                  </div>
                  
                  {photoUrl ? (
                    <div className="relative h-24 w-full rounded-xl overflow-hidden border border-slate-200">
                      <img src={photoUrl} alt="Employee Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-md p-1 text-[10px]"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-orange-500 hover:bg-orange-50/50 cursor-pointer transition p-2 text-center">
                      <Upload className="h-5 w-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-slate-700">Upload Photo</span>
                      <span className="text-[9px] text-slate-400">JPG, PNG (Passport/Profile)</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Aadhar Card Document Upload */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-orange-500" />
                      Aadhar Card Photo
                    </span>
                    {aadharCardUrl && <span className="text-[10px] text-emerald-600 font-bold">Attached ✓</span>}
                  </div>

                  {aadharCardUrl ? (
                    <div className="relative h-24 w-full rounded-xl overflow-hidden border border-slate-200">
                      <img src={aadharCardUrl} alt="Aadhar Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAadharCardUrl('')}
                        className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-md p-1 text-[10px]"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:border-orange-500 hover:bg-orange-50/50 cursor-pointer transition p-2 text-center">
                      <Upload className="h-5 w-5 text-slate-400 mb-1" />
                      <span className="text-[11px] font-bold text-slate-700">Upload Aadhar Card</span>
                      <span className="text-[9px] text-slate-400">Front / Photo ID Proof</span>
                      <input type="file" accept="image/*" onChange={handleAadharUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <FormField label="Password (min. 8 chars)" htmlFor="password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" className="pl-10 text-xs" />
                </div>
              </FormField>

              <FormField label="Confirm Password" htmlFor="confirm-password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input id="confirm-password" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••••••" className="pl-10 text-xs" />
                </div>
              </FormField>
            </div>

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
              className="w-full justify-center bg-orange-500 hover:bg-orange-600 font-bold text-sm shadow-lg shadow-orange-500/20 py-3"
              isLoading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Submit Registration & Documents for Review
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Documents encrypted & verified by Admin
            </span>
            <span className="font-mono text-[10px] text-slate-400">Zero-Trust RBAC</span>
          </div>

        </div>
      </div>

    </div>
  );
};
