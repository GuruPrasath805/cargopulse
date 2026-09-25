import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { Supplier } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Award,
  Plus,
  Star,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bangalore',
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/suppliers');
      if (res.success) setSuppliers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post('/suppliers', formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          code: '',
          name: '',
          contactName: '',
          email: '',
          phone: '',
          address: '',
          city: 'Bangalore',
        });
        fetchSuppliers();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating supplier');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Supplier Ecosystem & Scorecards</h1>
          <p className="text-xs text-slate-500">
            Automated SLA evaluation measuring on-time logistics, quality verification, and contract fulfillment.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-orange-500 transition shadow-lg shadow-brand-600/20"
        >
          <Plus className="h-4 w-4" /> Onboard Supplier
        </button>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {suppliers.map(sup => (
          <div
            key={sup.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-orange-600 border border-slate-300">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                    {sup.code}
                  </span>
                  <div className="mt-1 flex items-center justify-end gap-1 text-xs text-amber-400 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400" /> {sup.rating}
                  </div>
                </div>
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-950">{sup.name}</h3>
              <p className="text-xs text-slate-500">{sup.contactName}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-500" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  <span>{sup.city}, {sup.country}</span>
                </div>
              </div>

              {/* Performance Scorecard Container */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-white/70 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    SLA Composite Score
                  </span>
                  <span className="font-mono text-sm font-black text-emerald-400">
                    {sup.overallScore}%
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">On-Time Delivery</span>
                      <span className="font-semibold text-slate-950">{sup.onTimeDeliveryRate}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${sup.onTimeDeliveryRate}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Quality QA Pass Rate</span>
                      <span className="font-semibold text-slate-950">{sup.qualityRate}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-teal-500" style={{ width: `${sup.qualityRate}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Fulfillment Consistency</span>
                      <span className="font-semibold text-slate-950">{sup.fulfillmentRate}%</span>
                    </div>
                    <div className="mt-1 h-1 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${sup.fulfillmentRate}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Risk Assessment</span>
              <StatusBadge status={sup.riskLevel || 'LOW'} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Supplier Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Supplier Partner">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Vendor Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SUP-QUANTUM"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Company Entity Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Quantum Sensors Ltd"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Primary City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-5 py-2 font-bold text-slate-950 hover:bg-orange-500 shadow-md shadow-brand-600/30"
            >
              Register Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
