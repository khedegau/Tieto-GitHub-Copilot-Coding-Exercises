# Project Instructions

## Purpose
An Angular 17+ single-page application (SPA) that provides a unified operational and insight dashboard. The target audience is programme leads and data platform teams who need a single view of demand vs capacity, emerging trend signals, and data pipeline health — all sourced from pre-processed static JSON. There is no backend, no authentication, and no write surface. All data is illustrative.

---

## Architecture Constraints

- **No backend.** All data is loaded via `HttpClient` from `/assets/data/`. No external API calls.
- **No persistence.** Do not use `localStorage`, `sessionStorage`, or `IndexedDB`.
- **Read-only data.** JSON asset files are the single source of truth and must not be modified at runtime.
- **Angular 17+ standalone components only.** No `NgModule` declarations anywhere in the project.
- **Angular Material** is the only permitted UI component library. No custom CSS frameworks.
- **Charting** must use `ng2-charts` (Chart.js wrapper). No direct D3 usage.
- **BLUEPRINT.md** is the authoritative reference for data models, component names, route paths, and feature requirements. Read it before starting any task.

---

## Code Style

- **File naming:** `kebab-case` for all files — `my-feature.component.ts`, `my-data.service.ts`, `my-thing.model.ts`. Match names defined in BLUEPRINT.md exactly.
- **Folder structure:** Feature components live under `src/app/features/<feature>/`. Shared components live under `src/app/shared/`. Services and models live under `src/app/core/`.
- **No logic in templates.** Computed values, derived state, and conditional expressions belong in the component class or service. Templates bind only.
- **Strict typing throughout.** Every JSON response is typed against interfaces in `src/app/core/models/`. Never use `any`. `lastIngestedAt` is always `string | null`.
- **Services are singleton and lazy.** All services use `providedIn: 'root'`. Data loaded via HTTP is cached with `shareReplay(1)`.
- **Derived metrics are pure functions.** `DerivedMetricsService` contains only stateless, side-effect-free functions. No HTTP calls, no state mutations.
- **Lazy routes for non-dashboard pages.** `TrendComponent` and `PipelineComponent` are loaded via `loadComponent`. `DashboardComponent` is eager.
- **Barrel files** (`index.ts`) must re-export all public types within a folder.

---

## Error Handling

- Surface load failures as user-visible inline error states, not silent failures or console-only logs.
- Do not swallow `HttpClient` errors. Pipe through `catchError` and update a local error signal or observable so the template can display a fallback message.
- Validate data only at the service boundary where JSON is first consumed. Do not add defensive checks inside components or pure functions where the type is already guaranteed.
- Do not add error handling for scenarios that cannot happen given the read-only static-asset data model.

---

## Testing

- Every service method must have a corresponding unit test using `HttpClientTestingModule` or `HttpTestingController`.
- Every component must have a smoke-test that verifies it renders without errors.
- Derived metric functions in `DerivedMetricsService` must have unit tests covering edge cases (e.g., `encounterCount = 0`, `lastIngestedAt = null`).
- Tests live alongside the file they test: `my-feature.component.spec.ts` next to `my-feature.component.ts`.

---

## Commits & Documentation

- Commit message format: `<type>(<scope>): <short imperative summary>` — e.g., `feat(pipeline): add MISSING badge to pipeline row`, `fix(kpi-bar): correct fresh source count`.
- Valid types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`.
- Scope maps to the task ID or feature area from `developer_todo.md` — e.g., `T-06`, `dashboard`, `pipeline`.
- Do not add inline comments that merely restate what the code does. Comments are for *why*, not *what*.
- Do not add docstrings or JSDoc to code you did not write or change.

<!--
DO NOT include domain-specific rules here.
Those belong in .github/instructions/<domain>.instructions.md
-->
