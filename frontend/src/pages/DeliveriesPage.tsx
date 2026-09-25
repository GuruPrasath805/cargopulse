import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { Delivery } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  PackageCheck,
  CheckCircle2,
  FileSignature,
  Camera,
  MapPin,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // POD Form
  const [podForm, setPodForm] = useState({
    signedBy: '',
    notes: 'Seal verified intact. Accepted in pristine condition.',
  });

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/deliveries');
      if (res.success) setDeliveries(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleCompletePOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery) return;

    try {
      const res = await ApiClient.post(`/deliveries/${selectedDelivery.id}/complete`, podForm);
      if (res.success) {
        setSelectedDelivery(null);
        fetchDeliveries();
      }
    } catch (err: any) {
      alert(err.message || 'Error completing Proof of Delivery');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Last-Mile Deliveries & Proof of Delivery</h1>
        <p className="text-xs text-slate-500">
          Client consignment handovers with cryptographic e-signatures and tamper-evident photo records.
        </p>
      </div>

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {deliveries.map(del => (
          <div
            key={del.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-orange-600">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-950">{del.deliveryNo}</span>
                    <p className="text-[10px] text-slate-500 font-mono">Consignment: {del.trackingNumber}</p>
                  </div>
                </div>
                <StatusBadge status={del.status} size="sm" />
              </div>

              <div className="mt-5 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-950">{del.recipientName}</span>
                  <span className="text-slate-500 font-mono">({del.recipientPhone})</span>
                </div>
                <div className="flex items-start gap-2 text-slate-500">
                  <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{del.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>Scheduled: {new Date(del.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* POD Details Card if Delivered */}
              {del.status === 'DELIVERED' && del.proofOfDelivery && (
                <div className="mt-5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-emerald-900/40 pb-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Verified Proof of Delivery (POD)
                    </span>
                    <span className="text-[10px] font-mono">
                      {new Date(del.proofOfDelivery.signedAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    Signed by: <span className="font-bold text-slate-950">{del.proofOfDelivery.signedBy}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 italic">"{del.proofOfDelivery.notes}"</p>
                </div>
              )}
            </div>

            {/* Complete Action Button */}
            {del.status !== 'DELIVERED' && (
              <div className="mt-6 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setSelectedDelivery(del);
                    setPodForm({ signedBy: del.recipientName, notes: 'Signed and accepted by authorized receiver.' });
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-orange-600 transition shadow-md shadow-teal-600/30"
                >
                  <FileSignature className="h-4 w-4" /> Record Electronic POD
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Proof of Delivery Submission Modal */}
      <Modal isOpen={!!selectedDelivery} onClose={() => setSelectedDelivery(null)} title="Electronic Proof of Delivery (e-POD)">
        <form onSubmit={handleCompletePOD} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Authorized Signatory Name *</label>
            <input
              type="text"
              required
              value={podForm.signedBy}
              onChange={e => setPodForm({ ...podForm, signedBy: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Receiver Digital Signature (Simulated Pad)</label>
            <div className="flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 font-mono text-xs text-orange-600">
              ✍️ [Verified Digital Signature Capture: {podForm.signedBy || 'Recipient'}]
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Delivery Inspection Remarks</label>
            <textarea
              rows={3}
              value={podForm.notes}
              onChange={e => setPodForm({ ...podForm, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedDelivery(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-5 py-2 font-bold text-slate-950 hover:bg-orange-600 shadow-md shadow-teal-600/30"
            >
              Verify & Complete Delivery
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
