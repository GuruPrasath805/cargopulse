import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Clock,
  ScrollText,
  Check,
  X,
  Ban,
  RotateCcw,
  LogOut,
  ArrowLeft,
  Search,
  Trash2,
  Mail,
  Send,
  CreditCard,
  Briefcase,
  MapPin,
  Camera,
  Eye,
  FileText,
  AlertCircle,
  Phone,
  Building2,
  UserCheck,
  Warehouse,
  Truck,
  PackageCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import { MetricCard } from '../../components/MetricCard';
import { Badge, statusToTone } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

type Tab = 'overview' | 'approvals' | 'users' | 'audit';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  companyName?: string;
  phone?: string;
  photoUrl?: string;
  aadharCardUrl?: string;
  experienceYears?: number | string;
  address?: string;
  createdAt: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

interface AuditEntry {
  id: string;
  userName?: string;
  action: string;
  entity: string;
  details?: string;
  createdAt: string;
}

const ROLES = ['ADMIN', 'WAREHOUSE_MANAGER', 'LOGISTICS_MANAGER', 'SUPPLIER', 'CUSTOMER'];

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Full Employee Dossier Modal State
  const [selectedUserDossier, setSelectedUserDossier] = useState<AdminUser | null>(null);
  const [previewAadharModalUrl, setPreviewAadharModalUrl] = useState<string | null>(null);

  // Email Directive Modal State
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<AdminUser | null>(null);
  const [directiveSubject, setDirectiveSubject] = useState('');
  const [directiveType, setDirectiveType] = useState<'SOP_UPDATE' | 'URGENT_ALERT' | 'AUDIT_NOTICE' | 'QUALITY_DIRECTIVE' | 'GENERAL_DIRECTIVE'>('SOP_UPDATE');
  const [directivePriority, setDirectivePriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [directiveMessage, setDirectiveMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessNotice, setEmailSuccessNotice] = useState<string | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  const getTemplateForRole = (user: AdminUser, type: string) => {
    switch (user.role) {
      case 'WAREHOUSE_MANAGER':
        if (type === 'URGENT_ALERT') {
          return {
            subject: '[URGENT WAREHOUSE ALERT] Critical Safety Stock Depletion — Immediate Action Required',
            message: `Attention Warehouse Management,\n\nCentral telemetry flags that critical SKU inventories (specifically LAP-001 at WH-BLR) have breached safety thresholds with less than 4 days of inventory remaining.\n\nAction required:\n1. Quarantine and count existing on-hand stock.\n2. Reallocate Zone A bays for incoming emergency bulk replenishment.\n3. Acknowledge this alert via the Warehouse Command Center.`,
          };
        }
        return {
          subject: '[SOP OPERATIONAL DIRECTIVE] Cycle Count & Inbound Verification Standard',
          message: `Hello ${user.name},\n\nPlease ensure all warehouse operating personnel enforce double-entry scan verification for inbound Goods Receipt Notes (GRN).\n\nKey Directives:\n- Inspect pallet seals immediately upon dock arrival.\n- Log discrepancies > 1% in the exception quarantine ledger.\n- Zone A lower bays must remain clear for fast-moving electronic SKUs.\n\nPulseAI is available in your portal to assist with dynamic bin allocation.`,
        };

      case 'LOGISTICS_MANAGER':
        if (type === 'URGENT_ALERT') {
          return {
            subject: '[URGENT FLEET DIRECTIVE] Route Corridor Weather Alert & Mandatory Rerouting',
            message: `Attention Fleet Operations,\n\nSevere weather congestion has been reported along the NH-44 highway corridor. RouteIQ telemetry indicates line-haul transit delays exceeding 45 minutes.\n\nAction required:\n1. Instruct all active drivers on Corridor BLR-CHE to detour via State Highway 17.\n2. Update consignee ETA notices immediately.\n3. Verify driver GPS check-ins every 30 minutes.`,
          };
        }
        return {
          subject: '[OPERATIONAL DIRECTIVE] RouteIQ Dynamic Dispatch & Driver Telematics SOP',
          message: `Hello ${user.name},\n\nThis directive is to reinforce our line-haul dispatch protocol:\n- Pre-dispatch checklist: GPS telematics ping check, tyre PSI verification, and cold-chain data logger pairing.\n- Driver electronic Proof of Delivery (e-POD) must capture OTP and consignee signature upon delivery.\n- Flag any carrier turnaround time > 30 minutes in the exception dashboard.`,
        };

      case 'SUPPLIER':
        return {
          subject: '[SUPPLIER COMPLIANCE NOTICE] Purchase Order Lead Time & ASN Submission SLA',
          message: `Dear ${user.name} (${user.companyName || 'Valued Partner'}),\n\nTo maintain our shared 95% on-time delivery standard, please review the following fulfillment protocols:\n1. Acknowledge and schedule incoming Purchase Orders within 4 business hours.\n2. Generate and transmit the Advanced Shipping Notice (ASN) at least 4 hours prior to vehicle departure.\n3. Attach certified Certificate of Analysis (COA) with each batch pallet.\n\nThank you for your commitment to supply chain excellence.`,
        };

      case 'CUSTOMER':
        return {
          subject: '[CUSTOMER CARE UPDATE] Enhanced Real-Time Tracking & 48-Hour RMA Guarantee',
          message: `Hello ${user.name},\n\nWe have upgraded your consignee portal with real-time GPS tracking and instant RMA claims.\n- Track your shipments minute-by-minute with live vehicle locations.\n- Access signed digital delivery receipts immediately after drop-off.\n- If you experience any shipment discrepancies, submit an RMA claim within 48 hours for immediate replacement.`,
        };

      default:
        return {
          subject: `[CargoPulse Platform Notice] Operational Update for ${user.role}`,
          message: `Hello ${user.name},\n\nPlease review your portal access and ensure all assigned tasks are up to date in the CargoPulse operations console.`,
        };
    }
  };

  const openDirectiveModal = (targetUser: AdminUser) => {
    setSelectedUserForEmail(targetUser);
    setEmailSuccessNotice(null);
    setShowEmailPreview(false);
    const tmpl = getTemplateForRole(targetUser, 'SOP_UPDATE');
    setDirectiveType('SOP_UPDATE');
    setDirectivePriority('NORMAL');
    setDirectiveSubject(tmpl.subject);
    setDirectiveMessage(tmpl.message);
  };

  const handleTemplateChange = (newType: any) => {
    setDirectiveType(newType);
    if (selectedUserForEmail) {
      const tmpl = getTemplateForRole(selectedUserForEmail, newType);
      setDirectiveSubject(tmpl.subject);
      setDirectiveMessage(tmpl.message);
    }
  };

  const handleSendDirective = async () => {
    if (!selectedUserForEmail || !directiveSubject || !directiveMessage) return;
    setIsSendingEmail(true);
    setEmailSuccessNotice(null);

    try {
      const res = await ApiClient.post(`/admin/users/${selectedUserForEmail.id}/send-directive`, {
        subject: directiveSubject,
        directiveType,
        priority: directivePriority,
        message: directiveMessage,
      });

      setEmailSuccessNotice(`Directive email successfully dispatched to ${selectedUserForEmail.name} (${selectedUserForEmail.email}) with embedded CargoPulse logo.`);
      await loadAll();
      setTimeout(() => {
        setSelectedUserForEmail(null);
        setEmailSuccessNotice(null);
      }, 2500);
    } catch (err: any) {
      setActionError(err.message || 'Failed to dispatch email.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, pu, au, al] = await Promise.all([
        ApiClient.get('/admin/overview'),
        ApiClient.get('/admin/users/pending'),
        ApiClient.get('/admin/users'),
        ApiClient.get('/admin/audit-logs'),
      ]);
      setStats(ov.stats);
      setPending(pu.users);
      setAllUsers(au.users);
      setLogs(al.logs);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const runAction = async (fn: () => Promise<any>) => {
    setActionError(null);
    try {
      await fn();
      await loadAll();
    } catch (err: any) {
      setActionError(err.message || 'Action failed.');
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: ShieldCheck },
    { key: 'approvals', label: `Approvals${pending.length ? ` (${pending.length})` : ''}`, icon: Clock },
    { key: 'users', label: 'Users & Roles', icon: Users },
    { key: 'audit', label: 'Audit Log', icon: ScrollText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Admin chrome */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15 border border-purple-500/30">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="font-serif text-sm font-bold leading-none text-slate-950">Admin Console</p>
            <p className="text-[10px] text-slate-500">CargoPulse Platform Administration</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">{user?.name}</span>
          <Button variant="ghost" size="sm" leftIcon={<LogOut className="h-3.5 w-3.5" />} onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  tab === t.key ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:bg-white hover:text-slate-800 border border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {actionError && (
          <div className="mb-4 rounded-xl border border-rose-900/50 bg-rose-950/30 px-4 py-3 text-xs text-rose-300">{actionError}</div>
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-500 text-sm">Loading admin console...</div>
        ) : (
          <>
            {tab === 'overview' && stats && (
              <div className="space-y-6">
                {pending.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent p-5 shadow-lg">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                        <Clock className="h-6 w-6 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-serif text-base font-bold text-slate-950">
                          {pending.length} First-Time User Registration{pending.length > 1 ? 's' : ''} Awaiting Admin Approval
                        </p>
                        <p className="text-xs text-amber-700">
                          Newly registered users across Warehouse, Logistics, Supplier & Customer portals cannot sign in until approved here.
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0"
                      onClick={() => setTab('approvals')}
                    >
                      Review & Approve Now →
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <MetricCard title="Total Users" value={stats.totalUsers} icon={Users} color="brand" />
                  <MetricCard title="Pending Approval" value={stats.pending} icon={Clock} color="amber" subtext="Awaiting review" />
                  <MetricCard title="Approved" value={stats.approved} icon={Check} color="emerald" />
                  <MetricCard title="Suspended / Rejected" value={stats.suspended + stats.rejected} icon={Ban} color="rose" />
                </div>

                {/* ================= MULTI-PORTAL LIVE DATA REVIEW ================= */}
                <Card className="p-6 border border-purple-200/80 bg-gradient-to-br from-white via-purple-50/20 to-white shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-purple-100 text-purple-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Root Admin Privilege</span>
                        <h3 className="font-serif text-base font-bold text-slate-950">Multi-Portal Live Data Review & Inspection</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        As Root Admin, your credentials grant universal access across all 4 operational manager portals. Jump directly into any portal to audit and inspect live data.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Warehouse Review Card */}
                    <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-xs hover:border-orange-400 hover:shadow-md transition flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600 border border-orange-200">
                              <Warehouse className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">Warehouse Operations Portal</h4>
                              <p className="text-[10px] text-slate-400">Inventory, Zones & Inbound GRN</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-orange-100 text-orange-700 font-bold text-[10px] px-2 py-0.5">
                            6 SKUs / 3 Hubs
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Review SKU catalogs, on-hand safety stock (1,876 units), dynamic bin rack allocation across Zones A–D, and inbound Goods Receipt Notes.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">/warehouse/login</span>
                        <Link to="/products">
                          <Button size="sm" variant="primary" className="bg-orange-500 hover:bg-orange-600 text-white font-bold !text-xs !py-1.5" rightIcon={<ExternalLink className="h-3 w-3" />}>
                            Review Warehouse Data
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Logistics Review Card */}
                    <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-600 border border-blue-200">
                              <Truck className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">Logistics & Fleet Portal</h4>
                              <p className="text-[10px] text-slate-400">Line-Haul Fleet & RouteIQ Telematics</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] px-2 py-0.5">
                            4 Shipments / 3 Fleets
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Review line-haul dispatches, vehicle carrier allocations, real-time GPS telemetry, weather detours, and electronic Proof of Delivery (e-POD).
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">/logistics/login</span>
                        <Link to="/shipments">
                          <Button size="sm" variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-bold !text-xs !py-1.5" rightIcon={<ExternalLink className="h-3 w-3" />}>
                            Review Fleet & Logistics
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Supplier Review Card */}
                    <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs hover:border-emerald-400 hover:shadow-md transition flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600 border border-emerald-200">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">Supplier Network Portal</h4>
                              <p className="text-[10px] text-slate-400">Vendor Governance & Procurement POs</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-0.5">
                            3 Active Vendors
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Review enterprise supplier directories, incoming Purchase Orders, vendor SLA compliance rates (Apex 94.2%, BioPharma 98.1%), and ASNs.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">/supplier/login</span>
                        <Link to="/purchase-orders">
                          <Button size="sm" variant="primary" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold !text-xs !py-1.5" rightIcon={<ExternalLink className="h-3 w-3" />}>
                            Review Supplier Data
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Customer Review Card */}
                    <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-xs hover:border-purple-400 hover:shadow-md transition flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-600 border border-purple-200">
                              <PackageCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">Customer & Consignee Portal</h4>
                              <p className="text-[10px] text-slate-400">Consignment Tracking & 48h RMA Claims</p>
                            </div>
                          </div>
                          <span className="rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] px-2 py-0.5">
                            Customer Experience
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Review consignee tracking waypoints, recipient digital signature captures, and reverse logistics return requests (RMA triage: Restock, Repair, Scrap).
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">/customer/login</span>
                        <Link to="/returns">
                          <Button size="sm" variant="primary" className="bg-purple-600 hover:bg-purple-700 text-white font-bold !text-xs !py-1.5" rightIcon={<ExternalLink className="h-3 w-3" />}>
                            Review Customer & Returns
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-5">
                  <h3 className="mb-3 text-sm font-bold text-slate-950">Users by Role</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {ROLES.map(r => (
                      <div key={r} className="rounded-xl border border-slate-200 bg-white/60 p-3 text-center">
                        <p className="text-lg font-bold text-slate-950">{stats.byRole[r] || 0}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{r.replace(/_/g, ' ')}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-5">
                  <h3 className="mb-3 text-sm font-bold text-slate-950">Recent Activity</h3>
                  <div className="space-y-2">
                    {stats.recentAuditEvents.map((log: AuditEntry) => (
                      <div key={log.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                        <span className="text-slate-700">
                          <span className="font-semibold text-slate-950">{log.userName || 'System'}</span> — {log.details || log.action}
                        </span>
                        <span className="text-slate-600 shrink-0 ml-3">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {tab === 'approvals' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-slate-950">First-Time User Registration Approvals</h2>
                    <p className="text-xs text-slate-500">
                      When partners or operators register on any portal, their accounts remain in <span className="text-amber-400 font-semibold">PENDING</span> status until you authorize them.
                    </p>
                  </div>
                  {pending.length > 1 && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                      onClick={() => runAction(async () => {
                        for (const u of pending) {
                          await ApiClient.post(`/admin/users/${u.id}/approve`);
                        }
                      })}
                    >
                      Approve All ({pending.length})
                    </Button>
                  )}
                </div>
                {pending.length === 0 ? (
                  <Card className="p-8 text-center text-sm text-slate-500">No pending registrations. All caught up.</Card>
                ) : (
                  pending.map(u => (
                    <Card key={u.id} className="p-5 border border-slate-200 hover:border-orange-300 transition">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* User Identity Info */}
                        <div className="flex items-start gap-4">
                          {/* Employee Photo Thumbnail */}
                          <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                            {u.photoUrl ? (
                              <img src={u.photoUrl} alt={u.name} className="h-full w-full object-cover" />
                            ) : (
                              <Camera className="h-6 w-6 text-orange-400" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-slate-950 text-sm">{u.name}</h4>
                              <Badge tone="brand">{u.role.replace(/_/g, ' ')}</Badge>
                              {u.experienceYears && (
                                <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" /> {u.experienceYears}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600">
                              <strong>Email:</strong> {u.email} {u.phone ? `• Tel: ${u.phone}` : ''} {u.companyName ? `• ${u.companyName}` : ''}
                            </p>

                            {u.address && (
                              <p className="text-[11px] text-slate-500 flex items-start gap-1 pt-0.5">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{u.address}</span>
                              </p>
                            )}

                            <p className="text-[10px] text-slate-400">
                              Application submitted: {new Date(u.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Aadhar & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          {u.aadharCardUrl && (
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3">
                              <img src={u.aadharCardUrl} alt="Aadhar Card" className="h-10 w-16 object-cover rounded-lg border border-slate-200" />
                              <div className="text-left">
                                <span className="text-[10px] font-bold text-slate-700 block">Aadhar Verified</span>
                                <a
                                  href={u.aadharCardUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-orange-600 font-bold hover:underline"
                                >
                                  View Full Card
                                </a>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="!text-xs font-semibold"
                              leftIcon={<Eye className="h-3.5 w-3.5 text-slate-600" />}
                              onClick={() => setSelectedUserDossier(u)}
                            >
                              View Dossier
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold !text-xs"
                              leftIcon={<Check className="h-3.5 w-3.5" />}
                              onClick={() => runAction(() => ApiClient.post(`/admin/users/${u.id}/approve`))}
                            >
                              Approve & Dispatch Email
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="!text-xs"
                              leftIcon={<X className="h-3.5 w-3.5" />}
                              onClick={() => runAction(() => ApiClient.post(`/admin/users/${u.id}/reject`, { reason: 'Identity verification incomplete' }))}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>

                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {tab === 'users' && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search employee name, email, role, phone..."
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
                    <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-[160px]" accentRing="focus:border-orange-500 focus:ring-orange-500/20">
                      <option value="">All Statuses ({allUsers.length})</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                      <option value="SUSPENDED">Suspended</option>
                    </Select>
                  </div>
                </div>

                {/* Subtitle / Details header */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
                  <span>Showing <strong>{filteredUsers.length}</strong> enterprise employees with complete personal & identity records</span>
                  <span className="hidden sm:inline">All profiles verified with government credentials</span>
                </div>

                {/* Employee Cards List - Each showing ALL Personal Details */}
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <Card className="p-8 text-center text-sm text-slate-500">
                      No employees matched your search query.
                    </Card>
                  ) : (
                    filteredUsers.map(u => (
                      <Card key={u.id} className="p-5 border border-slate-200/90 hover:border-orange-300 hover:shadow-md transition">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                          
                          {/* Left: Avatar & Comprehensive Personal Details */}
                          <div className="flex items-start gap-4 flex-1">
                            {/* Employee Portrait Photo */}
                            <div 
                              className="relative h-16 w-16 rounded-2xl bg-orange-50 border border-orange-200 overflow-hidden shrink-0 shadow-xs cursor-pointer group"
                              onClick={() => setSelectedUserDossier(u)}
                              title="Click to view complete employee dossier"
                            >
                              {u.photoUrl ? (
                                <img src={u.photoUrl} alt={u.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-orange-600 font-bold text-base bg-orange-100">
                                  {u.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className={`absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                                u.status === 'APPROVED' ? 'bg-emerald-500' :
                                u.status === 'PENDING' ? 'bg-amber-500' :
                                'bg-rose-500'
                              }`} />
                            </div>

                            {/* Personal Information Group */}
                            <div className="space-y-1.5 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 
                                  className="font-bold text-slate-950 text-base hover:text-orange-600 transition cursor-pointer"
                                  onClick={() => setSelectedUserDossier(u)}
                                >
                                  {u.name}
                                </h4>
                                <Badge tone={statusToTone(u.status)}>{u.status}</Badge>
                                <span className="rounded-md bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                                  {u.role.replace(/_/g, ' ')}
                                </span>
                                {u.experienceYears && (
                                  <span className="rounded-md bg-amber-50 text-amber-900 border border-amber-200/90 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">
                                    <Briefcase className="h-3 w-3 text-amber-600" /> {u.experienceYears} Years Exp.
                                  </span>
                                )}
                              </div>

                              {/* Contact Details (Email, Phone, Organization) */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                <span className="flex items-center gap-1.5">
                                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <strong className="text-slate-800">Email:</strong> {u.email}
                                </span>
                                {u.phone && (
                                  <span className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <strong className="text-slate-800">Phone:</strong> {u.phone}
                                  </span>
                                )}
                                {u.companyName && (
                                  <span className="flex items-center gap-1.5">
                                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <strong className="text-slate-800">Company:</strong> {u.companyName}
                                  </span>
                                )}
                              </div>

                              {/* Residential / Operational Address */}
                              {u.address && (
                                <p className="text-xs text-slate-600 flex items-start gap-1.5 pt-0.5">
                                  <MapPin className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                                  <span><strong className="text-slate-800">Address:</strong> {u.address}</span>
                                </p>
                              )}

                              {/* Lifecycle History & Governance */}
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                                <span>Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                                {u.approvedByName && (
                                  <span>Authorized by: <strong className="text-slate-600">{u.approvedByName}</strong> ({u.approvedAt ? new Date(u.approvedAt).toLocaleDateString() : 'Active'})</span>
                                )}
                                {u.rejectedReason && (
                                  <span className="text-rose-500">Notice: {u.rejectedReason}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Government Aadhar Card Document & Admin Controls */}
                          <div className="flex flex-wrap items-center lg:items-end justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                            {/* Aadhar Card Preview Thumbnail */}
                            {u.aadharCardUrl && (
                              <div 
                                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3 cursor-pointer hover:border-orange-400 transition"
                                onClick={() => setPreviewAadharModalUrl(u.aadharCardUrl!)}
                                title="Click to inspect full government Aadhar card"
                              >
                                <img src={u.aadharCardUrl} alt="Aadhar Card" className="h-10 w-16 object-cover rounded-lg border border-slate-200 shadow-2xs" />
                                <div className="text-left">
                                  <span className="text-[10px] font-bold text-slate-700 block flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3 text-emerald-600" /> Aadhar Verified
                                  </span>
                                  <span className="text-[10px] text-orange-600 font-bold hover:underline">
                                    Inspect Card
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={<Eye className="h-3 w-3 text-slate-700" />}
                                onClick={() => setSelectedUserDossier(u)}
                                className="!py-1.5 !px-2.5 !text-[11px] font-bold"
                              >
                                View Dossier
                              </Button>

                              <Button
                                size="sm"
                                variant="secondary"
                                leftIcon={<Mail className="h-3 w-3 text-orange-500" />}
                                onClick={() => openDirectiveModal(u)}
                                title="Send Operational Email / Directive"
                                className="!py-1.5 !px-2.5 !text-[11px] font-semibold"
                              >
                                Email Directive
                              </Button>

                              <Select
                                value={u.role}
                                onChange={e => runAction(() => ApiClient.put(`/admin/users/${u.id}/role`, { role: e.target.value }))}
                                className="!py-1 !text-[11px] max-w-[140px]"
                              >
                                {ROLES.map(r => (
                                  <option key={r} value={r}>
                                    {r.replace(/_/g, ' ')}
                                  </option>
                                ))}
                              </Select>

                              {u.status === 'SUSPENDED' ? (
                                <Button size="sm" variant="secondary" leftIcon={<RotateCcw className="h-3 w-3" />} onClick={() => runAction(() => ApiClient.post(`/admin/users/${u.id}/reactivate`))}>
                                  Reactivate
                                </Button>
                              ) : (
                                u.role !== 'ADMIN' && (
                                  <Button size="sm" variant="outline" leftIcon={<Ban className="h-3 w-3" />} onClick={() => runAction(() => ApiClient.post(`/admin/users/${u.id}/suspend`))}>
                                    Suspend
                                  </Button>
                                )
                              )}

                              {u.id !== user?.id && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-rose-400 hover:bg-rose-50"
                                  leftIcon={<Trash2 className="h-3 w-3" />}
                                  onClick={() => {
                                    if (confirm(`Delete account for ${u.name}? This cannot be undone.`)) {
                                      runAction(() => ApiClient.delete(`/admin/users/${u.id}`));
                                    }
                                  }}
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>

                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'audit' && (
              <Card className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white shadow-sm text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">When</th>
                      <th className="px-4 py-3">Actor</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 font-semibold text-slate-950 whitespace-nowrap">{log.userName || 'System'}</td>
                        <td className="px-4 py-3">
                          <Badge tone="neutral">{log.action.replace(/_/g, ' ')}</Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </>
        )}
      </div>

      {/* ================= EMPLOYEE DOSSIER FULL-PROFILE MODAL ================= */}
      {selectedUserDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
            
            {/* Header with Role Banner */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Employee Identity Dossier</h3>
                  <p className="text-xs text-orange-100">Full Personnel Record & Government Verification</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserDossier(null)}
                className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Profile Top Row: Portrait + Identity Details */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-orange-100 border-2 border-orange-400 shrink-0 shadow-md">
                  {selectedUserDossier.photoUrl ? (
                    <img src={selectedUserDossier.photoUrl} alt={selectedUserDossier.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-orange-600 font-bold text-2xl">
                      {selectedUserDossier.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="font-serif text-xl font-bold text-slate-900">{selectedUserDossier.name}</h2>
                    <Badge tone={statusToTone(selectedUserDossier.status)}>{selectedUserDossier.status}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-orange-600">{selectedUserDossier.role.replace(/_/g, ' ')}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <p><strong>Email:</strong> {selectedUserDossier.email}</p>
                    <p><strong>Phone:</strong> {selectedUserDossier.phone || 'Not registered'}</p>
                    <p><strong>Company:</strong> {selectedUserDossier.companyName || 'CargoPulse Operations'}</p>
                    <p><strong>Experience:</strong> {selectedUserDossier.experienceYears ? `${selectedUserDossier.experienceYears} Years Domain Tenure` : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Residential & Operational Address */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-orange-500" /> Residential & Duty Station Address
                </h4>
                <p className="text-xs text-slate-800 pl-5 leading-relaxed font-medium">
                  {selectedUserDossier.address || 'Address not logged during initial registration.'}
                </p>
              </div>

              {/* Government Aadhar Card Verification Document */}
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Government Identity Verification (Aadhar Card)
                  </h4>
                  {selectedUserDossier.aadharCardUrl && (
                    <button
                      type="button"
                      onClick={() => setPreviewAadharModalUrl(selectedUserDossier.aadharCardUrl!)}
                      className="text-xs text-orange-600 font-bold hover:underline"
                    >
                      Enlarge Document
                    </button>
                  )}
                </div>

                {selectedUserDossier.aadharCardUrl ? (
                  <div 
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white max-h-48 flex items-center justify-center cursor-pointer hover:border-orange-400 transition"
                    onClick={() => setPreviewAadharModalUrl(selectedUserDossier.aadharCardUrl!)}
                  >
                    <img
                      src={selectedUserDossier.aadharCardUrl}
                      alt="Aadhar Document"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No government ID document uploaded.</p>
                )}
              </div>

              {/* Security Lifecycle & Audit Metadata */}
              <div className="rounded-xl bg-slate-100 p-3.5 text-[11px] text-slate-500 space-y-1">
                <p><strong>System Account ID:</strong> <span className="font-mono text-slate-700">{selectedUserDossier.id}</span></p>
                <p><strong>Registration Date:</strong> {new Date(selectedUserDossier.createdAt).toLocaleString()}</p>
                {selectedUserDossier.approvedByName && (
                  <p><strong>Authorization Authority:</strong> Approved by <strong className="text-slate-700">{selectedUserDossier.approvedByName}</strong> on {selectedUserDossier.approvedAt ? new Date(selectedUserDossier.approvedAt).toLocaleString() : 'N/A'}</p>
                )}
                {selectedUserDossier.rejectedReason && (
                  <p className="text-rose-600"><strong>Rejection Record:</strong> {selectedUserDossier.rejectedReason}</p>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserDossier(null)}
              >
                Close Dossier
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Mail className="h-3.5 w-3.5 text-orange-500" />}
                  onClick={() => {
                    const u = selectedUserDossier;
                    setSelectedUserDossier(null);
                    openDirectiveModal(u);
                  }}
                  className="font-bold text-xs"
                >
                  Email Directive
                </Button>

                {selectedUserDossier.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    leftIcon={<Check className="h-3.5 w-3.5" />}
                    onClick={() => {
                      const id = selectedUserDossier.id;
                      setSelectedUserDossier(null);
                      runAction(() => ApiClient.post(`/admin/users/${id}/approve`));
                    }}
                  >
                    Approve Application
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= AADHAR CARD LIGHTBOX MODAL ================= */}
      {previewAadharModalUrl && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full rounded-2xl bg-white p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Government Identity Verification Document
              </span>
              <button
                onClick={() => setPreviewAadharModalUrl(null)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center">
              <img
                src={previewAadharModalUrl}
                alt="Government Aadhar Card Preview"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button size="sm" variant="secondary" onClick={() => setPreviewAadharModalUrl(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL DIRECTIVE MODAL */}
      {selectedUserForEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-950 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/40">
                  <img src="/cargopulse-logo.png" alt="CargoPulse" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                    Send Manager Operational Directive
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dispatches branded email with official CargoPulse logo & role protocols to <strong className="text-orange-400">{selectedUserForEmail.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForEmail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {emailSuccessNotice && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{emailSuccessNotice}</span>
                </div>
              )}

              {/* Recipient Details Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Recipient:</span> <strong className="text-slate-900 ml-1">{selectedUserForEmail.name}</strong> ({selectedUserForEmail.email})
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Role:</span>
                  <Badge tone="brand">{selectedUserForEmail.role.replace(/_/g, ' ')}</Badge>
                </div>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Directive Category / Template</label>
                  <Select
                    value={directiveType}
                    onChange={e => handleTemplateChange(e.target.value as any)}
                    className="!py-2 !text-xs"
                  >
                    <option value="SOP_UPDATE">Standard Operating Procedure (SOP)</option>
                    <option value="URGENT_ALERT">Urgent Operational / Safety Alert</option>
                    <option value="AUDIT_NOTICE">Cycle Audit & Compliance Review</option>
                    <option value="QUALITY_DIRECTIVE">Quality Assurance & SLA Standard</option>
                    <option value="GENERAL_DIRECTIVE">Custom Operational Directive</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority Classification</label>
                  <Select
                    value={directivePriority}
                    onChange={e => setDirectivePriority(e.target.value as any)}
                    className="!py-2 !text-xs"
                  >
                    <option value="NORMAL">Standard Notice (Blue Badge)</option>
                    <option value="HIGH">High Priority (Amber Badge)</option>
                    <option value="URGENT">Critical / Urgent (Red Badge)</option>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Subject</label>
                <input
                  type="text"
                  value={directiveSubject}
                  onChange={e => setDirectiveSubject(e.target.value)}
                  placeholder="Subject of the operational email..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Directive Instructions / Body</label>
                  <button
                    type="button"
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>{showEmailPreview ? 'Back to Editor' : 'Preview Branded Email'}</span>
                  </button>
                </div>

                {showEmailPreview ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
                    <div className="rounded-lg bg-white border border-slate-200 p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <img src="/cargopulse-logo.png" alt="Logo" className="h-8 w-8 object-contain" />
                          <span className="font-serif font-bold text-slate-900 text-sm">Cargo<span className="text-orange-500">Pulse</span></span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          directivePriority === 'URGENT' ? 'bg-red-100 text-red-700 border border-red-200' :
                          directivePriority === 'HIGH' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {directivePriority} PRIORITY
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs">{directiveSubject}</h4>
                      <div className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 p-3 rounded border border-slate-100 font-sans">
                        {directiveMessage}
                      </div>
                      <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                        CargoPulse Enterprise Administration &bull; Automated Operations Dispatch
                      </div>
                    </div>
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    value={directiveMessage}
                    onChange={e => setDirectiveMessage(e.target.value)}
                    placeholder="Write detailed instructions, SOP checklist, or operational directives..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-mono"
                  />
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForEmail(null)}
                disabled={isSendingEmail}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
                leftIcon={<Send className="h-3.5 w-3.5" />}
                onClick={handleSendDirective}
                disabled={isSendingEmail || !directiveSubject || !directiveMessage}
              >
                {isSendingEmail ? 'Dispatching Directive...' : 'Send Directive Email Now'}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
