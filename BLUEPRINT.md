# BLUEPRINT — Healthcare Operational & Insight Dashboard

> **Status:** Approved for implementation  
> **Last updated:** 2026-04-17  
> **Technology:** Angular SPA (standalone components, Angular 17+) — no backend

---

## 1. Purpose

A single-page operational dashboard that gives data & AI leads and transformation programme teams one unified view of:

- How current demand compares to service capacity across all care units
- Which units show repeat-encounter patterns that may signal emerging pressure
- Whether the underlying data pipelines are delivering fresh, reliable data

All signals are illustrative and sourced from pre-processed static JSON. **No clinical decision support is implied.**

---

## 2. User Scenarios

### 2.1 Persona — Transformation Programme Lead

**Who:** Senior manager overseeing service redesign across multiple care units.  
**What they do:** Reviews the dashboard at the start of each working day.  
**What they need to see:**
- Which service units are over capacity right now
- Whether demand pressure has been consistent over recent days or is a one-day spike
- Return-visit rates that might indicate unresolved care episodes

**Journey:**
1. Lands on the dashboard → scans the KPI summary bar for overall system health
2. Reads the demand vs capacity chart → identifies the highest-pressure units (Emergency Care, Outpatient Clinics)
3. Clicks a service unit to open the trend panel → confirms sustained OVER_CAPACITY over multiple snapshot dates
4. Notes the return-visit rate for Mental Health is elevated → flags for operational review

---

### 2.2 Persona — Data & AI Lead

**Who:** Technical lead responsible for data pipeline reliability.  
**What they do:** Monitors pipeline health before running or sharing any analytical output.  
**What they need to see:**
- Which source systems are FRESH, STALE, or MISSING
- How long each source has been lagging relative to its expected ingestion frequency
- Record counts to spot truncated or empty feeds

**Journey:**
1. Scrolls to the Pipeline Health panel
2. Sees Claims_Feed = MISSING and Lab_Results = STALE at a glance
3. Notes the exact `lastIngestedAt` and calculated lag for each stale source
4. Raises an incident ticket for Claims_Feed before any downstream report is generated

---

## 3. Feature List

### Feature Area A — KPI Summary Bar

| ID | Feature |
|---|---|
| A-01 | Display total encounter count across all service units (latest snapshot per unit) |
| A-02 | Display count of units currently in OVER_CAPACITY status |
| A-03 | Display pipeline health score: "N of 8 sources FRESH" |
| A-04 | Highlight pipeline score in red if any source is MISSING |

---

### Feature Area B — Demand vs Capacity

| ID | Feature |
|---|---|
| B-01 | Render a grouped bar chart: demand and capacity side-by-side for all 10 service units |
| B-02 | Colour-code capacity status: OVER_CAPACITY = red, AT_CAPACITY = amber, UNDER_CAPACITY = green |
| B-03 | Display service unit cards below the chart with: demand, capacity, encounterCount, returnVisitCount, capacityStatus badge, and calculated return-visit rate |
| B-04 | Allow filtering the card list by capacity status (All / OVER_CAPACITY / AT_CAPACITY / UNDER_CAPACITY) |
| B-05 | Allow sorting the card list by demand (descending) or return-visit rate (descending) |

---

### Feature Area C — Trend Analysis

| ID | Feature |
|---|---|
| C-01 | Display a time-series line chart of demand and capacity over available snapshot dates for the selected service unit |
| C-02 | Allow the user to select a different service unit from a dropdown |
| C-03 | Annotate each data point with the capacityStatus at that snapshot |
| C-04 | Show encounter count and return-visit count as secondary series (toggleable) |

---

### Feature Area D — Pipeline Health

| ID | Feature |
|---|---|
| D-01 | Display one row per source system showing: name, status badge, lastIngestedAt (formatted), expected frequency, calculated lag, record count |
| D-02 | Sort rows: MISSING first, then STALE, then FRESH |
| D-03 | Display a red alert banner if any source is MISSING |
| D-04 | Display an amber alert banner if any source is STALE (and none are MISSING) |
| D-05 | Show "—" and a MISSING badge for sources where lastIngestedAt is null |

---

### Feature Area E — Cross-cutting

| ID | Feature |
|---|---|
| E-01 | Non-clinical disclaimer banner: "All signals are illustrative only and do not constitute clinical decision support" |
| E-02 | Responsive layout optimised for wide desktop (1280px+); readable down to 768px |
| E-03 | Application title and last-data-refresh timestamp displayed in the header |

---

## 4. Data Model

### 4.1 OperationalSnapshot

Source file: `src/assets/data/operational-snapshots.json`

```typescript
interface OperationalSnapshot {
  snapshotId: string;           // UUID — unique per record
  recordedAt: string;           // ISO 8601 datetime string
  serviceUnit: ServiceUnit;     // see enum below
  demand: number;               // number of active demand requests
  capacity: number;             // available capacity slots
  encounterCount: number;       // total encounters recorded in window
  returnVisitCount: number;     // encounters flagged as return visits
  capacityStatus: CapacityStatus;
}

type ServiceUnit =
  | 'Emergency Care'
  | 'Surgical Pathway'
  | 'Cardiology'
  | 'Oncology'
  | 'Maternity'
  | 'Mental Health'
  | 'Outpatient Clinics'
  | 'Diagnostics'
  | 'Community Care'
  | 'Rehabilitation';

type CapacityStatus = 'OVER_CAPACITY' | 'AT_CAPACITY' | 'UNDER_CAPACITY';
```

**Derived fields** (computed in `DerivedMetricsService`, never persisted):

| Derived field | Formula |
|---|---|
| `returnVisitRate` | `returnVisitCount / encounterCount × 100` (%) |
| `demandCapacityGap` | `demand - capacity` (positive = over capacity) |
| `utilisationRatio` | `demand / capacity` |

