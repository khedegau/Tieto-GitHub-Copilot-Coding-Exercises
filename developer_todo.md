# Developer Todo — Healthcare Operational & Insight Dashboard

> **Reference:** [BLUEPRINT.md](BLUEPRINT.md) is the single source of truth for data models, component names, route paths, and constraints. Read it before picking up any task.  
> **Technology:** Angular 17+ · Standalone components · Angular Material · ng2-charts · No backend

---

## How To Use This Document

- Tasks are ordered. Earlier tasks are dependencies for later ones. Work top to bottom unless you have a specific reason not to.
- Each task is designed to fit inside a single agent context window. The **File Scope** section tells you the maximum blast radius — stay within it.
- **Acceptance Criteria** are the contract. A task is not done until every criterion can be checked.
- **TDD Plan** lists the tests that should exist before the task is considered complete. Writing them first is encouraged; writing them alongside is acceptable. Skipping them is not.
- **Domain tags** help the team route tasks to the right person or agent. Do not mix domains inside a single task.
- Status markers: `[ ]` not started · `[-]` in progress · `[x]` complete.

---

## Architectural Principles (read once, apply everywhere)

| Principle | What it means in practice |
|---|---|
| **Standalone components only** | No `NgModule` declarations. Every component, directive, and pipe uses `standalone: true`. |
| **Services are singleton and lazy** | All services are `providedIn: 'root'`. Data is loaded once and shared via `shareReplay(1)`. |
| **No logic in templates** | Computed values belong in the service or component class. Templates only bind; they never calculate. |
| **Typed data all the way** | Every JSON response is typed against the interfaces in `src/app/core/models/`. No `any`. |
| **Derived metrics are pure functions** | `DerivedMetricsService` contains only stateless functions. No HTTP calls, no side effects. |
| **Angular Material for all UI primitives** | Buttons, cards, badges, tables, selects — use Material components. No custom CSS framework. |
| **File naming convention** | `kebab-case.component.ts`, `kebab-case.service.ts`, `kebab-case.model.ts`. Match the component name in BLUEPRINT.md exactly. |
| **Lazy routes for non-dashboard pages** | `TrendComponent` and `PipelineComponent` are loaded via `loadComponent`. `DashboardComponent` is eager. |

---

## Epics Overview

| Epic | Covers | Tasks |
|---|---|---|
| 0 — Foundation | Project scaffold, assets, global config | T-00 |
| 1 — Domain Layer | TypeScript models, type guards | T-01 |
| 2 — Data Services | HTTP loading, caching, service interfaces | T-02, T-03, T-04 |
| 3 — App Shell | Routing, header, disclaimer | T-05 |
| 4 — KPI Bar | Feature Area A | T-06 |
| 5 — Demand & Capacity | Feature Area B | T-07, T-08, T-09 |
| 6 — Trend Analysis | Feature Area C | T-10 |
| 7 — Pipeline Health | Feature Area D | T-11, T-12 |
| 8 — Cross-cutting & Polish | Feature Area E, responsive layout | T-13 |

---

## Tasks

---

### T-00 — Scaffold Angular project and copy data assets

**Status:** `[ ]`  
**Domain:** `infrastructure`  
**Epic:** 0 — Foundation

**Description:**  
Generate a new Angular 17+ workspace with standalone component defaults, install Angular Material and ng2-charts, and copy the two JSON data files into the Angular assets folder. This is the mandatory first task — all other tasks depend on the project existing.

**Acceptance Criteria**
- [ ] `ng new` produces a working application that compiles with `ng build` (zero errors)
- [ ] `src/assets/data/operational-snapshots.json` is present and identical to `data/operational-snapshots.json`
- [ ] `src/assets/data/pipeline-freshness.json` is present and identical to `data/pipeline-freshness.json`
- [ ] Angular Material is installed and its pre-built theme is referenced in `angular.json`
- [ ] `ng2-charts` and `chart.js` are listed in `package.json` dependencies
- [ ] `HttpClientModule` (or `provideHttpClient()`) is registered in `app.config.ts`

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| Default `AppComponent` renders without error | unit | smoke test — project is wired correctly |
| HTTP GET `/assets/data/operational-snapshots.json` returns 200 | e2e / manual | assets are served |
| HTTP GET `/assets/data/pipeline-freshness.json` returns 200 | e2e / manual | assets are served |

