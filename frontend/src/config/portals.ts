import {
  ShieldCheck,
  Warehouse,
  Truck,
  Building2,
  PackageSearch,
  LucideIcon,
} from 'lucide-react';
import { UserRole } from '../types';

export interface ModuleLink {
  path: string;
  label: string;
}

export interface PortalConfig {
  key: string;
  role: UserRole;
  title: string;
  shortLabel: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind color stem, e.g. 'brand', 'blue'
  loginPath: string;
  registerPath: string;
  dashboardPath: string;
  allowSelfRegister: boolean;
  demoEmail: string;
  modules: ModuleLink[];
}

export const ADMIN_PORTAL: PortalConfig = {
  key: 'admin',
  role: 'ADMIN',
  title: 'Admin Console',
  shortLabel: 'Admin',
  tagline: 'Full platform control',
  description: 'Approve accounts, manage roles & permissions, audit every change, and oversee all platform data.',
  icon: ShieldCheck,
  accent: 'purple',
  loginPath: '/admin',
  registerPath: '/admin',
  dashboardPath: '/admin',
  allowSelfRegister: false,
  demoEmail: 'admin@cargopulse.io',
  modules: [{ path: '/admin', label: 'Admin Console' }],
};

/**
 * Public role portals shown on the website and accessible to visitors.
 * Note: Admin is deliberately excluded from here so it remains hidden from the public website.
 */
export const PORTALS: PortalConfig[] = [
  {
    key: 'warehouse',
    role: 'WAREHOUSE_MANAGER',
    title: 'Warehouse Portal',
    shortLabel: 'Warehouse',
    tagline: 'Stock, bins & receiving',
    description: 'Manage product catalogs, real-time inventory, multi-tier warehouse bins, and inbound purchase orders.',
    icon: Warehouse,
    accent: 'amber',
    loginPath: '/warehouse/login',
    registerPath: '/warehouse/register',
    dashboardPath: '/dashboard',
    allowSelfRegister: true,
    demoEmail: 'warehouse@cargopulse.io',
    modules: [
      { path: '/dashboard', label: 'Command Center' },
      { path: '/products', label: 'Product Catalog' },
      { path: '/inventory', label: 'Inventory & Stock' },
      { path: '/warehouses', label: 'Warehouses & Bins' },
      { path: '/purchase-orders', label: 'Purchase Orders' },
    ],
  },
  {
    key: 'logistics',
    role: 'LOGISTICS_MANAGER',
    title: 'Logistics Portal',
    shortLabel: 'Logistics',
    tagline: 'Shipments, fleet & delivery',
    description: 'Dispatch shipments, track live GPS telemetry, manage fleet & drivers, and confirm last-mile delivery.',
    icon: Truck,
    accent: 'blue',
    loginPath: '/logistics/login',
    registerPath: '/logistics/register',
    dashboardPath: '/dashboard',
    allowSelfRegister: true,
    demoEmail: 'logistics@cargopulse.io',
    modules: [
      { path: '/dashboard', label: 'Command Center' },
      { path: '/shipments', label: 'Shipments & Dispatch' },
      { path: '/tracking', label: 'Live GPS Tracking' },
      { path: '/fleet', label: 'Fleet & Drivers' },
      { path: '/deliveries', label: 'Deliveries & POD' },
      { path: '/traceability', label: 'Product Journey' },
    ],
  },
  {
    key: 'supplier',
    role: 'SUPPLIER',
    title: 'Supplier Portal',
    shortLabel: 'Supplier',
    tagline: 'POs, SLAs & dispatch',
    description: 'Review purchase orders, confirm dispatches, and track your SLA performance scorecard.',
    icon: Building2,
    accent: 'emerald',
    loginPath: '/supplier/login',
    registerPath: '/supplier/register',
    dashboardPath: '/dashboard',
    allowSelfRegister: true,
    demoEmail: 'supplier@apexdevices.com',
    modules: [
      { path: '/dashboard', label: 'Command Center' },
      { path: '/purchase-orders', label: 'Purchase Orders' },
      { path: '/suppliers', label: 'SLA Scorecard' },
    ],
  },
  {
    key: 'customer',
    role: 'CUSTOMER',
    title: 'Customer Portal',
    shortLabel: 'Customer',
    tagline: 'Track & manage returns',
    description: 'Track active consignments in real time, sign for electronic proof of delivery, and request returns.',
    icon: PackageSearch,
    accent: 'cyan',
    loginPath: '/customer/login',
    registerPath: '/customer/register',
    dashboardPath: '/dashboard',
    allowSelfRegister: true,
    demoEmail: 'customer@novatech.com',
    modules: [
      { path: '/dashboard', label: 'Command Center' },
      { path: '/tracking', label: 'Track Shipment' },
      { path: '/returns', label: 'Reverse Logistics' },
    ],
  },
];

export const getPortalByRole = (role: UserRole): PortalConfig => {
  if (role === 'ADMIN') return ADMIN_PORTAL;
  return PORTALS.find(p => p.role === role) || PORTALS[0];
};

export const getPortalByKey = (key: string): PortalConfig | undefined => {
  if (key.toLowerCase() === 'admin') return ADMIN_PORTAL;
  return PORTALS.find(p => p.key === key);
};