**Relationship:** One service unit has many snapshots ordered by `recordedAt`. The latest snapshot per unit represents the current state. All snapshots for one unit feed the trend chart.

---

### 4.2 PipelineFreshness

Source file: `src/assets/data/pipeline-freshness.json`

```typescript
interface PipelineFreshness {
  sourceSystem: string;              // human-readable system name
  lastIngestedAt: string | null;     // ISO 8601 datetime or null if never ingested
  expectedFrequencyMinutes: number;  // target ingestion cadence in minutes
  status: PipelineStatus;
  recordCount: number;               // count of records in last successful load
}

type PipelineStatus = 'FRESH' | 'STALE' | 'MISSING';
```

**Known source systems (8):**

| sourceSystem | expectedFrequencyMinutes | Notes |
|---|---|---|
| EHR_Core | 15 | |
| ADT_Events | 5 | |
| Lab_Results | 30 | STALE in mock data |
| Radiology_Imaging_Index | 60 | |
| Pharmacy_Dispense | 20 | STALE in mock data |
| Scheduling_System | 10 | |
| Claims_Feed | 180 | MISSING in mock data, lastIngestedAt is null |
| CRM_Referrals | 45 | |

**Derived fields:**

| Derived field | Formula |
|---|---|
| `lagMinutes` | `(now - lastIngestedAt) / 60000` — only when `lastIngestedAt` is not null |
| `lagExceedsThreshold` | `lagMinutes > expectedFrequencyMinutes` |

---

## 5. API Surface

There is no backend. All data is loaded via Angular's `HttpClient` from static JSON files served as build assets.

### 5.1 Asset Endpoints

| Asset URL | Returns | Loaded by |
|---|---|---|
| `/assets/data/operational-snapshots.json` | `OperationalSnapshot[]` | `OperationalSnapshotService` |
| `/assets/data/pipeline-freshness.json` | `PipelineFreshness[]` | `PipelineFreshnessService` |

Both are loaded once on application init and held in memory for the session. No polling. No write operations.

### 5.2 Service Interfaces

```typescript
// OperationalSnapshotService
getAll(): Observable<OperationalSnapshot[]>
getLatestPerUnit(): Observable<OperationalSnapshot[]>
getByUnit(unit: ServiceUnit): Observable<OperationalSnapshot[]>

// PipelineFreshnessService
getAll(): Observable<PipelineFreshness[]>
getSummary(): Observable<{ fresh: number; stale: number; missing: number; total: number }>

// DerivedMetricsService (pure functions, no HTTP)
returnVisitRate(snapshot: OperationalSnapshot): number
demandCapacityGap(snapshot: OperationalSnapshot): number
lagMinutes(pipeline: PipelineFreshness, now: Date): number | null
```

---

## 6. Angular Application Structure

### 6.1 Routes

| Path | Component | Description |
|---|---|---|
| `/` | `DashboardComponent` | KPI bar + demand/capacity chart + service unit cards |
| `/trends/:unit` | `TrendComponent` (lazy) | Time-series chart for a single service unit |
| `/pipeline` | `PipelineComponent` (lazy) | Full pipeline health panel |
| `**` | redirect to `/` | |

### 6.2 Component Inventory

| Component | Location | Responsibility |
|---|---|---|
| `AppComponent` | `app/` | Shell, router outlet, disclaimer banner |
| `HeaderComponent` | `shared/header/` | App title, last-data-refresh timestamp |
| `KpiBarComponent` | `shared/kpi-bar/` | Three KPI tiles (Feature Area A) |
| `DashboardComponent` | `features/dashboard/` | Hosts chart + card list, filter/sort controls |
| `CapacityChartComponent` | `features/dashboard/` | Grouped bar chart (Feature Area B) |
| `ServiceUnitCardComponent` | `features/dashboard/` | Single service unit card with badges |
| `TrendComponent` | `features/trend/` | Line chart + unit selector (Feature Area C) |
| `PipelineComponent` | `features/pipeline/` | Table of pipeline rows + alert banners (Feature Area D) |
| `PipelineRowComponent` | `features/pipeline/` | Single pipeline row |

### 6.3 Services & State

| Service | Scope | Responsibility |
|---|---|---|
| `OperationalSnapshotService` | `root` | Load and cache operational-snapshots.json |
| `PipelineFreshnessService` | `root` | Load and cache pipeline-freshness.json |
| `DerivedMetricsService` | `root` | Pure derivation functions, no HTTP |

---

## 7. Constraints

| # | Constraint | Rationale |
|---|---|---|
| C-01 | No backend. No server-side API. | Scope: SPA only; data is pre-processed mock data |
| C-02 | No external API calls. All data served from `/assets/`. | No CORS exposure, works offline, no auth required |
| C-03 | No database or persistent storage (no localStorage, no IndexedDB). | Data is illustrative; persistence would imply production semantics |
| C-04 | Data is read-only. No create, update, or delete operations. | Mock data only; no write surface to expose |
| C-05 | No authentication or authorisation layer. | Internal tool, learning exercise scope |
| C-06 | No clinical decision logic. | All signals are illustrative; no inference engine permitted |
| C-07 | JSON files are the single source of truth and must not be modified at runtime. | Reproducibility and consistency across sessions |
| C-08 | Angular 17+ with standalone components. No NgModules. | Reduced boilerplate, aligns with current Angular best practice |
| C-09 | Charting via `ng2-charts` (Chart.js wrapper) or `ngx-charts`. No D3 direct usage. | Maintainability for team unfamiliar with low-level SVG |
| C-10 | UI component library: Angular Material. No custom CSS framework. | Consistency, accessibility baseline, responsive grid |