**File Scope** (≤ 5)
- `package.json`
- `angular.json`
- `src/app/app.config.ts`
- `src/assets/data/operational-snapshots.json`
- `src/assets/data/pipeline-freshness.json`

---

### T-01 — Define domain model types

**Status:** `[ ]`  
**Domain:** `data-layer`  
**Epic:** 1 — Domain Layer

**Description:**  
Create the TypeScript interfaces and union types that model the two data sources. These types are used across every other layer. All interfaces must match the JSON shapes documented in BLUEPRINT.md §4 exactly — no extra fields, no omissions.

**Acceptance Criteria**
- [ ] `OperationalSnapshot` interface exists in `src/app/core/models/operational-snapshot.model.ts`
- [ ] `PipelineFreshness` interface exists in `src/app/core/models/pipeline-freshness.model.ts`
- [ ] `ServiceUnit`, `CapacityStatus`, and `PipelineStatus` union types are exported from their respective model files
- [ ] All field names and types match the JSON shapes in BLUEPRINT.md §4.1 and §4.2
- [ ] `lastIngestedAt` is typed as `string | null` (not just `string`)
- [ ] A barrel file `src/app/core/models/index.ts` re-exports all types

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| A raw JSON object matching the schema can be assigned to `OperationalSnapshot` without a TypeScript error | compile-time / type test | interface correctness |
| A raw JSON object with a missing required field causes a TypeScript compile error | compile-time / type test | no silent `any` escape |
| `CapacityStatus` union rejects a value not in `'OVER_CAPACITY' \| 'AT_CAPACITY' \| 'UNDER_CAPACITY'` | compile-time / type test | exhaustive status handling |

**File Scope** (≤ 5)
- `src/app/core/models/operational-snapshot.model.ts`
- `src/app/core/models/pipeline-freshness.model.ts`
- `src/app/core/models/index.ts`

---

### T-02 — Implement OperationalSnapshotService

**Status:** `[ ]`  
**Domain:** `data-layer`  
**Epic:** 2 — Data Services

**Description:**  
Build the service that loads `operational-snapshots.json` once from assets, caches the result, and exposes the three read methods defined in BLUEPRINT.md §5.2. This service is the sole data entry point for all operational snapshot data in the application.

**Acceptance Criteria**
- [ ] `getAll()` returns an `Observable<OperationalSnapshot[]>` from the cached HTTP response
- [ ] `getLatestPerUnit()` returns one snapshot per `serviceUnit`, selecting the one with the most recent `recordedAt`
- [ ] `getByUnit(unit)` returns all snapshots for the given `ServiceUnit` ordered by `recordedAt` ascending
- [ ] The JSON file is fetched exactly once regardless of how many components subscribe (use `shareReplay(1)`)
- [ ] The service is typed with `HttpClient.get<OperationalSnapshot[]>()` — no `any`

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| `getAll()` returns all records from the mock JSON | unit (with `HttpClientTestingModule`) | basic load |
| `getLatestPerUnit()` returns exactly 10 records (one per service unit) | unit | deduplication logic |
| `getLatestPerUnit()` selects the record with the latest `recordedAt` when multiple exist for a unit | unit | latest-record logic |
| `getByUnit('Emergency Care')` returns only Emergency Care records, sorted ascending by date | unit | filter + sort |
| A second subscription does not trigger a second HTTP request | unit | `shareReplay` caching |

**File Scope** (≤ 5)
- `src/app/core/services/operational-snapshot.service.ts`
- `src/app/core/services/operational-snapshot.service.spec.ts`

---

### T-03 — Implement PipelineFreshnessService

**Status:** `[ ]`  
**Domain:** `data-layer`  
**Epic:** 2 — Data Services

**Description:**  
Build the service that loads `pipeline-freshness.json` and exposes `getAll()` and `getSummary()` as described in BLUEPRINT.md §5.2. The summary is derived from the loaded data and does not require a second HTTP call.

