import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Boxes,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30D');

  const monthlyThroughput = [
    { month: 'Jan', received: 4500, dispatched: 4100 },
    { month: 'Feb', received: 5200, dispatched: 4900 },
    { month: 'Mar', received: 6100, dispatched: 5800 },
    { month: 'Apr', received: 5800, dispatched: 5600 },
    { month: 'May', received: 7200, dispatched: 6900 },
    { month: 'Jun', received: 8100, dispatched: 7800 },
    { month: 'Jul', received: 7900, dispatched: 7600 },
    { month: 'Aug', received: 8900, dispatched: 8400 },
  ];

  const exportCSV = () => {
    const headers = 'Month,Received Units,Dispatched Units\n';
    const rows = monthlyThroughput.map(r => `${r.month},${r.received},${r.dispatched}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CargoPulse_Logistics_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Analytics & Executive Reporting</h1>
          <p className="text-xs text-slate-500">
            High-level supply chain throughput, seasonal inventory velocity, and CSV export engine.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-orange-600 transition shadow-lg shadow-teal-600/20"
        >
          <Download className="h-4 w-4" /> Export CSV Report
        </button>
      </div>

      {/* Main Throughput Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-950">Monthly Supply Chain Throughput</h2>
            <p className="text-xs text-slate-500">Received vs Dispatched Freight Units</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-orange-600">
              <span className="h-2 w-2 rounded-full bg-teal-400" /> Received (Inbound)
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-400" /> Dispatched (Outbound)
            </span>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyThroughput}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="received" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="dispatched" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 text-xs space-y-2">
          <span className="text-slate-500 uppercase font-bold text-[10px]">On-Time Order Fulfillment</span>
          <p className="text-3xl font-black text-emerald-400 font-mono">96.4%</p>
          <p className="text-slate-500 text-[11px]">+2.1% improvement over prior quarter SLA.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 text-xs space-y-2">
          <span className="text-slate-500 uppercase font-bold text-[10px]">Inventory Turnover Ratio</span>
          <p className="text-3xl font-black text-orange-600 font-mono">8.2x</p>
          <p className="text-slate-500 text-[11px]">Rapid replenishment cycle for electronics & spares.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 text-xs space-y-2">
          <span className="text-slate-500 uppercase font-bold text-[10px]">Reverse Logistics Rate</span>
          <p className="text-3xl font-black text-blue-400 font-mono">1.4%</p>
          <p className="text-slate-500 text-[11px]">Industry benchmark is 3.5%; 60% below average.</p>
        </div>
      </div>
    </div>
  );
};
