import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { Shipment, Warehouse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Truck,
  Plus,
  Navigation,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ShipmentsPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    originWarehouseId: '',
    destWarehouseId: '',
    destinationAddress: '',
    productId: 'prd-001',
    quantity: '25',
  });

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const [shRes, whRes] = await Promise.all([
        ApiClient.get('/shipments'),
        ApiClient.get('/warehouses'),
      ]);

      if (shRes.success) setShipments(shRes.data);
      if (whRes.success) {
        setWarehouses(whRes.data);
        if (whRes.data.length > 0) {
          setForm(f => ({
            ...f,
            originWarehouseId: whRes.data[0].id,
            destWarehouseId: whRes.data[1]?.id || '',
            destinationAddress: whRes.data[1]?.address || 'Enterprise Client Delivery Site',
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        originWarehouseId: form.originWarehouseId,
        destWarehouseId: form.destWarehouseId,
        destinationAddress: form.destinationAddress,
        items: [{ productId: form.productId, quantity: Number(form.quantity) }],
      };

      const res = await ApiClient.post('/shipments', payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchShipments();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating shipment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Freight Shipments & Logistics</h1>
          <p className="text-xs text-slate-500">
            Active highway consignments with carrier fleet assignment, delay probability, and telemetry monitoring.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-orange-500 transition shadow-lg shadow-brand-600/20"
        >
          <Plus className="h-4 w-4" /> Create Shipment
        </button>
      </div>

      {/* Shipment Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shipments.map(s => (
          <div
            key={s.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl backdrop-blur-sm hover:border-slate-300 transition"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-950">{s.trackingNumber}</span>
                    <p className="text-[10px] text-slate-500">{s.carrierName}</p>
                  </div>
                </div>
                <StatusBadge status={s.status} size="sm" />
              </div>

              {/* Origin -> Destination Route */}
              <div className="mt-5 space-y-2 border-l-2 border-slate-200 pl-3 ml-2 text-xs">
                <div className="relative">
                  <span className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-teal-400 ring-4 ring-slate-900" />
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Origin Hub</p>
                  <p className="font-semibold text-slate-800">{s.originCity} ({s.originName})</p>
                </div>
                <div className="relative pt-2">
                  <span className="absolute -left-[19px] top-3 h-2.5 w-2.5 rounded-full bg-blue-400 ring-4 ring-slate-900" />
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Destination</p>
                  <p className="font-semibold text-slate-800">{s.destCity || 'Direct Delivery'}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-xs">{s.destinationAddress}</p>
                </div>
              </div>

              {/* Fleet assignment */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-white/60 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-mono font-bold text-slate-800">{s.vehiclePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="text-slate-800">{s.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current GPS Fix:</span>
                  <span className="font-semibold text-orange-600 truncate max-w-[150px]">{s.currentLocation}</span>
                </div>
              </div>

              {/* Delay Warning Alert if flagged */}
              {s.isDelayed && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-900/40 bg-rose-950/30 p-2.5 text-xs text-rose-300">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span className="text-[11px] leading-tight">{s.delayReason || 'Delay risk alert on route'}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[10px] text-slate-500">
                <span>ETA: </span>
                <span className="font-bold text-slate-800">
                  {new Date(s.estimatedDelivery).toLocaleDateString()}
                </span>
              </div>
              <Link
                to={`/tracking?id=${s.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-500 hover:text-white transition whitespace-nowrap shadow-xs"
              >
                <Navigation className="h-3 w-3" /> Live GPS
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Shipment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Dispatch New Highway Consignment">
        <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Origin Fulfillment Facility *</label>
              <select
                value={form.originWarehouseId}
                onChange={e => setForm({ ...form, originWarehouseId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Destination Facility</label>
              <select
                value={form.destWarehouseId}
                onChange={e => {
                  const target = warehouses.find(w => w.id === e.target.value);
                  setForm({
                    ...form,
                    destWarehouseId: e.target.value,
                    destinationAddress: target ? target.address : form.destinationAddress,
                  });
                }}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Direct Client Address (Non-WH)</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Destination Address *</label>
            <input
              type="text"
              required
              value={form.destinationAddress}
              onChange={e => setForm({ ...form, destinationAddress: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cargo SKU</label>
              <select
                value={form.productId}
                onChange={e => setForm({ ...form, productId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                <option value="prd-001">LAP-001 — Dell Latitude 5540</option>
                <option value="prd-002">MON-1023 — Samsung ViewFinity 34</option>
                <option value="prd-003">MED-COLD-88 — BioPharma Insulin</option>
                <option value="prd-004">AUTO-BRK-40 — Brake Rotor Kit</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Pallet Unit Quantity *</label>
              <input
                type="number"
                required
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
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
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
