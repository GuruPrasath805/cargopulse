# 🚚 CargoPulse — End-to-End Supply Chain Visibility & Logistics Management Platform

> **Track. Manage. Predict. Deliver.**  
> An enterprise-grade B2B SaaS platform connecting Suppliers, Purchase Orders, Multi-tier Warehouses, Inventory Movements, Shipments, Fleet Transportation, Last-Mile Delivery (POD), and Reverse Logistics into a unified digital twin with predictive intelligence.

<p align="center">
  <img src="./frontend/public/logo-full.png" alt="CargoPulse Logo" width="260" />
</p>

---

## 🎨 Brand Identity

CargoPulse ships with an official visual identity applied consistently across the entire UI (see `frontend/tailwind.config.js`, which re-themes Tailwind's `brand`, `teal`, and `slate` tokens app-wide — no per-page edits needed).

| Usage | Color | HEX | RGB |
|---|---|---|---|
| 🟠 Primary Orange | `brand-500` | `#FF6B00` | 255, 107, 0 |
| 🟧 Dark Orange | `brand-600` | `#E85D00` | 232, 93, 0 |
| ⚫ Charcoal | `slate-800` | `#2B2B2B` | 43, 43, 43 |
| ⚪ White | — | `#FFFFFF` | 255, 255, 255 |

Logo assets live in `frontend/public/`: `logo-full.png` (icon + wordmark, used on the login screen), `logo-icon.png` (mark only, used in the sidebar, nav bar & as the trailer decal on the home page hero), and generated favicons.

### 🏠 Public Marketing Home Page
`/` serves a public landing page (`frontend/src/pages/HomePage.tsx`) — sticky pill navbar, a bold serif hero headline over an orange gradient, a fully self-contained **looping SVG animated truck driving along a road** (no video, no external assets — pure CSS/SVG), a platform intro, feature cards, and a portal directory that links straight into each portal's own login/register pages. Fonts: **Fraunces** (serif, headings) + **Plus Jakarta Sans** (sans, body/UI).

---

## 🌟 Executive Summary & Vision

Traditional logistics systems merely answer: *"How much stock do I have in storage?"*  
**CargoPulse** answers:  
- **Where did this product originate?** (Supplier & Purchase Order)  
- **Where is it currently allocated?** (Warehouse ➔ Zone ➔ Aisle ➔ Rack ➔ Bin)  
- **What is its transit telematics status?** (Live vehicle GPS, highway checkpoints, cargo temperature, speed)  
- **What problems are predicted next?** (Predictive Stockout days, transit congestion probability, supplier risk)  
- **How are customer returns handled?** (Reverse logistics triage: Restock, Repair, Replace, Scrap)

---

## ⚡ Key Differentiators & Signature Features

### 1. 🔥 Supply Chain Digital Twin (Interactive Network Topology)
A live interactive visual network graph mapping all physical and transit nodes:
`Suppliers ➔ Primary Consolidation Hubs ➔ Highway Transit Corridors ➔ Regional Distribution Gateways ➔ End Clients`.
Clicking any node reveals live volumetric capacity, active consignments, delayed shipments, and risk badges.

### 2. 🛡️ Multi-Factor Supply Chain Risk Radar (0 - 100)
Calculates real-time composite operational risk across the supply chain:
- **Highway bottlenecks & severe weather**: `+25 pts`
- **Safety stock deficit (critical inventory)**: `+20 pts`
- **Supplier delivery variance & quality defects**: `+15 pts`
- **Warehouse peak capacity stress**: `+8 pts`

### 3. 📉 Predictive Stockout Forecasts
Rather than simple threshold flags, CargoPulse runs mathematical consumption velocity:
$$\text{Projected Days Remaining} = \frac{\text{Current Stock (Units)}}{\text{Daily Burn Rate (Units/Day)}}$$
Predicts exact calendar dates of expected stockouts and computes optimal batch reorder quantities.

### 4. 🛰️ Live Simulated Telematics & Milestone Tracking
Simulates vehicle CAN-bus and GPS transponder pings on the **NH-44 Freight Corridor (Chennai ➔ Bangalore)**:
- Live Vehicle Speed (km/h)
- Temperature-controlled Cold Chain telemetry (°C)
- Visual route progression from Origin Hub to Destination Dock
- Route milestone checkpoints

### 5. 🔍 End-to-End Product Custody Traceability
Enter any SKU or Lot Batch (e.g. `LAP-001`, `MED-COLD-88`, `MON-1023`) to audit its 6-stage lifecycle:
1. **Sourcing & PO** (Supplier SLA & Contract)
2. **Inbound QC** (RFID Scan & Pallet shrink wrapping)
3. **Bin Placement** (Zone A / Rack A01 / Bin A01-02)
4. **Outbound Dispatch** (Vehicle BharatBenz & Driver assignment)
5. **Highway Transit** (GPS Checkpoints & Speed logging)
6. **Last-Mile Delivery** (Electronic Proof of Delivery & Signature)

### 6. 🔄 Reverse Logistics (Returns & Inspection Triage)
Handles customer RMA returns with an inspection portal supporting 4 actions:
- **Restock**: Automatically increments warehouse stock and logs an immutable `RETURN` transaction.
- **Repair**: Flags for internal workshop servicing.
- **Replace**: Triggers an automated warranty dispatch.
- **Scrap**: Writes off damaged goods.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | **React 18 + TypeScript + Vite** | Modular single-page application with modern component architecture |
| **Styling** | **Tailwind CSS + Lucide Icons** | Dark-mode logistics design system inspired by Flexport and Datadog |
| **Charts** | **Recharts** | Volumetric area trends, throughput bar charts, and status donuts |
| **Backend API** | **Node.js + Express + TypeScript** | Strongly-typed RESTful architecture with modular route controllers |
| **Database** | **PostgreSQL + Prisma ORM** | 20+ relational models with strict constraints and foreign keys |
| **Caching** | **Redis** | High-speed cache for dashboard stats & telemetry with in-memory fallback |
| **DevOps** | **Docker & Docker Compose** | Multi-container setup for Postgres, Redis, API Server, and Web UI |

---

## 👥 Portals, Roles & Account Approval

CargoPulse is split into **5 portals**, each with its own login page, registration page, and dashboard: **Admin**, **Warehouse**, **Logistics**, **Supplier**, and **Customer** (`frontend/src/config/portals.ts` is the single source of truth for this mapping). Logging into the wrong portal with a valid password is rejected — a Supplier account can't sign into the Warehouse portal, for example.

**New accounts require Admin approval before first login.** Warehouse, Logistics, Supplier and Customer portals allow self-registration (`/warehouse/register`, `/logistics/register`, `/supplier/register`, `/customer/register`); the new account is created with status `PENDING` and login is blocked with a clear message until an Admin approves it from the Admin Console. Admin accounts are never self-registered — an existing Admin creates them from the console.

An Admin can also **suspend** an approved account at any time. Suspension takes effect immediately — even an already-issued login token stops working on the very next request, not just at the next login attempt.

Pre-seeded demo accounts (all pre-approved, password `password123`):

| Portal | Demo Email | Primary Capabilities |
|---|---|---|
| **Admin** | `admin@cargopulse.io` | Approve/reject registrations, manage users & roles, suspend/reactivate accounts, full audit log |
| **Warehouse** | `warehouse@cargopulse.io` | Stock in/out, inter-warehouse transfers, bin allocations, PO receiving |
| **Logistics** | `logistics@cargopulse.io` | Shipments dispatch, route monitoring, vehicle/driver fleet assignment |
| **Supplier** | `supplier@apexdevices.com` | Review POs, confirm dispatches, SLA scorecard performance |
| **Customer** | `customer@novatech.com` | Track active consignments, sign electronic POD, request returns |

Two accounts (`newwarehouse@cargopulse.io`, `partner@brightsupply.com`) are seeded with status `PENDING` so the Admin approval queue isn't empty on first run — sign in as Admin and approve/reject them from **Admin Console → Approvals**.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 20+** and npm ([download](https://nodejs.org))
- **VS Code** ([download](https://code.visualstudio.com))
- Docker Desktop — only needed for Option 2 below (optional)

> No database setup needed to try it out — see Option 1. The app has a built-in resilient in-memory dataset that activates automatically if Postgres/Redis aren't running.

### Option 1: Run in VS Code (recommended for local trials)

1. **Unzip the project** and open the `cargopulse` folder in VS Code:
   ```bash
   code cargopulse
   ```
2. **Open a terminal in VS Code**: `Terminal → New Terminal` (or `` Ctrl+` `` / `` Cmd+` ``).
3. **Install all dependencies** (installs root, `frontend/`, and `backend/` in one go):
   ```bash
   npm run install:all
   ```
4. **Start both frontend and backend together:**
   ```bash
   npm run dev
   ```
   This uses `concurrently` to run the API and the React app side-by-side in one terminal, color-coded `API` (blue) and `WEB` (magenta).
5. **Open in your browser:**
   - Frontend UI: **http://localhost:5173**
   - Backend health check: **http://localhost:5000/api/health**
6. **Sign in** from the homepage's portal directory — e.g. click **Admin sign in** and use `admin@cargopulse.io` / `password123` (see the full portal table above).

#### Prefer two separate terminals? (easier to read logs / restart independently)
Open two VS Code terminals side-by-side (`Terminal → Split Terminal`):

```bash
# Terminal 1 — Backend API (http://localhost:5000)
cd backend
npm install
npm run dev
```

```bash
# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Stop either with `Ctrl+C`. No `.env` file is required for this trial mode — the backend auto-detects the missing database and falls back to in-memory data.

---

### Option 2: Full Production with Docker Compose (Postgres + Redis + API + UI)

1. Ensure Docker Desktop is running.
2. Run from the project root:
   ```bash
   docker compose up --build -d
   ```
3. Services spun up automatically:
   - **React Frontend**: `http://localhost:3000`
   - **Express API**: `http://localhost:5000`
   - **PostgreSQL 16**: Port `5432` (`cargopulse_db`)
   - **Redis 7**: Port `6379`

---

### Option 3: Connecting Local PostgreSQL with Prisma

1. Copy `.env.example` to `backend/.env` and update your `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/cargopulse_db?schema=public"
   ```
2. Run database migrations:
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```
3. Seed sample data:
   ```bash
   npm run seed
   ```

---

## 📡 REST API Reference

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate (bcrypt + status check) & issue JWT | Public |
| `POST` | `/api/auth/register` | Submit new account (always starts `PENDING`) | Public |
| `GET` | `/api/auth/me` | Current session's user profile | Authenticated |
| `GET` | `/api/admin/overview` | Platform-wide stats (users by status/role, recent activity) | Admin |
| `GET` | `/api/admin/users` | List all users (filter by `status`/`role`) | Admin |
| `GET` | `/api/admin/users/pending` | List accounts awaiting approval | Admin |
| `POST` | `/api/admin/users/:id/approve` | Approve a pending registration | Admin |
| `POST` | `/api/admin/users/:id/reject` | Reject a pending registration | Admin |
| `POST` | `/api/admin/users/:id/suspend` | Suspend an account (revokes access immediately) | Admin |
| `POST` | `/api/admin/users/:id/reactivate` | Reactivate a suspended account | Admin |
| `PUT` | `/api/admin/users/:id/role` | Change a user's role | Admin |
| `DELETE` | `/api/admin/users/:id` | Delete a user account | Admin |
| `GET` | `/api/admin/audit-logs` | Full platform audit trail | Admin |
| `GET` | `/api/dashboard/stats` | Cached KPI metrics & risk summary | All |
| `GET` | `/api/dashboard/trend` | 7-day inventory velocity trend | All |
| `GET` | `/api/products` | Retrieve SKU catalog with burn-rates | All |
| `POST` | `/api/products` | Register new SKU with safety buffers | Admin, WH Manager |
| `GET` | `/api/inventory` | List stock by warehouse & bin | All |
| `POST` | `/api/inventory/stock-in` | Inbound stock addition | Admin, WH Manager |
| `POST` | `/api/inventory/transfer` | Inter-warehouse inventory rebalance | Admin, WH Manager |
| `GET` | `/api/inventory/transactions` | Immutable audit ledger history | All |
| `GET` | `/api/warehouses` | Multi-tier warehouse hierarchy | All |
| `GET` | `/api/suppliers` | Suppliers with SLA scorecards | All |
| `GET` | `/api/purchase-orders` | Procurement PO list | All |
| `POST` | `/api/purchase-orders` | Create purchase order | Admin, WH Manager |
| `PUT` | `/api/purchase-orders/:id/status` | Update PO status (Auto-stocks on `RECEIVED`) | Admin, WH Manager |
| `GET` | `/api/shipments` | Active freight consignments | All |
| `POST` | `/api/shipments` | Dispatch highway shipment | Admin, Logistics |
| `GET` | `/api/shipments/:id/tracking` | Live GPS & checkpoint milestones | All |
| `GET` | `/api/fleet/vehicles` | Vehicles with payload tonnage | All |
| `POST` | `/api/deliveries/:id/complete` | Record electronic Proof of Delivery | All |
| `GET` | `/api/returns` | Reverse logistics return requests | All |
| `PUT` | `/api/returns/:id/decision` | Execute 4-way return disposition | Admin, WH Manager |
| `GET` | `/api/intelligence/risk-summary` | 0-100 composite risk breakdown | All |
| `GET` | `/api/intelligence/stockouts` | Mathematical stockout days forecast | All |
| `GET` | `/api/traceability/:sku` | 6-stage product lifecycle trail | All |
| `GET` | `/api/notifications` | Real-time threshold alerts | All |

---

## 📂 Project Structure

```
cargopulse/
├── frontend/                   # React 18 + TypeScript Frontend
│   ├── public/                 # logo-full.png, logo-icon.png, favicons
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable Button, Card, Badge, Input/Select
│   │   │   ├── HeroTruckAnimation.tsx  # Looping SVG truck-on-a-road (homepage hero)
│   │   │   ├── ProtectedRoute.tsx      # Role-aware route guards (per-portal + Admin-only)
│   │   │   └── MetricCard, StatusBadge, Modal, Header, Sidebar
│   │   ├── config/
│   │   │   ├── portals.ts       # Single source of truth: 5 portals ↔ roles ↔ modules
│   │   │   └── accentStyles.ts  # Static Tailwind class maps per portal accent color
│   │   ├── context/            # AuthContext (real login/register/logout), SimulationContext (GPS Pulse)
│   │   ├── layouts/            # MainLayout
│   │   ├── pages/
│   │   │   ├── portal/          # PortalLoginPage, PortalRegisterPage (shared across all 5 portals)
│   │   │   ├── admin/           # AdminDashboardPage (Approvals, Users & Roles, Audit Log)
│   │   │   └── ...14 operational module views (Command Center, Digital Twin, Traceability...)
│   │   ├── services/           # ApiClient with JWT authorization (VITE_API_URL aware)
│   │   ├── types/              # TypeScript interfaces
│   │   └── vite-env.d.ts       # Typed import.meta.env
│   ├── .env.example            # Client env vars (VITE_API_URL)
│   ├── vercel.json             # Vercel SPA rewrite config
│   ├── tailwind.config.js      # CargoPulse orange/charcoal brand theme + Fraunces/Plus Jakarta Sans fonts
│   ├── Dockerfile
│   └── package.json
│
├── backend/                    # Node.js + Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma       # 20+ relational PostgreSQL models incl. User.status (approval workflow)
│   │   └── seed.ts             # Enterprise dataset seeder
│   ├── src/
│   │   ├── config/             # Typed environment configuration
│   │   ├── controllers/        # 15 controllers incl. adminController (approvals, roles, audit log)
│   │   ├── db/                 # Prisma client & high-fidelity resilient in-memory database
│   │   ├── middleware/         # JWT auth with live status/revocation check, RBAC, error handler
│   │   ├── routes/             # Express route routers incl. adminRoutes (Admin-only)
│   │   ├── services/           # Redis caching with TTL memory fallback
│   │   ├── app.ts              # Express app assembly
│   │   └── server.ts           # Server bootstrap
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml          # Container orchestration (Postgres, Redis, API, Client)
├── render.yaml                 # Render Blueprint (API + free Postgres)
├── vercel.json                 # Root-level Vercel fallback config
├── .env.example                # Server configuration blueprint
├── package.json                # Root monorepo scripts
└── README.md                   # Platform documentation
```

---

## 🧭 Suggested Next Modules & Feature Enhancements

The current build already covers the full physical + informational supply chain loop. Here's a prioritized roadmap of high-value additions to pitch or build next:

### High-impact, low-effort
- **Notification delivery channels** — wire the existing in-app alerts to Email (Resend/SendGrid) and WhatsApp/SMS (Twilio) for low-stock, delay, and delivery events.
- **Global command palette (⌘K)** — jump to any SKU, PO, shipment, or warehouse instantly.
- **CSV/Excel import-export** — bulk product catalog & inventory upload, and exportable reports from Analytics.
- **Dark/Light theme toggle** — the charcoal dark theme is default; a light "Daylight" mode using the same orange accent broadens client-facing use (e.g. Customer role).
- **Audit log viewer** — a searchable, filterable UI over the existing immutable inventory transaction ledger.

### Medium effort, strong differentiation
- **Route optimization engine** — real distance/ETA via a maps API (Mapbox/OpenRouteService) instead of simulated telemetry; multi-stop route planning for last-mile delivery.
- **Document management** — attach and preview invoices, e-way bills, PODs, and QC photos per shipment/PO.
- **Billing & invoicing module** — auto-generate supplier invoices from received POs and customer invoices from delivered shipments.
- **Multi-tenant organizations** — today roles are demo-switchable on one account; add real multi-tenant orgs so each customer/supplier only sees their own data.
- **Mobile driver app (PWA)** — a lightweight installable web app for drivers to update delivery status, capture e-signatures, and scan barcodes on the move.
- **Barcode / QR scanning** — camera-based SKU and bin scanning for warehouse receiving and put-away, using the device camera.

### Advanced / "wow factor" for demos
- **Real ML-based demand forecasting** — replace the linear burn-rate formula with a time-series model (e.g. Prophet) for seasonal demand prediction.
- **Carbon footprint tracking** — estimate CO₂e per shipment based on distance, vehicle type, and load, with a sustainability dashboard.
- **Supplier scorecard & auto re-ranking** — combine on-time %, defect rate, and price variance into a single supplier ranking used to auto-suggest the best supplier for a new PO.
- **Webhooks & public API keys** — let enterprise customers subscribe to shipment/inventory events from their own systems (ERP integration story).
- **Voice/chat ops assistant** — a natural-language box ("Which SKUs will stock out this week?") backed by the existing intelligence endpoints.

> Tip: the fastest way to make CargoPulse feel "enterprise-ready" in a demo is usually Notifications (Email/SMS) + CSV import/export + a light theme — all are low-effort but highly visible.

---

## ☁️ Deploying to Production (Vercel + Render)

The client and server deploy independently — client (static React build) on **Vercel**, server (Node/Express API) on **Render**. This repo already ships the config files needed for both.

### 1. Push the code to GitHub first
```bash
git init
git add .
git commit -m "feat: initial release of CargoPulse supply chain & logistics platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cargopulse.git
git push -u origin main
```

### 2. Deploy the backend API to Render
1. Go to [render.com](https://render.com) → **New** → **Blueprint**.
2. Connect your GitHub repo. Render will detect `render.yaml` at the repo root automatically.
3. Click **Apply** — this provisions:
   - A free PostgreSQL database (`cargopulse-db`)
   - A web service (`cargopulse-api`) built from `backend/`, with `DATABASE_URL` and a generated `JWT_SECRET` wired in automatically
4. Once deployed, copy the service URL, e.g. `https://cargopulse-api.onrender.com`. Test it: `https://cargopulse-api.onrender.com/api/health`.
5. Redis is **optional** — the app automatically falls back to an in-memory cache if `REDIS_URL` isn't set. To use real Redis, create a free instance (e.g. [Upstash](https://upstash.com)) and set `REDIS_URL` in the Render dashboard under the service's Environment tab.

### 3. Deploy the frontend to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → import the same GitHub repo.
2. In **Project Settings → General → Root Directory**, set it to `frontend` (recommended). *(If you skip this, the root-level `vercel.json` in this repo builds the client automatically instead.)*
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output directory `dist` (already set in `frontend/vercel.json`).
4. Under **Environment Variables**, add:
   ```
   VITE_API_URL = https://cargopulse-api.onrender.com/api
   ```
   (use your actual Render service URL from step 2 above).
5. Click **Deploy**. Vercel will give you a URL like `https://cargopulse.vercel.app`.

### 4. Close the loop — update CORS
Go back to the Render service's Environment tab and set `CLIENT_URL` to your real Vercel URL (e.g. `https://cargopulse.vercel.app`), then trigger a redeploy so the API's CORS config matches.

### Local development is unaffected
`npm run dev` from the repo root still runs both apps locally exactly as before — `VITE_API_URL` is only needed for the deployed, split-domain setup.

---

## 🎓 Viva / Interview Talking Points

When presenting CargoPulse to an interviewer or panel, emphasize these architectural highlights:

1. **Not Just CRUD, but a Connected Lifecycle**:
   *"Notice that receiving a purchase order doesn't just change a string in a table. It automatically calculates inventory additions, updates bin allocations, generates an immutable audit transaction ledger entry, and sends a system-wide broadcast notification."*

2. **The 3 Operational Layers**:
   *"We structured CargoPulse into three distinct tiers: Operations (Stock, POs, Shipments), Visibility (Digital Twin, Live GPS Telematics, Milestone Timelines), and Intelligence (Risk Radar 0-100, Predictive Stockout Days, Delay Probability)."*

3. **Reverse Logistics Completeness**:
   *"Most student systems terminate when an order is delivered. CargoPulse addresses reverse logistics with RMA triage, allowing warehouse managers to inspect returned goods and execute a 4-way disposition: Restock back into warehouse stock, Repair, Replace, or Scrap."*

4. **Portal-Segmented Access with Real Approval Governance**:
   *"Rather than one shared login, CargoPulse splits into five portals — Admin, Warehouse, Logistics, Supplier, Customer — each with its own registration flow. Every new account starts `PENDING` and is invisible to the system until an Admin approves it. Suspension is enforced live: the JWT middleware re-checks account status on every request, so a suspended user's existing token is rejected immediately, not just on their next login."*

---

*Engineered with precision for modern global supply chain resilience.*
