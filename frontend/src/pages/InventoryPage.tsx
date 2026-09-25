import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { InventoryItem, InventoryTransaction, Product, Warehouse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Boxes,
  ArrowRightLeft,
  PlusCircle,
  MinusCircle,
  FileSpreadsheet,
  Search,
  Filter,
  Layers,
  History,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'LEDGER'>('STOCK');
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalType, setModalType] = useState<'IN' | 'OUT' | 'TRANSFER' | null>(null);

  // Form states
  const [formIn, setFormIn] = useState({
    productId: '',
    warehouseId: '',
    quantity: '50',
    batchNumber: '',
    reason: 'Routine inbound delivery',
  });

  const [formTransfer, setFormTransfer] = useState({
    productId: '',
    sourceWarehouseId: '',
    targetWarehouseId: '',
    quantity: '20',
    reason: 'Inventory rebalance',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, txRes, prodRes, whRes] = await Promise.all([
        ApiClient.get('/inventory'),
        ApiClient.get('/inventory/transactions'),
        ApiClient.get('/products'),
        ApiClient.get('/warehouses'),
      ]);

      if (invRes.success) setInventoryList(invRes.data);
      if (txRes.success) setTransactions(txRes.data);
      if (prodRes.success) {
        setProducts(prodRes.data);
        if (prodRes.data.length > 0) {
          setFormIn(prev => ({ ...prev, productId: prodRes.data[0].id }));
          setFormTransfer(prev => ({ ...prev, productId: prodRes.data[0].id }));
        }
      }
      if (whRes.success) {
        setWarehouses(whRes.data);
        if (whRes.data.length > 0) {
          setFormIn(prev => ({ ...prev, warehouseId: whRes.data[0].id }));
          setFormTransfer(prev => ({
            ...prev,
            sourceWarehouseId: whRes.data[0]?.id,
            targetWarehouseId: whRes.data[1]?.id || whRes.data[0]?.id,
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
    fetchData();
  }, []);

  const handleStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post('/inventory/stock-in', formIn);
      if (res.success) {
        setModalType(null);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error executing stock in');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post('/inventory/transfer', formTransfer);
      if (res.success) {
        setModalType(null);
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Error executing stock transfer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            Inventory & Stock Operations
          </h1>
          <p className="text-xs text-slate-500">
            Real-time stock across warehouse bins with double-entry immutable audit transaction journaling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalType('IN')}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-orange-600 transition shadow-md shadow-orange-500/20 rounded-xl"
          >
            <PlusCircle className="h-4 w-4" /> Stock In
          </button>
          <button
            onClick={() => setModalType('TRANSFER')}
            className="flex items-center gap-1.5 rounded-lg border-2 border-slate-900 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition rounded-xl"
          >
            <ArrowRightLeft className="h-4 w-4" /> Inter-Warehouse Transfer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('STOCK')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'STOCK'
              ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="h-4 w-4" /> Live Warehouse Stock ({inventoryList.length})
        </button>
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${
            activeTab === 'LEDGER'
              ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="h-4 w-4" /> Immutable Audit Ledger ({transactions.length})
        </button>
      </div>

      {/* Tab 1: Live Stock Table */}
      {activeTab === 'STOCK' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Product SKU</th>
                  <th className="px-6 py-3.5">Warehouse Location</th>
                  <th className="px-6 py-3.5">Bin Coordinates</th>
                  <th className="px-6 py-3.5">Batch / Lot #</th>
                  <th className="px-6 py-3.5">Current Qty</th>
                  <th className="px-6 py-3.5">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryList.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-mono font-bold text-slate-950">{item.sku}</span>
                        <p className="text-slate-600">{item.productName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {item.warehouseName}
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-orange-600">
                      {item.locationPath}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {item.batchNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold text-sm ${item.isLowStock ? 'text-rose-400' : 'text-slate-900'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.isLowStock ? 'CRITICAL' : 'OPTIMAL'} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Immutable Transaction Ledger */}
      {activeTab === 'LEDGER' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Transaction #</th>
                  <th className="px-6 py-3.5">SKU & Item</th>
                  <th className="px-6 py-3.5">Movement Type</th>
                  <th className="px-6 py-3.5">Qty Change</th>
                  <th className="px-6 py-3.5">Stock Delta (Prev ➔ New)</th>
                  <th className="px-6 py-3.5">Reason / Reference</th>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-orange-600 text-[11px]">
                      {tx.transactionNo}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-slate-950">{tx.sku}</span>
                      <p className="text-[11px] text-slate-500">{tx.productName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tx.type} size="sm" />
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-950">
                      {tx.type === 'STOCK_OUT' ? `-${tx.quantity}` : `+${tx.quantity}`}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-500">
                      {tx.previousStock} ➔ <span className="font-bold text-slate-950">{tx.newStock}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-[11px] max-w-xs truncate">
                      {tx.reason} <span className="text-slate-500 font-mono">({tx.referenceDoc})</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{tx.userName}</td>
                    <td className="px-6 py-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      <Modal isOpen={modalType === 'IN'} onClose={() => setModalType(null)} title="Stock In Inbound Consignment">
        <form onSubmit={handleStockIn} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Product SKU *</label>
            <select
              value={formIn.productId}
              onChange={e => setFormIn({ ...formIn, productId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Destination Warehouse *</label>
              <select
                value={formIn.warehouseId}
                onChange={e => setFormIn({ ...formIn, warehouseId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Quantity Received *</label>
              <input
                type="number"
                required
                value={formIn.quantity}
                onChange={e => setFormIn({ ...formIn, quantity: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Batch / Inbound Lot Number</label>
            <input
              type="text"
              placeholder="e.g. BATCH-2026-INB-09"
              value={formIn.batchNumber}
              onChange={e => setFormIn({ ...formIn, batchNumber: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Audit Justification / Note</label>
            <input
              type="text"
              value={formIn.reason}
              onChange={e => setFormIn({ ...formIn, reason: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-5 py-2 font-bold text-slate-950 hover:bg-orange-600 shadow-md shadow-teal-600/30"
            >
              Confirm Stock In
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Transfer Modal */}
      <Modal isOpen={modalType === 'TRANSFER'} onClose={() => setModalType(null)} title="Inter-Warehouse Stock Rebalancing">
        <form onSubmit={handleTransfer} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Product SKU to Transfer *</label>
            <select
              value={formTransfer.productId}
              onChange={e => setFormTransfer({ ...formTransfer, productId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Source Warehouse (Deduct) *</label>
              <select
                value={formTransfer.sourceWarehouseId}
                onChange={e => setFormTransfer({ ...formTransfer, sourceWarehouseId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Warehouse (Receive) *</label>
              <select
                value={formTransfer.targetWarehouseId}
                onChange={e => setFormTransfer({ ...formTransfer, targetWarehouseId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Quantity *</label>
            <input
              type="number"
              required
              value={formTransfer.quantity}
              onChange={e => setFormTransfer({ ...formTransfer, quantity: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 rounded-lg focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-5 py-2 font-bold text-slate-950 hover:bg-orange-500 shadow-md shadow-brand-600/30"
            >
              Execute Stock Transfer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
