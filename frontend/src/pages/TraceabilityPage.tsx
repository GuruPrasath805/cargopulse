import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiClient } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import {
  GitCommit,
  Search,
  Building2,
  Warehouse,
  Truck,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDown,
  ShieldCheck,
} from 'lucide-react';

export const TraceabilityPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSku = searchParams.get('sku') || 'LAP-001';

  const [identifier, setIdentifier] = useState(initialSku);
  const [traceData, setTraceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrace = async (term: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await ApiClient.get(`/traceability/${term}`);
      if (res.success) {
        setTraceData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'No product traceability history found.');
      setTraceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrace(initialSku);
  }, [initialSku]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim()) {
      fetchTrace(identifier.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Product Journey & Full Traceability</h1>
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-600 border border-brand-500/30">
            Immutable Audit Trail
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Trace any SKU, lot batch, or serial number through suppliers, POs, bin allocations, shipments, and customer delivery.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Enter SKU (e.g. LAP-001, MON-1023, MED-COLD-88)..."
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white shadow-sm py-2.5 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-lg"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-slate-950 hover:bg-orange-500 transition shadow-lg shadow-brand-600/30"
        >
          Audit Trace
        </button>
      </form>

      {/* Quick Example Pills */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Quick Samples:</span>
        {['LAP-001', 'MON-1023', 'MED-COLD-88', 'AUTO-BRK-40', 'SRV-PLC-09'].map(s => (
          <button
            key={s}
            onClick={() => {
              setIdentifier(s);
              fetchTrace(s);
            }}
            className="rounded-lg border border-slate-200 bg-white shadow-sm px-2.5 py-1 text-[11px] font-mono text-slate-700 hover:border-brand-500/50 hover:text-orange-600 transition"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Traceability Timeline Container */}
      {traceData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Product Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm space-y-4">
            <div className="border-b border-slate-200 pb-4">
              <span className="font-mono text-xs font-bold text-orange-600 bg-orange-500/10 px-2.5 py-1 rounded border border-brand-500/20">
                {traceData.product.sku}
              </span>
              <h3 className="mt-3 text-lg font-bold text-slate-950 leading-snug">{traceData.product.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{traceData.product.description}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Supplier:</span>
                <span className="font-semibold text-slate-950">{traceData.supplier?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Catalog Value:</span>
                <span className="font-mono font-bold text-slate-950">₹{traceData.product.price?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Demand:</span>
                <span className="text-slate-700">{traceData.product.dailyDemand} units/day</span>
              </div>
            </div>

            {/* Warehouse Stock Dispersion */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Live Stock Allocations
              </span>
              <div className="mt-2 space-y-2">
                {traceData.currentStockLocations?.map((loc: any, i: number) => (
                  <div key={i} className="flex justify-between items-center rounded-lg bg-white/60 p-2.5 text-xs border border-slate-200">
                    <div>
                      <p className="font-semibold text-slate-800">{loc.warehouse}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Lot: {loc.batchNumber}</p>
                    </div>
                    <span className="font-mono font-black text-sm text-orange-600">{loc.quantity} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Chronological 6-Stage Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-950 border-b border-slate-200 pb-3">
              Chronological Product Lifecycle & Custody Trail
            </h3>

            <div className="mt-6 space-y-6">
              {traceData.journeyTimeline?.map((step: any, idx: number) => (
                <div key={idx} className="relative flex gap-4 text-xs">
                  {/* Vertical connecting line */}
                  {idx < traceData.journeyTimeline.length - 1 && (
                    <div className="absolute left-3 top-7 h-full w-0.5 bg-gradient-to-b from-teal-500 to-slate-800" />
                  )}

                  {/* Icon step node */}
                  <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/30">
                    {idx + 1}
                  </div>

                  {/* Stage card */}
                  <div className="flex-1 rounded-xl border border-slate-200 bg-white/70 p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                        {step.stage}
                      </span>
                      <StatusBadge status={step.status} size="sm" />
                    </div>

                    <h4 className="text-sm font-bold text-slate-950">{step.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <span>Location: <strong className="text-slate-700 font-normal">{step.location}</strong></span>
                      <span className="font-mono font-semibold text-slate-500">Ref: {step.reference}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