**Acceptance Criteria**
- [ ] `getAll()` returns an `Observable<PipelineFreshness[]>` — all 8 source systems
- [ ] `getSummary()` returns `{ fresh: number; stale: number; missing: number; total: number }` derived from `getAll()`
- [ ] `getSummary()` correctly counts Claims_Feed as `missing: 1` from the mock data
- [ ] Data is fetched exactly once (use `shareReplay(1)`)
- [ ] `lastIngestedAt: null` (Claims_Feed) is handled without runtime error

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| `getAll()` returns 8 items | unit | load |
| `getSummary()` returns `{ fresh: 5, stale: 2, missing: 1, total: 8 }` for the mock data | unit | summary derivation |
| `getSummary()` does not throw when a record has `lastIngestedAt: null` | unit | null safety |
| Second subscription does not trigger a second HTTP request | unit | caching |

**File Scope** (≤ 5)
- `src/app/core/services/pipeline-freshness.service.ts`
- `src/app/core/services/pipeline-freshness.service.spec.ts`

---

### T-04 — Implement DerivedMetricsService

**Status:** `[ ]`  
**Domain:** `business-logic`  
**Epic:** 2 — Data Services

**Description:**  
Create a pure-function service that computes all derived fields documented in BLUEPRINT.md §4.1 and §4.2. No HTTP calls, no state, no subscriptions. Every function takes raw model objects and returns a computed value. This service is the single place where formulas live — no other file should re-implement them.

**Acceptance Criteria**
- [ ] `returnVisitRate(snapshot)` returns `(returnVisitCount / encounterCount) * 100`, rounded to one decimal place
- [ ] `returnVisitRate` returns `0` when `encounterCount` is `0` (division-by-zero guard)
- [ ] `demandCapacityGap(snapshot)` returns `demand - capacity` (positive = over, negative = under)
- [ ] `utilisationRatio(snapshot)` returns `demand / capacity`, rounded to two decimal places
- [ ] `lagMinutes(pipeline, now)` returns the difference in minutes between `now` and `lastIngestedAt`, or `null` when `lastIngestedAt` is null
- [ ] `lagExceedsThreshold(pipeline, now)` returns `true` when `lagMinutes > expectedFrequencyMinutes`

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| `returnVisitRate` with `returnVisitCount=38, encounterCount=205` returns `18.5` | unit | formula |
| `returnVisitRate` with `encounterCount=0` returns `0` | unit | guard |
| `demandCapacityGap` with `demand=189, capacity=164` returns `25` | unit | formula |
| `lagMinutes` returns `null` when `lastIngestedAt` is `null` | unit | null guard |
| `lagMinutes` returns correct positive integer for a known time difference | unit | formula |
| `lagExceedsThreshold` returns `true` when lag > expected frequency | unit | threshold logic |

**File Scope** (≤ 5)
- `src/app/core/services/derived-metrics.service.ts`
- `src/app/core/services/derived-metrics.service.spec.ts`

---

### T-05 — App shell: routing, header, and disclaimer banner

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 3 — App Shell

**Description:**  
Wire up the application shell: configure the four routes from BLUEPRINT.md §6.1, build `HeaderComponent` showing the app title, and add the non-clinical disclaimer banner (Feature E-01). `TrendComponent` and `PipelineComponent` routes should use `loadComponent` for lazy loading. `DashboardComponent` is a placeholder at this stage.

**Acceptance Criteria**
- [ ] Navigating to `/` renders `DashboardComponent` (placeholder stub is acceptable here)
- [ ] Navigating to `/pipeline` lazy-loads `PipelineComponent` (placeholder stub is acceptable)
- [ ] Navigating to `/trends/Emergency%20Care` lazy-loads `TrendComponent` (placeholder stub is acceptable)
- [ ] Any unknown route redirects to `/`
- [ ] `HeaderComponent` displays the application title "Operational & Insight Dashboard"
- [ ] Disclaimer banner is visible on all pages: "All signals are illustrative only and do not constitute clinical decision support"
- [ ] Disclaimer banner is styled distinctly (amber background or equivalent Material colour)

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| Router navigates to `/` and `DashboardComponent` is activated | unit (RouterTestingModule) | routing |
| Router navigates to `**` unknown path and redirects to `/` | unit | fallback route |
| `HeaderComponent` renders the title string | unit | header content |
| Disclaimer text is present in the `AppComponent` template | unit | legal requirement E-01 |

**File Scope** (≤ 5)
- `src/app/app.routes.ts`
- `src/app/app.component.ts` + `app.component.html`
- `src/app/shared/header/header.component.ts` + `header.component.html`

