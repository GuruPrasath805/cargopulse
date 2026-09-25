import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { Vehicle, Driver } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Car,
  Truck,
  UserCheck,
  Award,
  Shield,
  Phone,
  Gauge,
  Layers,
} from 'lucide-react';

export const FleetPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        setLoading(true);
        const [vRes, dRes] = await Promise.all([
          ApiClient.get('/fleet/vehicles'),
          ApiClient.get('/fleet/drivers'),
        ]);

        if (vRes.success) setVehicles(vRes.data);
        if (dRes.success) setDrivers(dRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFleet();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Transportation & Fleet Operations</h1>
        <p className="text-xs text-slate-500">
          Dedicated carriers, freight vehicle capacity utilization, and driver compliance registries.
        </p>
      </div>

      {/* Vehicles Grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Active Fleet Haulers & Freight Vehicles
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {vehicles.map(v => (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-200 text-orange-600">
                  <Truck className="h-5 w-5" />
                </div>
                <StatusBadge status={v.status} size="sm" />
              </div>

              <div className="mt-4">
                <span className="font-mono text-sm font-bold text-slate-950 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-slate-800">
                  {v.plateNumber}
                </span>
                <h3 className="mt-2 text-sm font-bold text-slate-950">{v.model}</h3>
                <p className="text-xs text-slate-500">{v.type} • {v.carrierName}</p>
              </div>

              {/* Load Capacity Bar */}
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs space-y-2">
                <div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Capacity Load:</span>
                    <span className="font-bold text-slate-950 font-mono">
                      {v.currentLoadTons} / {v.capacityTons} Tons ({v.loadPct}%)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${v.loadPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-slate-500">Assigned Pilot:</span>
                  <span className="font-semibold text-slate-800">{v.driverName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drivers Registry */}
      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
          Certified Commercial Drivers & Pilots
        </h2>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase text-[10px] font-bold tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Driver Name</th>
                  <th className="px-6 py-3.5">Commercial License #</th>
                  <th className="px-6 py-3.5">Mobile Contact</th>
                  <th className="px-6 py-3.5">Assigned Vehicle</th>
                  <th className="px-6 py-3.5">Safety Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-bold text-slate-950">{d.name}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{d.licenseNo}</td>
                    <td className="px-6 py-4 text-slate-700">{d.phone}</td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-300">{d.vehiclePlate}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-amber-400">★ {d.rating} / 5.0</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
