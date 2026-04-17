# GitHub Copilot Agent-Driven Development Workshop

A hands-on workshop where participants build a project prototype entirely through an agentic workflow — using GitHub Copilot's Ask, Plan, and Agent modes together with specialist agents, reusable skills, and a strict TDD loop. No implementation code is provided; everything is produced through structured AI collaboration.

---

## Contents

- [Learning Goals](#learning-goals)
- [Choosing Your Project](#choosing-your-project)
- [Getting Started](#getting-started)
- [Project 1 — Care Pathway Flow & Bottleneck Dashboard](#project-1--care-pathway-flow--bottleneck-dashboard)
- [Project 2 — Patient & Operational Insights Dashboard](#project-2--patient--operational-insights-dashboard-data-platform)
- [Project 3 — Legacy System Modernisation](#project-3--legacy-system-modernisation-migrate--modernize-track)
- [Mock Data Strategy](#mock-data-strategy)

---

## Learning Goals

- **Use the Right Mode**: Know when to reach for Ask (sparring partner), Plan (review before execution), or Agent (direct execution), and why the distinction matters
- **Blueprint Before Building**: Use AI to produce `BLUEPRINT.md` and `developer_todo.md` before writing a single line of implementation code
- **Author Specialist Agents**: Create focused agents with clearly defined responsibilities, minimal tool sets, and explicit domain boundaries
- **Replace Guesswork with Skills**: Build reusable skills that give agents deterministic capabilities — consistent backlog item structure, correct test execution, reliable project state
- **Implement End-to-End with TDD**: Drive one backlog item from data layer through to a tested UI component using the strict test-first loop

---

## Choosing Your Project

| | Project 1 | Project 2 | Project 3 |
|---|---|---|---|
| **Name** | Care Pathway Flow & Bottleneck Dashboard | Patient & Operational Insights Dashboard | Legacy System Modernisation |
| **Data Source** | Static JSON data files (provided) | Static JSON data files (provided) | External open-source starter repos (choose one) |
| **Data Focus** | Case throughput, waiting times, rework | Demand vs capacity, repeat encounters, pipeline freshness | Code migration |
| **AI Integration** | Display only | Display + trend analysis | Migration planning + code generation |
| **Best For** | Learning the agentic workflow basics | Complex domain modelling and multi-source data | Modernising legacy systems with AI |

#### 🌱 Greenfield — Bring Your Own Idea
 
Not interested in the predefined projects? Have a project idea you've been wanting to build? This is your chance! Build something from scratch with the help of GitHub Copilot. Our team will be on hand to help you along the way — just raise your hand or find us in the breakout rooms.
 
> **💡 Tip:** Not sure what to build? Use **Plan Mode** in GitHub Copilot (press `Shift+Tab` in the CLI or select "Plan" in VS Code Copilot Chat) to brainstorm and spar with Copilot. Describe your interests or problem domain and let Copilot help you shape an idea, outline an architecture, and break it down into actionable steps — before writing a single line of code!


#### 🛠️ GitHub Copilot For Beginners
 
Want to start from the basics? Follow a guided, hands-on workshop to learn GitHub Copilot from the ground up using the CLI:
 
👉 **[Copilot CLI for Beginners](https://github.com/github/copilot-cli-for-beginners/)**
 
> **Note:** The techniques and patterns you learn in this workshop apply equally to VS Code with GitHub Copilot — completions, chat, and agent mode all work the same way. Feel free to follow along in whichever tool you prefer!
---

## Getting Started

1. **Choose your project** from the table above
2. **Review the mock data schema** for your chosen project (defined in each project section below)
3. **Follow the guide for your track**:
   - **Projects 1 & 2**: Use [AGENTIC_WORKFLOW.md](AGENTIC_WORKFLOW.md) as your step-by-step guide through blueprinting, instruction authoring, specialist agent creation, and feature implementation. **Can be used for Greenfield projects too!**
   - **Project 3**: Use [MIGRATION.md](MIGRATION.md) as your step-by-step guide through source analysis, migration planning, incremental code transformation, and validation.

---

## Project 1 — Care Pathway Flow & Bottleneck Dashboard

### Objective

Build a web application that helps service owners and operational excellence teams identify where cases slow down across care delivery stages. Mock data is provided as static JSON files — no backend to build.

### Goal

Practice the agentic workflow to develop a complete, functional web application from initial specification through to a working frontend — using the provided `data/care-pathways.json` as your data source.

### Scenario

Care delivery involves multiple stages: assessment, planning, execution, and follow-up. You are a developer embedded in an operational excellence team. Service owners need to see where cases wait longest, which stages cause the most rework, and how predictable throughput is across the service. The team wants an at-a-glance view of the end-to-end pathway alongside a bottleneck heatmap and an exception list for cases stuck beyond an acceptable threshold.

### Primary Questions
- Where do cases wait longest?
- Which stages cause most rework?
- How predictable is throughput?

### Required Features

#### 1. Pathway Search and Case Retrieval
- Accept input by case ID or pathway type
- Load mock case data from the provided `data/care-pathways.json` file
- Display current stage, waiting time accumulation, and rework flags per case
- Handle missing cases and empty stage histories gracefully

#### 2. End-to-End Pathway Timeline
- Visualise the full journey of a case across all stages (ASSESSMENT → PLANNING → EXECUTION → FOLLOW_UP → COMPLETED)
- Show time spent and waiting time at each stage
- Highlight stages where a case has stalled beyond a configurable threshold
- Display key KPIs: average lead time per pathway, waiting time per stage, rework rate (%)

#### 3. Bottleneck Heatmap & Exception List
- Render a heatmap showing stage-level congestion across all active cases
- Present a ranked exception list of cases stuck beyond the threshold, sorted by waiting time
- Show completed cases per day/week as a bar or sparkline chart
- Allow filtering by pathway type and date range

### Mock Data Schema

```
CasePathway
  caseId            : UUID
  patientRef        : String (anonymised)
  pathwayType       : Enum (URGENT, ROUTINE, ELECTIVE)
  currentStage      : Enum (ASSESSMENT, PLANNING, EXECUTION, FOLLOW_UP, COMPLETED)
  startDate         : Instant
  endDate           : Instant (nullable)
  totalLeadTimeHours : Integer
  stages            : List<StageEvent>

StageEvent
  stageId           : UUID
  stageName         : Enum (ASSESSMENT, PLANNING, EXECUTION, FOLLOW_UP)
  enteredAt         : Instant
  exitedAt          : Instant (nullable)
  waitingTimeHours  : Integer
  reworkFlag        : Boolean
  reworkReason      : String (nullable)
```

Seed data: Provided as `data/care-pathways.json`.

---

## Project 2 — Patient & Operational Insights Dashboard (Data Platform)

### Objective

Build a high-level operational and insight dashboard that helps data & AI leads and transformation programme teams understand demand vs capacity, spot emerging trends early, and monitor data pipeline health. Mock data is provided as static JSON files — no backend to build.

> **Note:** No clinical decision support is implied. All signals are illustrative only.

### Goal

Practice the agentic workflow to develop a complete, functional web application. Learn to decompose a complex multi-source domain into manageable epics and tasks while maintaining consistency through shared documentation artefacts (`BLUEPRINT.md`, `developer_todo.md`). Use the provided `data/operational-snapshots.json` and `data/pipeline-freshness.json` as your data sources.

### Scenario

Healthcare data comes from many systems. You are a developer on a data platform team. Management and transformation programme leads need a single operational view that shows how current demand compares to capacity, which trends require early attention, and whether the underlying data pipelines are delivering fresh, reliable data. The dashboard should surface high-level cohort counts and repeat encounter patterns — all from unified, pre-processed data.

### Primary Questions
- How does current demand compare to capacity?
- Which trends require early attention?
- Is incoming data fresh and reliable?

### Required Features

#### 1. Operational Overview
- Load data from `data/operational-snapshots.json` and `data/pipeline-freshness.json`
- Display demand vs capacity per service unit with colour-coded status (UNDER_CAPACITY / AT_CAPACITY / OVER_CAPACITY)
- Show high-level cohort counts (e.g., active cases, pending referrals, completed encounters)
- Surface return visit / repeat encounter rates alongside total encounter counts
- Handle stale or missing data gracefully with visible indicators

#### 2. Trend Analysis Over Time
- Present time-series charts for demand, capacity, and encounter volume over a rolling 30-day window
- Highlight periods where demand exceeded capacity
- Show repeat encounter rate trends and flag cohorts with notable changes
- Allow filtering by service unit and date range

#### 3. Data Ingestion Monitoring
- Display pipeline freshness status per source system: **FRESH / STALE / MISSING**
- Show last ingestion timestamp and expected ingestion frequency
- Render a summary health indicator for the overall data platform
- List source systems with overdue ingestion sorted by staleness severity

### Mock Data Schema

```
OperationalSnapshot
  snapshotId          : UUID
  recordedAt          : Instant
  serviceUnit         : String
  demand              : Integer
  capacity            : Integer
  encounterCount      : Integer
  returnVisitCount    : Integer
  capacityStatus      : Enum (UNDER_CAPACITY, AT_CAPACITY, OVER_CAPACITY)

CohortCount
  cohortId            : UUID
  label               : String
  count               : Integer
  recordedDate        : LocalDate
  serviceUnit         : String

PipelineFreshness
  sourceSystem        : String
  lastIngestedAt      : Instant
  expectedFrequencyMinutes : Integer
  status              : Enum (FRESH, STALE, MISSING)
  recordCount         : Integer
```

Seed data: Operational snapshots covering 10 service units over a rolling 30-day window; pipeline freshness records for 8 source systems including pre-configured STALE and MISSING states. Provided as `data/operational-snapshots.json` and `data/pipeline-freshness.json`.

---

## Project 3 — Legacy System Modernisation (Migrate & Modernize Track)

### Objective

Use GitHub Copilot as your migration co-pilot to modernise a real open-source codebase. Clone one of the three provided starter repositories, analyse it with Copilot's help, generate a migration plan, execute incremental refactoring steps, and validate the modernised application — all driven by isolated agent tasks.

### Goal

Practice the agentic workflow in a real-world migration context. Rather than building from scratch, you will analyse an actual public codebase, identify what needs to change, and drive the transformation layer by layer using structured AI collaboration.

### Starter Repositories — Choose One

| Option | Repository | Source Stack | Suggested Migration Target |
|---|---|---|---|
| **A** | [ContosoUniversity](https://github.com/jasontaylordev/ContosoUniversity) | .NET 6 / ASP.NET Razor Pages / EF Core / C# | .NET 8 Minimal API + React frontend (decoupled SPA) |
| **B** | [uportal-messaging](https://github.com/UW-Madison-DoIT/uportal-messaging) | Java / Spring Boot 2.x / Maven / JUnit 4 | Spring Boot 3.x + Spring Data JPA + JUnit 5 + Actuator |
| **C** | [docraptor-java](https://github.com/DocRaptor/docraptor-java) | Java / OpenAPI-generated client / Gradle | Java 21 + Spring Boot 3.x wrapper service + REST API |

Fork your chosen repository and use it as your migration baseline.

### Migration Guide

Follow [MIGRATION.md](MIGRATION.md) as your step-by-step guide throughout this track. The table below maps each deliverable to the relevant section:

### Technical Migration Path by Option

**Option A — ContosoUniversity (.NET)**

| Phase | From | To |
|---|---|---|
| Architecture | Razor Pages monolith | Minimal API backend + React SPA |
| Data access | EF Core + DbContext in pages | Repository pattern + EF Core 8 |
| API layer | Page handlers | `app.MapGroup()` Minimal API endpoints |
| Error handling | Page-level try/catch | `IProblemDetailsService` middleware |
| Testing | xUnit + in-process | xUnit + `WebApplicationFactory` |

**Option B — uportal-messaging (Java)**

| Phase | From | To |
|---|---|---|
| Boot version | Spring Boot 2.x | Spring Boot 3.x |
| Data access | JPA / JDBC (older patterns) | Spring Data JPA + `@Repository` |
| REST layer | `@RestController` (review & modernise) | `@RestController` + OpenAPI docs |
| Error handling | Ad-hoc exception handling | `@ControllerAdvice` + RFC 7807 |
| Testing | JUnit 4 | JUnit 5 + `@SpringBootTest` |
| Observability | Basic logging | Spring Actuator + structured logging |

**Option C — docraptor-java (Java SDK → Service)**

| Phase | From | To |
|---|---|---|
| Structure | OpenAPI-generated client library | Spring Boot 3.x wrapper service |
| Java version | Java 8 | Java 21 |
| Build | Gradle (legacy config) | Gradle 8 + updated dependencies |
| API layer | None (library only) | `@RestController` REST endpoints |
| Testing | Basic JUnit | JUnit 5 + `@SpringBootTest` |
| Observability | None | Spring Actuator + structured logging |

---

## Mock Data Strategy

**Projects 1 & 2** use pre-generated static JSON files — no server or database setup required.

| Concern | Approach |
|---|---|
| Data files | Provided in `data/` at the repo root — load via `fetch('./data/<file>.json')` |
| Realistic values | Pre-generated: anonymised patient refs, service unit names, realistic timestamps and counts |
| Embedded patterns | Bottlenecks, capacity breaches, rework events, and stale pipeline states baked into the seed data intentionally |
| No server needed | All data is read directly from disk — no Spring Boot, no database |

**Project 3** uses a forked external open-source repository as its baseline — fork your chosen starter repo (see Project 3 section) and no separate data files are needed.

---