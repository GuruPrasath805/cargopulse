import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { ReturnRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  RotateCcw,
  CheckCircle,
  Wrench,
  RefreshCw,
  Trash2,
  FileText,
  User,
  AlertCircle,
} from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  const [decision, setDecision] = useState<'RESTOCK' | 'REPAIR' | 'REPLACE' | 'SCRAP'>('RESTOCK');
  const [inspectionNotes, setInspectionNotes] = useState('');

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/returns');
      if (res.success) setReturns(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleExecuteDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      const res = await ApiClient.put(`/returns/${selectedReturn.id}/decision`, {
        decision,
        inspectionNotes,
      });

      if (res.success) {
        setSelectedReturn(null);
        fetchReturns();
      }
    } catch (err: any) {
      alert(err.message || 'Error processing return inspection');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Reverse Logistics & RMA Triage</h1>
        <p className="text-xs text-slate-500">
          Reverse pipeline triage with 4-way disposition workflow: Restock, Repair, Replace, or Scrap.
        </p>
      </div>

      {/* Return Requests Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {returns.map(ret => (
          <div
            key={ret.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-orange-600">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-950">{ret.returnNo}</span>
                    <p className="text-[10px] text-slate-500">Hub: {ret.warehouseName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={ret.status} size="sm" />
                  {ret.decision !== 'PENDING' && <StatusBadge status={ret.decision} size="sm" />}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-950">{ret.customerName}</span>
                  <span className="text-slate-500 font-mono">({ret.customerEmail})</span>
                </div>
                <p className="text-slate-500 bg-white/60 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Customer Reason:</span> {ret.reason}
                </p>
              </div>

              {/* Items in Return */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white/40 p-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-500">Claimed Return Items</span>
                <div className="mt-1 space-y-1">
                  {ret.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span>{it.productName} ({it.sku})</span>
                      <span className="font-mono font-bold text-slate-950">Qty: {it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspection notes if already decided */}
              {ret.inspectionNotes && (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                  <span className="font-bold text-orange-600">QA Inspection Result: </span>
                  {ret.inspectionNotes}
                </div>
              )}
            </div>

            {/* Triage Action Button */}
            {ret.decision === 'PENDING' ? (
              <div className="mt-6 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setSelectedReturn(ret);
                    setDecision('RESTOCK');
                    setInspectionNotes('Physical QA inspection passed. Protective packaging verified.');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-orange-500 transition shadow-md shadow-brand-600/30"
                >
                  <Wrench className="h-4 w-4" /> Perform QA & Execute Disposition
                </button>
              </div>
            ) : (
              <div className="mt-6 pt-3 border-t border-slate-200 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" /> Disposition Completed & Finalized
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Triage & Disposition Modal */}
      <Modal isOpen={!!selectedReturn} onClose={() => setSelectedReturn(null)} title="Execute RMA Inspection & Disposition">
        <form onSubmit={handleExecuteDecision} className="space-y-5 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-2">Select Disposition Decision *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setDecision('RESTOCK')}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 font-semibold transition ${
                  decision === 'RESTOCK'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300 ring-2 ring-emerald-500/40'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                <span>Restock to WH</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REPAIR')}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 font-semibold transition ${
                  decision === 'REPAIR'
                    ? 'border-blue-500 bg-blue-950/60 text-blue-300 ring-2 ring-blue-500/40'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Wrench className="h-5 w-5" />
                <span>Internal Repair</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REPLACE')}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 font-semibold transition ${
                  decision === 'REPLACE'
                    ? 'border-amber-500 bg-amber-950/60 text-amber-300 ring-2 ring-amber-500/40'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="h-5 w-5" />
                <span>Send Replacement</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('SCRAP')}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 font-semibold transition ${
                  decision === 'SCRAP'
                    ? 'border-rose-500 bg-rose-950/60 text-rose-300 ring-2 ring-rose-500/40'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Trash2 className="h-5 w-5" />
                <span>Scrap & Write-Off</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">QA Inspection Audit Report</label>
            <textarea
              rows={3}
              required
              value={inspectionNotes}
              onChange={e => setInspectionNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedReturn(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-5 py-2 font-bold text-slate-950 hover:bg-orange-600 shadow-md shadow-teal-600/30"
            >
              Commit Disposition Decision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
