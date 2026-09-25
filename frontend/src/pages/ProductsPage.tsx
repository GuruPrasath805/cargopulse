import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { Product } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  QrCode,
  Tag,
  ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    categoryId: '',
    price: '',
    minStock: '20',
    maxStock: '200',
    dailyDemand: '5',
    unit: 'units',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get(`/products?category=${selectedCategory}&search=${search}&lowStock=${onlyLowStock}`);
      if (res.success) setProducts(res.data);
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await ApiClient.get('/products/categories');
        if (res.success) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, categoryId: res.data[0].id }));
          }
        }
      } catch (e) {}
    };
    fetchCats();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, search, onlyLowStock]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await ApiClient.post('/products', formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          sku: '',
          name: '',
          description: '',
          categoryId: categories[0]?.id || '',
          price: '',
          minStock: '20',
          maxStock: '200',
          dailyDemand: '5',
          unit: 'units',
        });
        fetchProducts();
      }
    } catch (err: any) {
      alert(err.message || 'Error creating product');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Product & SKU Catalog</h1>
          <p className="text-xs text-slate-500">
            Centrally catalogued enterprise items with automated minimum safety buffers and burn-rate tracking.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-orange-500 transition shadow-lg shadow-brand-600/20"
        >
          <Plus className="h-4 w-4" /> Add New SKU
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white/70 p-4 backdrop-blur-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by SKU or product title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              onlyLowStock
                ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Low Stock Critical Only</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3.5">SKU & Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Current Stock</th>
                <th className="px-6 py-3.5">Burn Rate</th>
                <th className="px-6 py-3.5">Stockout Risk</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-orange-600 font-mono text-xs">
                        <Tag className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-mono font-bold text-slate-950 text-xs">{p.sku}</span>
                        <p className="text-slate-700 font-medium">{p.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{p.category}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-950">
                    ₹{p.price?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold text-sm ${p.isLowStock ? 'text-rose-400' : 'text-slate-800'}`}>
                        {p.currentStock}
                      </span>
                      <span className="text-[10px] text-slate-500">/ min {p.minStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    ~{p.dailyDemand || 4.5} {p.unit}/day
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.isLowStock ? 'CRITICAL' : 'OPTIMAL'} size="sm" />
                      <span className="text-[11px] text-slate-500 font-mono">
                        (~{p.daysRemaining} days left)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/traceability?sku=${p.sku}`}
                      className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600 hover:bg-orange-500 hover:text-white transition whitespace-nowrap shadow-xs"
                    >
                      Trace Journey
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add SKU Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Enterprise Product SKU">
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">SKU Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. SENS-IOT-09"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Category *</label>
              <select
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Product Title / Spec *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bosch High-Precision IMU Sensor Board"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="4500"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Min Safety Stock</label>
              <input
                type="number"
                value={formData.minStock}
                onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Daily Demand</label>
              <input
                type="number"
                step="0.1"
                value={formData.dailyDemand}
                onChange={e => setFormData({ ...formData, dailyDemand: e.target.value })}
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
              Save Product SKU
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