---

### T-06 — KPI Bar component (Feature Area A)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 4 — KPI Bar

**Description:**  
Build `KpiBarComponent` displaying the three KPI tiles from Feature Area A. The component receives data from `OperationalSnapshotService` and `PipelineFreshnessService` and displays: total encounters, count of OVER_CAPACITY units, and pipeline health score. The pipeline score tile turns red when any source is MISSING.

**Acceptance Criteria**
- [ ] Total encounter count is the sum of `encounterCount` from the latest snapshot per unit
- [ ] OVER_CAPACITY unit count matches the number of units whose latest snapshot has `capacityStatus === 'OVER_CAPACITY'`
- [ ] Pipeline health score displays as "N of 8 sources FRESH"
- [ ] Pipeline score tile has red background / red text when `missing > 0`
- [ ] All three tiles are visible simultaneously on a 1280px wide viewport
- [ ] Numbers update reactively — no manual refresh required

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| Component renders three tiles | unit | structure |
| Total encounter count reflects sum of `encounterCount` from mock `getLatestPerUnit()` result | unit | A-01 |
| OVER_CAPACITY count is correct for the mock data | unit | A-02 |
| Pipeline score text reads "5 of 8 sources FRESH" for mock data | unit | A-03 |
| Pipeline tile has `color: red` class when `missing > 0` | unit | A-04 |

**File Scope** (≤ 5)
- `src/app/shared/kpi-bar/kpi-bar.component.ts`
- `src/app/shared/kpi-bar/kpi-bar.component.html`
- `src/app/shared/kpi-bar/kpi-bar.component.spec.ts`

---

### T-07 — Capacity bar chart component (Feature B-01, B-02)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 5 — Demand & Capacity

**Description:**  
Build `CapacityChartComponent` using ng2-charts to render a grouped bar chart of demand and capacity side by side for all 10 service units. Bar colours reflect capacity status per BLUEPRINT.md §3 Feature B-02. The component accepts `OperationalSnapshot[]` as an input (latest per unit) — it does not fetch data itself.

**Acceptance Criteria**
- [ ] Chart renders with two bar groups (demand, capacity) for each of the 10 service units
- [ ] X-axis labels are the `serviceUnit` names
- [ ] Demand bars are consistently coloured (e.g., Material blue)
- [ ] Capacity bar colour reflects the unit's `capacityStatus`: OVER_CAPACITY = red, AT_CAPACITY = amber, UNDER_CAPACITY = green
- [ ] Chart is responsive and fills its container width
- [ ] Component has a clearly typed `@Input() snapshots: OperationalSnapshot[]`

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| Component renders without error given 10 mock snapshots | unit | smoke |
| Chart dataset has 10 labels matching the service unit names | unit | B-01 |
| Demand dataset values match `snapshot.demand` for each unit | unit | B-01 |
| Background colours array includes red for an OVER_CAPACITY unit | unit | B-02 |

**File Scope** (≤ 5)
- `src/app/features/dashboard/capacity-chart/capacity-chart.component.ts`
- `src/app/features/dashboard/capacity-chart/capacity-chart.component.html`
- `src/app/features/dashboard/capacity-chart/capacity-chart.component.spec.ts`

---

### T-08 — Service unit card component (Feature B-03)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 5 — Demand & Capacity

**Description:**  
Build `ServiceUnitCardComponent` as an Angular Material card that displays all fields for a single service unit snapshot plus derived metrics. Accepts one `OperationalSnapshot` as input and uses `DerivedMetricsService` to display `returnVisitRate`. The capacity status badge must be colour-coded.

**Acceptance Criteria**
- [ ] Card displays: service unit name, demand, capacity, encounterCount, returnVisitCount
- [ ] `returnVisitRate` is displayed as a percentage to one decimal place (e.g., "18.5%")
- [ ] `capacityStatus` is shown as a badge: red chip for OVER_CAPACITY, amber for AT_CAPACITY, green for UNDER_CAPACITY
- [ ] Component has a typed `@Input() snapshot: OperationalSnapshot`
- [ ] Card has a visible boundary (Material card elevation or border)

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| Component renders the service unit name | unit | B-03 |
| `returnVisitRate` is displayed as "18.5%" for `returnVisitCount=38, encounterCount=205` | unit | B-03 + derived metric |
| OVER_CAPACITY snapshot shows a red badge | unit | B-02 badge |
| AT_CAPACITY snapshot shows an amber badge | unit | B-02 badge |

