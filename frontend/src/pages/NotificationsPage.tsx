import React, { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { NotificationItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.get('/notifications');
      if (res.success) setNotifications(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllAsRead = async () => {
    try {
      await ApiClient.put('/notifications/read-all');
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">System Alerts & Notifications</h1>
          <p className="text-xs text-slate-500">
            Real-time threshold breaches, highway bottleneck alerts, and purchase order status dispatches.
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <CheckCheck className="h-4 w-4" /> Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map(n => {
          const icons = {
            CRITICAL: AlertOctagon,
            WARNING: AlertTriangle,
            SUCCESS: CheckCircle2,
            INFO: Info,
          };
          const Icon = icons[n.severity] || Info;

          return (
            <div
              key={n.id}
              className={`flex items-start justify-between rounded-xl border p-4 text-xs transition ${
                n.isRead
                  ? 'border-slate-200 bg-slate-50 text-slate-500'
                  : 'border-slate-200 bg-white shadow-sm text-slate-800 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 border border-orange-200 text-orange-600 shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${n.isRead ? 'text-slate-500' : 'text-slate-950 font-bold'}`}>
                    {n.title}
                  </h3>
                  <p className="mt-1 text-slate-500 leading-relaxed">{n.message}</p>
                  <span className="mt-2 block text-[10px] text-slate-500">
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusBadge status={n.severity} size="sm" />
                {n.link && (
                  <Link
                    to={n.link}
                    className="text-[11px] font-semibold text-orange-600 hover:underline"
                  >
                    View Details ➔
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
