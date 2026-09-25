import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { PurchaseOrder, Supplier, Warehouse, Product } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  ClipboardList,
  Plus,
  PackageCheck,
  CheckCircle,
  Truck,
  Building2,
  Calendar,
  IndianRupee,
  Layers,
} from 'lucide-react';

export const PurchaseOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New PO state
  const [form, setForm] = useState({
    supplierId: '',
    warehouseId: '',
    productId: '',
    quantity: '100',
    unitPrice: '89500',
    expectedDate: '',
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [poRes, supRes, whRes, prodRes] = await Promise.all([
        ApiClient.get('/purchase-orders'),
        ApiClient.get('/suppliers'),
        ApiClient.get('/warehouses'),
        ApiClient.get('/products'),
      ]);

      if (poRes.success) setOrders(poRes.data);
      if (supRes.success) {
        setSuppliers(supRes.data);
        if (supRes.data.length > 0) setForm(f => ({ ...f, supplierId: supRes.data[0].id }));
      }
      if (whRes.success) {
        setWarehouses(whRes.data);
        if (whRes.data.length > 0) setForm(f => ({ ...f, warehouseId: whRes.data[0].id }));
      }
      if (prodRes.success) {
        setProducts(prodRes.data);
        if (prodRes.data.length > 0) setForm(f => ({ ...f, productId: prodRes.data[0].id, unitPrice: String(prodRes.data[0].price) }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await ApiClient.put(`/purchase-orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update PO status');
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        supplierId: form.supplierId,
        warehouseId: form.warehouseId,
        expectedDate: form.expectedDate,
        items: [
          {
            productId: form.productId,
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
          },
        ],
      };

      const res = await ApiClient.post('/purchase-orders', payload);
      if (res.success) {
        setIsModalOpen(false);
        fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating purchase order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Purchase Orders & Sourcing</h1>
          <p className="text-xs text-slate-500">
            End-to-end procurement pipeline with automatic inventory stocking upon dock receiving.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-orange-500 transition shadow-lg shadow-brand-600/20"
        >
          <Plus className="h-4 w-4" /> Raise Purchase Order
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">PO Number</th>
                <th className="px-6 py-3.5">Supplier Partner</th>
                <th className="px-6 py-3.5">Destination Hub</th>
                <th className="px-6 py-3.5">Total Value</th>
                <th className="px-6 py-3.5">Expected Delivery</th>
                <th className="px-6 py-3.5">PO Status</th>
                <th className="px-6 py-3.5 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(po => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-50 border border-orange-200 text-orange-600">
                        <ClipboardList className="h-4 w-4" />
                      </div>
                      <span className="font-mono font-bold text-slate-950 text-xs">{po.orderNo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {po.supplierName}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 rounded-md">
                      {po.warehouseCode}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{po.warehouseName}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-950">
                    ₹{po.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(po.expectedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={po.status} size="sm" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {po.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(po.id, 'APPROVED')}
                          className="rounded bg-blue-900/60 border border-blue-700/60 px-2.5 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-800 transition"
                        >
                          Approve PO
                        </button>
                      )}
                      {po.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(po.id, 'DISPATCHED')}
                          className="rounded bg-amber-900/60 border border-amber-700/60 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-800 transition"
                        >
                          Mark Dispatched
                        </button>
                      )}
                      {po.status === 'DISPATCHED' && (
                        <button
                          onClick={() => handleUpdateStatus(po.id, 'RECEIVED')}
                          className="flex items-center gap-1 rounded bg-orange-500 px-3 py-1 text-[11px] font-bold text-slate-950 hover:bg-orange-600 shadow-md transition"
                        >
                          <PackageCheck className="h-3.5 w-3.5" />
                          Receive & Auto-Stock
                        </button>
                      )}
                      {po.status === 'RECEIVED' && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5" /> Stocked in WH
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raise PO Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Raise Formal Purchase Order">
        <form onSubmit={handleCreatePO} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Select Supplier *</label>
              <select
                value={form.supplierId}
                onChange={e => setForm({ ...form, supplierId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Destination Warehouse *</label>
              <select
                value={form.warehouseId}
                onChange={e => setForm({ ...form, warehouseId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Product SKU *</label>
            <select
              value={form.productId}
              onChange={e => {
                const prod = products.find(p => p.id === e.target.value);
                setForm({
                  ...form,
                  productId: e.target.value,
                  unitPrice: prod ? String(prod.price) : form.unitPrice,
                });
              }}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Quantity *</label>
              <input
                type="number"
                required
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Unit Price (₹)</label>
              <input
                type="number"
                value={form.unitPrice}
                onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Expected Date</label>
              <input
                type="date"
                value={form.expectedDate}
                onChange={e => setForm({ ...form, expectedDate: e.target.value })}
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
              Issue Purchase Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