**File Scope** (≤ 5)
- `src/app/features/dashboard/service-unit-card/service-unit-card.component.ts`
- `src/app/features/dashboard/service-unit-card/service-unit-card.component.html`
- `src/app/features/dashboard/service-unit-card/service-unit-card.component.spec.ts`

---

### T-09 — Dashboard page: assemble chart, cards, filter, and sort (Feature B-04, B-05)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 5 — Demand & Capacity

**Description:**  
Assemble `DashboardComponent` to host `KpiBarComponent`, `CapacityChartComponent`, filter/sort controls, and a list of `ServiceUnitCardComponent` instances. This component is the owner of the data subscription and passes data down as inputs.

**Acceptance Criteria**
- [ ] `KpiBarComponent` is rendered at the top of the page
- [ ] `CapacityChartComponent` renders below the KPI bar
- [ ] All 10 service unit cards render below the chart by default
- [ ] Filter dropdown offers: All / OVER_CAPACITY / AT_CAPACITY / UNDER_CAPACITY
- [ ] Selecting a filter hides cards that do not match the selected status
- [ ] Sort dropdown offers: Default / Demand (high to low) / Return Visit Rate (high to low)
- [ ] Selecting a sort reorders the visible cards immediately

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| 10 cards render when filter is "All" | unit | B-03 |
| Filtering to "OVER_CAPACITY" hides AT_CAPACITY and UNDER_CAPACITY cards | unit | B-04 |
| Sorting by demand puts the unit with highest demand first | unit | B-05 |
| Sorting by return visit rate puts the unit with highest rate first | unit | B-05 |

**File Scope** (≤ 5)
- `src/app/features/dashboard/dashboard.component.ts`
- `src/app/features/dashboard/dashboard.component.html`
- `src/app/features/dashboard/dashboard.component.spec.ts`

---

### T-10 — Trend component: time-series chart (Feature Area C)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 6 — Trend Analysis

**Description:**  
Build `TrendComponent` as a lazy-loaded page that renders a time-series line chart for the selected service unit using ng2-charts. A dropdown allows switching between service units. The route param `:unit` pre-selects the unit on navigation from the dashboard.

**Acceptance Criteria**
- [ ] Line chart shows demand and capacity over time for the selected service unit
- [ ] X-axis displays dates formatted as `dd MMM` (e.g., "19 Mar")
- [ ] Dropdown is pre-selected to the unit from the route param `:unit`
- [ ] Changing the dropdown updates the chart data without a page reload
- [ ] Encounter count and return-visit count are available as toggleable secondary series (checkbox or toggle)
- [ ] A "Back to Dashboard" navigation link is present

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| Component initialises with the service unit from the route param | unit (with ActivatedRoute stub) | C-02 |
| Chart dataset labels are sorted date strings | unit | C-01 |
| Demand line dataset values match the `demand` field for each snapshot date | unit | C-01 |
| Changing the dropdown emits new data to the chart | unit | C-02 |
| Secondary series are hidden by default | unit | C-04 |

**File Scope** (≤ 5)
- `src/app/features/trend/trend.component.ts`
- `src/app/features/trend/trend.component.html`
- `src/app/features/trend/trend.component.spec.ts`

---

### T-11 — Pipeline rows and alert banners (Feature D-01 to D-05)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 7 — Pipeline Health

**Description:**  
Build `PipelineRowComponent` as a reusable row for a single source system, and the alert banner logic within `PipelineComponent`. All lag calculations are delegated to `DerivedMetricsService`. Rows are sorted MISSING → STALE → FRESH.

