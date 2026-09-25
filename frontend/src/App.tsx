import { AiGuidanceBot } from './components/AiGuidanceBot';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { ProtectedRoute, AdminOnlyRoute } from './components/ProtectedRoute';
import { PORTALS } from './config/portals';

// Public
import { HomePage } from './pages/HomePage';
import { PortalLoginPage } from './pages/portal/PortalLoginPage';
import { PortalRegisterPage } from './pages/portal/PortalRegisterPage';

// Admin
import { AdminEntryPage } from './pages/admin/AdminEntryPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

// Operational pages (shared across portals, gated by role)
import { DashboardPage } from './pages/DashboardPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { ShipmentsPage } from './pages/ShipmentsPage';
import { ShipmentTrackingPage } from './pages/ShipmentTrackingPage';
import { FleetPage } from './pages/FleetPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { TraceabilityPage } from './pages/TraceabilityPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';

// Roles allowed into each shared operational module (ADMIN always has access — see ProtectedRoute)
const WAREHOUSE_ROLES = ['WAREHOUSE_MANAGER'] as const;
const LOGISTICS_ROLES = ['LOGISTICS_MANAGER'] as const;
const SUPPLIER_ROLES = ['SUPPLIER'] as const;
const CUSTOMER_ROLES = ['CUSTOMER'] as const;
const ANY_ROLE = ['WAREHOUSE_MANAGER', 'LOGISTICS_MANAGER', 'SUPPLIER', 'CUSTOMER'] as const;

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public marketing home page */}
            <Route path="/" element={<HomePage />} />

            {/* Secret Admin console route (unadvertised, accessed directly via /admin) */}
            <Route path="/admin" element={<AdminEntryPage />} />
            <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Portal-scoped auth routes: /warehouse/login, /warehouse/register, etc. */}
            <Route path="/:portalKey/login" element={<PortalLoginPage />} />
            <Route path="/:portalKey/register" element={<PortalRegisterPage />} />

            {/* Shared workspace shell (Sidebar + Header) — modules gated per role, ADMIN sees everything */}
            <Route element={<ProtectedRoute allowedRoles={[...ANY_ROLE]} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/digital-twin" element={<DigitalTwinPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/intelligence" element={<AiAssistantPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[...WAREHOUSE_ROLES]} />}>
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/warehouses" element={<WarehousesPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[...WAREHOUSE_ROLES, ...SUPPLIER_ROLES]} />}>
              <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[...LOGISTICS_ROLES]} />}>
              <Route path="/shipments" element={<ShipmentsPage />} />
              <Route path="/fleet" element={<FleetPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[...LOGISTICS_ROLES, ...CUSTOMER_ROLES]} />}>
              <Route path="/tracking" element={<ShipmentTrackingPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[...LOGISTICS_ROLES, ...WAREHOUSE_ROLES]} />}>
              <Route path="/deliveries" element={<DeliveriesPage />} />
              <Route path="/traceability" element={<TraceabilityPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[...CUSTOMER_ROLES]} />}>
              <Route path="/returns" element={<ReturnsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[...SUPPLIER_ROLES]} />}>
              <Route path="/suppliers" element={<SuppliersPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AiGuidanceBot />
        </BrowserRouter>
      </SimulationProvider>
    </AuthProvider>
  );
};

export default App;
