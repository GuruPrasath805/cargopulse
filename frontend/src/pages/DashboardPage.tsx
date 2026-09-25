import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Boxes,
  AlertTriangle,
  Truck,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalProducts: 12540,
    totalStock: 9420,
    lowStockCount: 2,
    activeShipments: 87,
    delayedShipments: 12,
    deliveredToday: 54,
    supplyChainRiskScore: 72,
    riskLevel: 'CRITICAL',
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, trendRes, distRes, actRes] = await Promise.all([
          ApiClient.get('/dashboard/stats'),
          ApiClient.get('/dashboard/trend'),
          ApiClient.get('/dashboard/shipment-distribution'),
          ApiClient.get('/dashboard/activities'),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (trendRes.success) setTrendData(trendRes.data);
        if (distRes.success) setPieData(distRes.data);
        if (actRes.success) setActivities(actRes.data);
      } catch (err) {
        console.warn('Using fallback data for dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Command Center
          </h1>
          <p className="text-xs text-slate-500">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name}</span>. Here is the real-time operational health of your supply chain network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/digital-twin"
            className="flex items-center gap-1.5 rounded-lg border border-brand-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100 transition shadow-sm"
          >
            <span>Supply Chain Digital Twin</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="Total SKUs"
          value={stats.totalProducts?.toLocaleString() || '12,540'}
          change="8.2%"
          isPositive={true}
          icon={Package}
          color="brand"
        />
        <MetricCard
          title="Available Stock"
          value={stats.totalStock?.toLocaleString() || '9,420'}
          change="3.4%"
          isPositive={true}
          icon={Boxes}
          color="blue"
        />
        <MetricCard
          title="Low Stock"
          value={stats.lowStockCount || '2'}
          subtext="Requires restock"
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Active Shipments"
          value={stats.activeShipments || '87'}
          change="12%"
          isPositive={true}
          icon={Truck}
          color="amber"
        />
        <MetricCard
          title="Delayed"
          value={stats.delayedShipments || '12'}
          subtext="Weather / Route"
          icon={Clock}
          color="rose"
        />
        <MetricCard
          title="Delivered Today"
          value={stats.deliveredToday || '54'}
          change="18%"
          isPositive={true}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Center Row: Supply Chain Risk Radar + Inventory Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Radar Gauge */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Supply Chain Risk Score
            </span>
            <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              HIGH RISK ⚠️
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center justify-center py-2">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-rose-500/20 bg-rose-500/5">
              <span className="text-3xl font-black text-rose-400">
                {stats.supplyChainRiskScore}
              </span>
              <span className="text-[10px] text-slate-500 absolute bottom-4">/100</span>
            </div>
            <p className="mt-3 text-xs font-medium text-slate-700 text-center">
              Elevated risk detected across 3 logistics nodes
            </p>
          </div>

          <div className="mt-4 space-y-2 text-xs border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center text-slate-700">
              <span>Transit Highway Bottlenecks</span>
              <span className="font-bold text-rose-400">+25 pts</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Safety Stock Deficits (LAP-001)</span>
              <span className="font-bold text-amber-400">+20 pts</span>
            </div>
            <div className="flex justify-between items-center text-slate-700">
              <span>Supplier Delivery Variance</span>
              <span className="font-bold text-blue-400">+15 pts</span>
            </div>
          </div>

          <Link
            to="/intelligence"
            className="mt-4 flex items-center justify-center gap-1.5 w-full rounded-lg border border-slate-300 bg-slate-800/60 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
          >
            <span>View Risk Diagnostics</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* 7-Day Inbound vs Outbound Trend */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-950">7-Day Inventory Velocity</h3>
              <p className="text-xs text-slate-500">Inbound vs Outbound stock movement (units)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-orange-600">
                <span className="h-2 w-2 rounded-full bg-teal-400"></span> Inbound
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span> Outbound
              </span>
            </div>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData.length ? trendData : [
                { day: 'Mon', inbound: 420, outbound: 280 },
                { day: 'Tue', inbound: 310, outbound: 340 },
                { day: 'Wed', inbound: 580, outbound: 410 },
                { day: 'Thu', inbound: 240, outbound: 310 },
                { day: 'Fri', inbound: 690, outbound: 520 },
                { day: 'Sat', inbound: 380, outbound: 460 },
                { day: 'Sun', inbound: 150, outbound: 190 },
              ]}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#14b8a6" fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outbound" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Shipment Breakdown & Real-Time Event Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Shipment Status Donut */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-slate-950">Active Shipment Breakdown</h3>
          <p className="text-xs text-slate-500">Status dispersion across 147 consignments</p>

          <div className="mt-2 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length ? pieData : [
                    { name: 'In Transit', count: 42, color: '#3b82f6' },
                    { name: 'Processing', count: 21, color: '#eab308' },
                    { name: 'Delivered', count: 54, color: '#10b981' },
                    { name: 'Delayed', count: 12, color: '#ef4444' },
                    { name: 'Out for Delivery', count: 18, color: '#8b5cf6' },
                  ]}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(pieData.length ? pieData : [
                    { color: '#3b82f6' },
                    { color: '#eab308' },
                    { color: '#10b981' },
                    { color: '#ef4444' },
                    { color: '#8b5cf6' },
                  ]).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500"></span>In Transit (42)</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span>Delivered (54)</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500"></span>Processing (21)</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500"></span>Delayed (12)</div>
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-950">Live Event Timeline & Activity</h3>
            <span className="text-[11px] text-slate-500">Auto-refreshing</span>
          </div>

          <div className="mt-4 space-y-3">
            {activities.map((act: any) => (
              <div
                key={act.id}
                className="flex items-start justify-between rounded-lg border border-slate-200 bg-white/60 p-3 text-xs hover:border-slate-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded bg-orange-50 border border-orange-200 text-orange-600 font-bold">
                    •
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{act.title}</p>
                    <p className="text-[11px] text-slate-500">{act.timestamp}</p>
                  </div>
                </div>
                <StatusBadge status={act.severity} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