**Acceptance Criteria**
- [ ] Each row displays: source system name, status badge, formatted `lastIngestedAt`, expected frequency, calculated `lagMinutes`, and record count
- [ ] Claims_Feed row shows "—" for last ingested time and a MISSING badge
- [ ] Rows are sorted: MISSING first, then STALE, then FRESH
- [ ] A red banner appears at the top of the panel when any source is MISSING
- [ ] An amber banner appears when any source is STALE and none are MISSING
- [ ] No banner appears when all sources are FRESH
- [ ] Status badges are colour-coded: MISSING = red, STALE = amber, FRESH = green

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| `PipelineRowComponent` renders "—" when `lastIngestedAt` is null | unit | D-05 |
| `PipelineRowComponent` shows a MISSING badge for Claims_Feed | unit | D-01 |
| Rows are ordered MISSING, STALE, FRESH in the rendered list | unit | D-02 |
| Red banner is present in the DOM when at least one source is MISSING | unit | D-03 |
| Amber banner is present when stale > 0 and missing === 0 | unit | D-04 |
| No banner element is present when all sources are FRESH | unit | D-04 boundary |

**File Scope** (≤ 5)
- `src/app/features/pipeline/pipeline-row/pipeline-row.component.ts`
- `src/app/features/pipeline/pipeline-row/pipeline-row.component.html`
- `src/app/features/pipeline/pipeline-row/pipeline-row.component.spec.ts`

---

### T-12 — Pipeline page: assemble table and wire to service (Feature Area D)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 7 — Pipeline Health

**Description:**  
Build `PipelineComponent` as the lazy-loaded page that subscribes to `PipelineFreshnessService`, passes data to `PipelineRowComponent` instances, and renders the summary score and alert banners. A "Back to Dashboard" navigation link is present.

**Acceptance Criteria**
- [ ] All 8 source system rows are rendered
- [ ] Summary score from `getSummary()` is displayed (e.g., "5 of 8 sources FRESH")
- [ ] Alert banners render correctly based on summary counts (see T-11 criteria)
- [ ] "Back to Dashboard" link navigates to `/`
- [ ] Page is accessible at `/pipeline` via lazy load

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| 8 `PipelineRowComponent` instances are rendered | unit | D-01 |
| Summary text reads "5 of 8 sources FRESH" from mock data | unit | A-03 |
| Red banner is visible with mock data (Claims_Feed MISSING) | unit | D-03 |

**File Scope** (≤ 5)
- `src/app/features/pipeline/pipeline.component.ts`
- `src/app/features/pipeline/pipeline.component.html`
- `src/app/features/pipeline/pipeline.component.spec.ts`

---

### T-13 — Responsive layout and cross-cutting polish (Feature Area E)

**Status:** `[ ]`  
**Domain:** `presentation`  
**Epic:** 8 — Cross-cutting & Polish

**Description:**  
Apply responsive layout using Angular Material's grid or flex utilities. Ensure the dashboard is usable at 1280px+ and remains readable at 768px. Add the last-data-refresh timestamp to the header (Feature E-03). This is a finishing task — all earlier tasks should be complete first.

**Acceptance Criteria**
- [ ] At 1280px, the KPI bar shows three tiles side by side
- [ ] At 1280px, service unit cards display in a multi-column grid (at least 3 columns)
- [ ] At 768px, cards stack to a single column without horizontal overflow
- [ ] `HeaderComponent` displays a formatted "Data as of: 17 Apr 2026 00:27" timestamp (derived from the most recent `lastIngestedAt` across all pipeline sources)
- [ ] Disclaimer banner spans the full width of the page on all breakpoints
- [ ] No horizontal scroll bar appears at 768px or wider

**TDD Plan**
| Test | Type | Covers |
|---|---|---|
| `HeaderComponent` displays a non-empty timestamp string | unit | E-03 |
| Timestamp is derived from the latest `lastIngestedAt` across all pipeline records | unit | E-03 logic |
| Disclaimer text is present in the rendered DOM at all routes | unit | E-01 |

**File Scope** (≤ 5)
- `src/app/shared/header/header.component.ts` (update)
- `src/app/shared/header/header.component.spec.ts`
- `src/app/app.component.html` (layout wrapper)
- `src/styles.scss` (global breakpoint utilities if needed)

---

## Definition of Done (applies to every task)

- [ ] All acceptance criteria for the task are met and manually verified
- [ ] All tests listed in the TDD Plan exist and pass (`ng test --watch=false`)
- [ ] `ng build` produces zero errors and zero warnings
- [ ] No `any` types introduced
- [ ] Code reviewed by at least one other person or agent before the task status is set to `[x]`
- [ ] No changes made outside the declared **File Scope** without a noted reason
