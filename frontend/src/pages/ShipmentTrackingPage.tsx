import React from 'react';
import { useSimulation } from '../context/SimulationContext';
import { StatusBadge } from '../components/StatusBadge';
import {
  Navigation,
  Truck,
  Gauge,
  Thermometer,
  Clock,
  Radio,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';

export const ShipmentTrackingPage: React.FC = () => {
  const { telemetry, isLivePulseActive, pingCount } = useSimulation();

  const milestones = [
    { key: 'CONFIRMED', label: 'Consignment Confirmed', time: '06:00 AM', loc: 'Chennai Mega Hub', done: true },
    { key: 'PACKED', label: 'RFID Tagged & Shrink Wrapped', time: '07:15 AM', loc: 'Packing Bay 3', done: true },
    { key: 'DISPATCHED', label: 'Dispatched via BharatBenz Hauler', time: '08:30 AM', loc: 'Sriperumbudur Toll', done: true },
    { key: 'IN_TRANSIT', label: 'In Transit on NH-44 Corridor', time: telemetry.timestamp, loc: telemetry.location, done: true, current: true },
    { key: 'OUT_FOR_DELIVERY', label: 'Arrival at Bangalore Tech Gateway', time: 'Estimated 18:00', loc: 'Devanahalli Logistics Hub', done: false },
    { key: 'DELIVERED', label: 'Recipient POD & Dock Acceptance', time: 'Pending', loc: 'Bangalore Bay 1', done: false },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Live Highway Telematics & GPS Tracking</h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Active Transponder
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tracking Consignment <span className="font-mono font-bold text-slate-950">SH-10234</span> (Chennai Central Mega Hub ➔ Bangalore Tech Gateway).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            Telemetry Ping #{pingCount}
          </span>
        </div>
      </div>

      {/* Real-time Telemetry Sensor Gauges */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Vehicle Speed</span>
            <Gauge className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-950 font-mono">{telemetry.speed} <span className="text-xs font-normal text-slate-500">km/h</span></p>
          <span className="text-[10px] text-slate-500">Live CAN-bus link</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Cargo Bay Temp</span>
            <Thermometer className="h-4 w-4 text-orange-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-teal-300 font-mono">{telemetry.temperature}°C</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Regulated within 21°C</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>GPS Fix</span>
            <Navigation className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-xs font-mono font-bold text-slate-950 truncate">{telemetry.lat}°N, {telemetry.lng}°E</p>
          <span className="text-[10px] text-slate-500 truncate block">{telemetry.location}</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Route Risk Radar</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-400 font-mono">68 <span className="text-xs text-slate-500">/100</span></p>
          <span className="text-[10px] text-rose-300 font-medium">Monsoon congestion</span>
        </div>
      </div>

      {/* Main Grid: Interactive Route Corridor Visualizer + Milestone Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Route Corridor Visualizer */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 backdrop-blur-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Interstate Route Corridor (NH-44 Arterial)</h3>
              <p className="text-xs text-slate-500">Total Distance: 348 km | Distance Covered: ~210 km</p>
            </div>
            <StatusBadge status="IN_TRANSIT" />
          </div>

          {/* Graphical Route Visualization */}
          <div className="my-8 rounded-xl border border-slate-200 bg-white p-6">
            <div className="relative flex flex-col items-center justify-between gap-8 sm:flex-row">
              {/* Origin Node */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20 text-orange-600 border border-teal-500/40 shadow-lg shadow-teal-500/10">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-950">CHENNAI</span>
                <span className="text-[10px] text-slate-500">Origin Hub (08:30)</span>
              </div>

              {/* Progress Line */}
              <div className="relative flex-1 w-full sm:w-auto h-2 sm:h-2 rounded-full bg-slate-100 border border-slate-200 mx-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 via-brand-500 to-amber-500 transition-all duration-700"
                  style={{ width: '65%' }}
                />
              </div>

              {/* Live Moving Truck Node */}
              <div className="flex flex-col items-center text-center -mt-2">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500 ring-4 ring-amber-500/20 shadow-xl shadow-amber-500/20 animate-pulse">
                  <Truck className="h-7 w-7" />
                </div>
                <span className="mt-2 text-xs font-bold text-amber-300">
                  {telemetry.location.split(' ')[0]}
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  {telemetry.speed} km/h (Live)
                </span>
              </div>

              {/* Progress Line 2 */}
              <div className="relative flex-1 w-full sm:w-auto h-2 sm:h-2 rounded-full bg-slate-100 border border-slate-200 mx-4 overflow-hidden">
                <div className="h-full bg-slate-200" style={{ width: '0%' }} />
              </div>

              {/* Destination Node */}
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 border border-slate-200">
                  <MapPin className="h-6 w-6" />
                </div>
                <span className="mt-2 text-xs font-bold text-slate-700">BANGALORE</span>
                <span className="text-[10px] text-slate-500">ETA 18:00 (Today)</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Consignment Specs */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-white/60 p-4 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Transport Fleet</span>
              <p className="font-mono font-bold text-slate-950 mt-0.5">TN-01-AB-1234</p>
              <p className="text-[11px] text-slate-500">BharatBenz 2823R Hauler</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Assigned Driver</span>
              <p className="font-bold text-slate-950 mt-0.5">R. Arun Kumar</p>
              <p className="text-[11px] text-slate-500">+91 94441 23098</p>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold">Consignment Payload</span>
              <p className="font-bold text-slate-950 mt-0.5">25 Units Dell Latitude</p>
              <p className="text-[11px] text-slate-500">+ 4 Units Siemens PLCs</p>
            </div>
          </div>
        </div>

        {/* Milestone Progression Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-slate-950 border-b border-slate-200 pb-3">
            Milestone Progression Log
          </h3>

          <div className="mt-5 space-y-6">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative flex gap-3 text-xs">
                {/* Vertical connecting line */}
                {idx < milestones.length - 1 && (
                  <div
                    className={`absolute left-2.5 top-6 h-full w-0.5 ${
                      m.done ? 'bg-orange-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Milestone Dot */}
                <div
                  className={`relative z-10 flex h-5 w-5 items-center justify-center rounded-full ${
                    m.current
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 animate-pulse'
                      : m.done
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-bold ${m.current ? 'text-amber-300' : m.done ? 'text-slate-900' : 'text-slate-500'}`}>
                      {m.label}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500">{m.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{m.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
