import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSimulation } from '../context/SimulationContext';
import { getPortalByRole } from '../config/portals';
import { getAccent } from '../config/accentStyles';
import { Bell, Search, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isLivePulseActive, toggleLivePulse, pingCount } = useSimulation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const portal = user ? getPortalByRole(user.role) : null;
  const accent = portal ? getAccent(portal.accent) : getAccent('brand');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md shadow-xs">
      {/* Search Input */}
      <div className="relative hidden w-80 lg:block">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Quick search SKU, PO #, Shipment #..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {/* Root Admin Portal Switcher */}
      {user?.role === 'ADMIN' && (
        <div className="hidden xl:flex items-center gap-1 bg-slate-100/90 border border-slate-200 rounded-xl p-1 text-[11px] font-semibold text-slate-600 shadow-2xs">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 rounded-lg py-0.5">
            Admin Review
          </span>
          <Link to="/products" className="px-2 py-1 rounded-lg hover:bg-white hover:text-orange-600 transition">
            Warehouse
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/shipments" className="px-2 py-1 rounded-lg hover:bg-white hover:text-blue-600 transition">
            Logistics
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/purchase-orders" className="px-2 py-1 rounded-lg hover:bg-white hover:text-emerald-600 transition">
            Supplier
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/returns" className="px-2 py-1 rounded-lg hover:bg-white hover:text-purple-600 transition">
            Customer
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/admin" className="px-2 py-1 rounded-lg bg-white text-purple-700 font-bold border border-purple-200 shadow-2xs">
            Admin Console
          </Link>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Simulation Pulse Toggle */}
        <button
          onClick={toggleLivePulse}
          title="Toggle simulated live GPS and IoT updates"
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
            isLivePulseActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-xs'
              : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isLivePulseActive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${isLivePulseActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </span>
          <span className="hidden sm:inline">Telemetry Pulse:</span>
          <span className="font-bold">{isLivePulseActive ? 'LIVE' : 'PAUSED'}</span>
          <span className="hidden lg:inline text-[10px] text-slate-400 font-mono">(Ping #{pingCount})</span>
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500"></span>
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">Active Alerts</span>
                <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-[11px] font-bold text-orange-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5">
                  <p className="font-bold text-rose-700">Low Stock Alert: LAP-001</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Bangalore Warehouse: 18 units left. Expected stockout in 2.8 days.</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                  <p className="font-bold text-amber-700">Transit Delay: SH-10234</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Heavy rainfall on Krishnagiri NH-44. ETA extended by 2 hours.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 hover:border-slate-300 transition shadow-xs"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full font-bold text-xs bg-orange-100 text-orange-600 border border-orange-200">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="font-bold leading-none text-slate-900 text-xs">{user?.name}</p>
              <span className="inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {user?.role.replace(/_/g, ' ')}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-500">{portal?.title}</p>
              </div>
              <div className="py-1">
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-950 rounded-lg"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-500" /> Admin Console
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                >
                  <LogOut className="h-3.5 w-3.5" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
