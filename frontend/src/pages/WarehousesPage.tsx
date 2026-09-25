import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { Warehouse } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Warehouse as WarehouseIcon,
  Layers,
  Boxes,
  MapPin,
  Maximize2,
  TrendingUp,
  FolderTree,
} from 'lucide-react';

export const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('wh-chn-01');
  const [selectedWarehouseDetails, setSelectedWarehouseDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const res = await ApiClient.get('/warehouses');
        if (res.success) {
          setWarehouses(res.data);
          if (res.data.length > 0) {
            setSelectedWarehouseId(res.data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedWarehouseId) return;
      try {
        const res = await ApiClient.get(`/warehouses/${selectedWarehouseId}`);
        if (res.success) {
          setSelectedWarehouseDetails(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDetails();
  }, [selectedWarehouseId]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Warehouse & Spatial Bin Management</h1>
        <p className="text-xs text-slate-500">
          Multi-tier spatial hierarchy mapping: Warehouses ➔ Zones ➔ Aisles ➔ Racks ➔ Bins with capacity telemetry.
        </p>
      </div>

      {/* Warehouse Selector Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {warehouses.map(wh => {
          const isSelected = selectedWarehouseId === wh.id;
          return (
            <div
              key={wh.id}
              onClick={() => setSelectedWarehouseId(wh.id)}
              className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 ${
                isSelected
                  ? 'border-brand-500 bg-white shadow-lg shadow-brand-500/10 ring-1 ring-brand-500'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
                  <WarehouseIcon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-orange-600 border border-brand-500/30 rounded px-2 py-0.5 bg-orange-500/10">
                  {wh.code}
                </span>
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-950 leading-snug">{wh.name}</h3>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3 text-slate-500" /> {wh.city}, {wh.state}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Spatial Footprint</span>
                  <span className="font-semibold text-slate-950">{wh.capacitySqFt?.toLocaleString()} sq.ft</span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Volumetric Utilization</span>
                    <span className="font-bold text-orange-600">{wh.utilizationPct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${wh.utilizationPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Warehouse Hierarchical Zone & Rack Layout */}
      {selectedWarehouseDetails && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 shadow-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-950">{selectedWarehouseDetails.name}</h2>
                <span className="rounded bg-teal-950 px-2 py-0.5 text-[11px] font-bold text-orange-600 border border-teal-800">
                  Active Facility
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{selectedWarehouseDetails.address}</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-700">
                Total Stocked Units: <span className="font-mono text-orange-600 font-bold">{selectedWarehouseDetails.totalUnits}</span>
              </span>
            </div>
          </div>

          {/* Zones Container */}
          <div className="mt-6 space-y-6">
            {selectedWarehouseDetails.zones?.map((zone: any) => (
              <div key={zone.id} className="rounded-xl border border-slate-200 bg-white/60 p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-mono font-bold text-slate-900">
                      {zone.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-950">{zone.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {zone.racks?.length} Structural Racks
                  </span>
                </div>

                {/* Racks in this zone */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {zone.racks?.map((rack: any) => (
                    <div key={rack.id} className="rounded-lg border border-slate-200 bg-white shadow-sm p-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs font-mono font-bold text-orange-600">
                          {rack.code}
                        </span>
                        <span className="text-[11px] text-slate-500">{rack.bins?.length} Storage Bins</span>
                      </div>

                      {/* Bins Grid */}
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {rack.bins?.map((bin: any) => (
                          <div
                            key={bin.id}
                            className={`rounded-lg border p-2.5 text-xs transition ${
                              bin.occupied
                                ? 'border-teal-500/40 bg-teal-950/30'
                                : 'border-slate-200 bg-white/40 text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-slate-800">
                                {bin.code}
                              </span>
                              <span className={`h-1.5 w-1.5 rounded-full ${bin.occupied ? 'bg-teal-400' : 'bg-slate-600'}`} />
                            </div>

                            {bin.occupied && bin.items?.length > 0 ? (
                              <div className="mt-2 space-y-1">
                                <p className="font-mono text-[11px] font-bold text-teal-300 truncate">
                                  {bin.items[0].sku}
                                </p>
                                <p className="text-[10px] text-slate-700">
                                  Qty: <span className="font-bold text-slate-950">{bin.totalQty}</span> units
                                </p>
                              </div>
                            ) : (
                              <p className="mt-2 text-[10px] text-slate-500 italic">Empty Bin</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
