import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  BrainCircuit,
  AlertTriangle,
  TrendingDown,
  Clock,
  Building2,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export const IntelligencePage: React.FC = () => {
  const [riskData, setRiskData] = useState<any>(null);
  const [stockouts, setStockouts] = useState<any[]>([]);
  const [delays, setDelays] = useState<any[]>([]);
  const [supplierRisk, setSupplierRisk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        setLoading(true);
        const [riskRes, stockRes, delayRes, supRes] = await Promise.all([
          ApiClient.get('/intelligence/risk-summary'),
          ApiClient.get('/intelligence/stockouts'),
          ApiClient.get('/intelligence/shipment-delays'),
          ApiClient.get('/intelligence/suppliers'),
        ]);

        if (riskRes.success) setRiskData(riskRes.data);
        if (stockRes.success) setStockouts(stockRes.data);
        if (delayRes.success) setDelays(delayRes.data);
        if (supRes.success) setSupplierRisk(supRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchIntelligence();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">CargoPulse AI & Risk Radar</h1>
          <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Predictive Decision Engine
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Mathematical stockout projections, highway delay probability, and multi-factor supply chain risk evaluation.
        </p>
      </div>

      {/* Top Row: Global Risk Score Matrix */}
      {riskData && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Composite Risk Assessment
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-4xl font-black text-rose-400 font-mono">
                  {riskData.overallRiskScore}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
                <span className="rounded bg-rose-950 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-800">
                  {riskData.riskTier}
                </span>
              </div>
            </div>

            <div className="max-w-md">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Priority AI Remediation Plan:
              </span>
              <ul className="mt-1 space-y-1 text-xs text-slate-700 list-disc list-inside">
                {riskData.recommendations?.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {riskData.breakdown?.map((b: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white/60 p-4 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="truncate pr-2 font-medium">{b.factor}</span>
                  <StatusBadge status={b.severity} size="sm" />
                </div>
                <p className="mt-2 text-xl font-bold text-slate-950 font-mono">+{b.impact} pts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Second Row: Predictive Stockout Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-rose-400" />
              Predictive Stockout Forecasts
            </h2>
            <p className="text-xs text-slate-500">
              Formula: <span className="font-mono text-orange-600">Days Remaining = Available Stock / Daily Burn Rate</span>
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">SKU & Item</th>
                  <th className="px-6 py-3.5">Current Stock</th>
                  <th className="px-6 py-3.5">Daily Consumption</th>
                  <th className="px-6 py-3.5">Projected Stockout Days</th>
                  <th className="px-6 py-3.5">Estimated Stockout Date</th>
                  <th className="px-6 py-3.5">Risk Tier</th>
                  <th className="px-6 py-3.5 text-right">Recommended Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockouts.map(item => (
                  <tr key={item.productId} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-950">{item.sku}</span>
                      <p className="text-[11px] text-slate-500">{item.name}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-950">
                      {item.currentStock} units
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      ~{item.dailyBurnRate} units/day
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-base font-black ${
                        item.daysRemaining <= 4 ? 'text-rose-400' : item.daysRemaining <= 10 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        ~{item.daysRemaining} days
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-700">
                      {item.projectedStockoutDate}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.riskLevel} size="sm" />
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-teal-300">
                      +{item.suggestedReorderQuantity} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Third Row: Shipment Delay Risk Probability */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shipment Delay Risk */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 mb-1">
            <Clock className="h-5 w-5 text-amber-400" />
            Consignment Delay Probability
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Live evaluation based on highway checkpoint speed, weather radar, and carrier historical variance.
          </p>

          <div className="space-y-3">
            {delays.map(s => (
              <div
                key={s.shipmentId}
                className="rounded-xl border border-slate-200 bg-white/60 p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-950">{s.trackingNumber}</span>
                  <span className="font-mono font-black text-sm text-rose-400">
                    Delay Probability: {s.delayProbability}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Carrier: {s.carrierName}</span>
                  <span>Location: {s.currentLocation}</span>
                </div>
                <p className="text-[11px] text-amber-300/90 font-medium">
                  Flag: {s.delayReason}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Lead-Time Volatility Risk */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm">
          <h2 className="text-base font-bold text-slate-950 flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-blue-400" />
            Supplier Delivery Reliability Matrix
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Continuous evaluation of vendor defect rates and dispatch punctuality.
          </p>

          <div className="space-y-3">
            {supplierRisk.map(sup => (
              <div
                key={sup.id}
                className="rounded-xl border border-slate-200 bg-white/60 p-4 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-950">{sup.name}</span>
                  <StatusBadge status={sup.riskLevel} size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <span>On-Time Rate: <strong className="text-white">{sup.onTimeRate}%</strong></span>
                  <span>Quality Pass: <strong className="text-white">{sup.qualityRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
