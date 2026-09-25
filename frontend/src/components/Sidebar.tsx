import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PORTALS, getPortalByRole } from '../config/portals';
import { getAccent } from '../config/accentStyles';
import {
  LayoutDashboard,
  Network,
  Package,
  Boxes,
  Warehouse,
  Building2,
  ClipboardList,
  Truck,
  Navigation,
  Car,
  PackageCheck,
  RotateCcw,
  GitCommit,
  BrainCircuit,
  BarChart3,
  Bell,
  ShieldCheck,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/dashboard': LayoutDashboard,
  '/digital-twin': Network,
  '/products': Package,
  '/inventory': Boxes,
  '/warehouses': Warehouse,
  '/suppliers': Building2,
  '/purchase-orders': ClipboardList,
  '/shipments': Truck,
  '/tracking': Navigation,
  '/fleet': Car,
  '/deliveries': PackageCheck,
  '/returns': RotateCcw,
  '/traceability': GitCommit,
  '/intelligence': BrainCircuit,
  '/ai-assistant': BrainCircuit,
  '/analytics': BarChart3,
  '/notifications': Bell,
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';
  const portal = getPortalByRole(user.role);
  const accent = getAccent(portal.accent);

  const moduleItems = isAdmin
    ? Array.from(new Map(PORTALS.flatMap(p => p.modules).map(m => [m.path, m])).values())
    : portal.modules;

  const intelligenceItems = [
    { path: '/ai-assistant', label: 'AI Assistant & Risk', icon: BrainCircuit, badge: 'AI' },
    { path: '/intelligence', label: 'Risk Radar', icon: BrainCircuit },
    { path: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { path: '/notifications', label: 'Alerts & Events', icon: Bell },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 select-none shadow-sm">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 px-2 pb-5 border-b border-slate-100">
        <img src="/cargopulse-logo.png" alt="CargoPulse Logo" className="h-11 w-11 object-contain rounded-xl" />
        <div>
          <div className="flex items-center gap-1">
            <span className="text-base font-extrabold tracking-tight text-slate-950 font-serif">Cargo</span>
            <span className="text-base font-extrabold tracking-tight text-orange-500 font-serif">Pulse</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{portal.title}</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-6">
        {isAdmin && (
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Administration</span>
            <div className="mt-1 space-y-0.5">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`
                }
              >
                <ShieldCheck className="h-4 w-4 text-purple-600" />
                <span>Admin Console</span>
              </NavLink>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {portal.shortLabel} Modules
          </span>
          <div className="mt-1 space-y-0.5">
            {moduleItems.map(item => {
              const Icon = ICONS[item.path] || LayoutDashboard;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>

        {isAdmin && (
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Intelligence</span>
            <div className="mt-1 space-y-0.5">
              {intelligenceItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-600 border border-orange-200">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer / System Status */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-[11px] border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500 font-medium">Nodes Connected:</span>
          </div>
          <span className="font-bold text-slate-800">100% Operational</span>
        </div>
      </div>
    </aside>
  );
};
