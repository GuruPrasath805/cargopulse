import React, { useState } from 'react';
import {
  Network,
  Building2,
  Warehouse,
  Truck,
  Building,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

interface NetworkNode {
  id: string;
  name: string;
  type: 'SUPPLIER' | 'WAREHOUSE' | 'TRANSIT' | 'CUSTOMER';
  location: string;
  capacity?: string;
  utilization?: number;
  activeOrders?: number;
  delayed?: number;
  health: 'OPTIMAL' | 'MODERATE' | 'CRITICAL';
  description: string;
  coordinates: { x: number; y: number };
}

export const DigitalTwinPage: React.FC = () => {
  const [nodes, setNodes] = useState<NetworkNode[]>([
    {
      id: 'node-sup-1',
      name: 'Apex Micro Devices Ltd',
      type: 'SUPPLIER',
      location: 'Bangalore Electronic City',
      health: 'OPTIMAL',
      activeOrders: 4,
      delayed: 0,
      description: 'Primary supplier for Enterprise Laptops and Modular PLCs. On-time delivery rate 94.2%.',
      coordinates: { x: 10, y: 20 },
    },
    {
      id: 'node-sup-2',
      name: 'BioPharma Global Ltd',
      type: 'SUPPLIER',
      location: 'Pune Biotech SEZ',
      health: 'OPTIMAL',
      activeOrders: 2,
      delayed: 0,
      description: 'Cold chain pharmaceuticals supplier. Calibrated continuous thermal sensors deployed.',
      coordinates: { x: 10, y: 55 },
    },
    {
      id: 'node-sup-3',
      name: 'Precision Auto Dynamics',
      type: 'SUPPLIER',
      location: 'Chennai Oragadam',
      health: 'MODERATE',
      activeOrders: 5,
      delayed: 1,
      description: 'Ceramic composite brake rotors & high-torque EV servos. Dips in lead-time consistency noted.',
      coordinates: { x: 10, y: 85 },
    },
    {
      id: 'node-wh-chn',
      name: 'Chennai Central Mega Fulfillment Hub',
      type: 'WAREHOUSE',
      location: 'Chennai Sriperumbudur (WH-CHN)',
      capacity: '185,000 sq.ft',
      utilization: 78,
      activeOrders: 87,
      delayed: 4,
      health: 'OPTIMAL',
      description: 'Central Tier-1 consolidation hub with 3 automated zones (A, B, C) and high-value vault.',
      coordinates: { x: 40, y: 40 },
    },
    {
      id: 'node-transit-nh44',
      name: 'NH-44 Freight Corridor (Krishnagiri)',
      type: 'TRANSIT',
      location: 'Highway In-Transit (TN-KA)',
      health: 'CRITICAL',
      activeOrders: 14,
      delayed: 3,
      description: 'Active bottleneck on Bangalore-Chennai freight arterial due to intense monsoon waterlogging.',
      coordinates: { x: 65, y: 30 },
    },
    {
      id: 'node-wh-blr',
      name: 'Bangalore Tech Distribution Gateway',
      type: 'WAREHOUSE',
      location: 'Bangalore Devanahalli (WH-BLR)',
      capacity: '140,000 sq.ft',
      utilization: 62,
      activeOrders: 42,
      delayed: 2,
      health: 'MODERATE',
      description: 'Rapid cross-docking facility with dedicated 2-8°C cold storage quarantine bay.',
      coordinates: { x: 75, y: 70 },
    },
    {
      id: 'node-cust-1',
      name: 'NovaTech Systems HQ',
      type: 'CUSTOMER',
      location: 'Bangalore Tech Park',
      health: 'OPTIMAL',
      activeOrders: 8,
      delayed: 0,
      description: 'Tier-1 enterprise computing client. Last-mile courier currently dispatched.',
      coordinates: { x: 95, y: 35 },
    },
    {
      id: 'node-cust-2',
      name: 'MediLife Hospital Network',
      type: 'CUSTOMER',
      location: 'Bangalore Central Medical Hub',
      health: 'OPTIMAL',
      activeOrders: 12,
      delayed: 0,
      description: 'Direct institutional healthcare recipient for insulin cold-chain consignments.',
      coordinates: { x: 95, y: 75 },
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<NetworkNode>(nodes[3]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Supply Chain Digital Twin</h1>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-600 border border-brand-500/30">
              Interactive Topology
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Live topological twin of multi-echelon nodes, active freight corridors, and delivery bottlenecks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span> Network Synchronized
          </span>
        </div>
      </div>

      {/* Main Grid: Visual Graph Canvas + Node Inspector Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Visual Graph Canvas */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl lg:col-span-2 min-h-[500px] flex flex-col justify-between">
          {/* Subtle Grid Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(#14b8a6 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none">
            {/* Suppliers to Chennai Hub */}
            <line x1="12%" y1="20%" x2="42%" y2="40%" stroke="#334155" strokeWidth="2" strokeDasharray="4" />
            <line x1="12%" y1="55%" x2="42%" y2="40%" stroke="#334155" strokeWidth="2" strokeDasharray="4" />
            <line x1="12%" y1="85%" x2="42%" y2="40%" stroke="#334155" strokeWidth="2" strokeDasharray="4" />

            {/* Chennai Hub to Transit NH-44 */}
            <line x1="42%" y1="40%" x2="65%" y2="30%" stroke="#14b8a6" strokeWidth="3" />

            {/* Chennai Hub to Bangalore Hub */}
            <line x1="42%" y1="40%" x2="75%" y2="70%" stroke="#334155" strokeWidth="2" />

            {/* Transit NH-44 to Bangalore Hub */}
            <line x1="65%" y1="30%" x2="75%" y2="70%" stroke="#ef4444" strokeWidth="3" strokeDasharray="6" />

            {/* Bangalore Hub to Customers */}
            <line x1="75%" y1="70%" x2="93%" y2="35%" stroke="#10b981" strokeWidth="2" />
            <line x1="75%" y1="70%" x2="93%" y2="75%" stroke="#10b981" strokeWidth="2" />
          </svg>

          {/* Nodes placed on canvas */}
          <div className="relative z-10 grid h-full w-full">
            {nodes.map(node => {
              const isSelected = selectedNode.id === node.id;
              const nodeIcons = {
                SUPPLIER: Building2,
                WAREHOUSE: Warehouse,
                TRANSIT: Truck,
                CUSTOMER: Building,
              };
              const Icon = nodeIcons[node.type];

              const healthColors = {
                OPTIMAL: 'border-emerald-500/50 text-emerald-400 bg-white',
                MODERATE: 'border-amber-500/50 text-amber-400 bg-white',
                CRITICAL: 'border-rose-500/80 text-rose-400 bg-rose-950/40 animate-pulse-glow',
              };

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: 'absolute',
                    left: `${node.coordinates.x}%`,
                    top: `${node.coordinates.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`group cursor-pointer rounded-xl border p-3 shadow-xl transition-all duration-200 hover:scale-105 ${
                    isSelected ? 'ring-2 ring-brand-400 scale-110 shadow-brand-500/20' : ''
                  } ${healthColors[node.health]}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-orange-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[11px] font-bold leading-tight text-slate-900">{node.name}</p>
                      <p className="text-[9px] text-slate-500">{node.type}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Canvas Bottom Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between border-t border-slate-200 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400"></span> Optimal Flow</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400"></span> Moderate Load</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400 animate-pulse"></span> Critical Delay</span>
            </div>
            <span className="text-[11px] text-slate-500">Click any node to inspect telemetry</span>
          </div>
        </div>

        {/* Node Deep Inspection Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Node Telemetry
              </span>
              <h2 className="text-lg font-bold text-slate-950">{selectedNode.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedNode.location}</p>
            </div>
            <StatusBadge status={selectedNode.health} />
          </div>

          <p className="mt-4 text-xs text-slate-700 leading-relaxed">
            {selectedNode.description}
          </p>

          <div className="mt-6 space-y-4">
            {selectedNode.capacity && (
              <div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Warehouse Capacity</span>
                  <span className="text-slate-900 font-bold">{selectedNode.capacity}</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                  <div
                    className="h-full rounded-full bg-orange-500 transition-all duration-500"
                    style={{ width: `${selectedNode.utilization}%` }}
                  />
                </div>
                <span className="mt-1 block text-right text-[10px] text-slate-500">
                  {selectedNode.utilization}% utilized
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Active Consignments</span>
                <p className="mt-1 text-xl font-black text-slate-950">{selectedNode.activeOrders}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white/60 p-3">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Delayed Shipments</span>
                <p className={`mt-1 text-xl font-black ${selectedNode.delayed ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedNode.delayed}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/40 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-950">Recommended Remediation:</span>
              <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                <li>Dynamic freight diversion to Bypass State Highway 49.</li>
                <li>Pre-alert regional receivers at Bangalore Tech Gateway.</li>
                <li>Buffer safety stock re-evaluation for next 48 hours.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
