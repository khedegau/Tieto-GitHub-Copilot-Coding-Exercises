# Backlog Item

## Task Identity
- Task ID: `T-XX`
- Title: `<exact task title from developer_todo.md>`
- Status: `[ ]` / `[-]`
- Epic: `<number and name exactly as listed in developer_todo.md>`
- Domain: `<infrastructure | data-layer | business-logic | presentation>`
- Blueprint References: `<section(s) in BLUEPRINT.md used for this item>`

## Why This Is Next
<!-- 2-4 bullets. Explain sequence and dependency order from developer_todo.md. -->
- 
- 

## Description
<!-- 2-4 sentences. Keep wording consistent with the selected task in developer_todo.md. -->

## Acceptance Criteria
<!-- Copy from developer_todo.md for the selected task. Do not invent or drop criteria. -->
- [ ] 
- [ ] 
- [ ] 

## TDD Plan
<!-- Copy test rows from developer_todo.md for the selected task. -->
| Test | Type | Covers |
|---|---|---|
|  | unit |  |

## Implementation Notes
<!-- Keep this short and deterministic. Reference blueprint constraints when relevant. -->
- Tech/architecture constraints:
	- Angular 17+ standalone components only
	- Angular Material UI primitives
	- `ng2-charts`/`chart.js` for charting when applicable
	- No backend; assets under `/assets/data`; no runtime mutation of JSON
- Data/services constraints:
	- Services are `providedIn: 'root'`
	- Shared data loading should use `shareReplay(1)` where applicable
	- No `any` types

## File Scope
<!-- Copy from selected task. Keep scope <= 5 files unless explicitly justified. -->
- 
- 

## Readiness Check
- [ ] File Scope is <= 5 files
- [ ] Upstream dependency tasks are complete (or this item is explicitly blocked)
- [ ] Test strategy is executable in current workspace
- [ ] Required routes/components/services match BLUEPRINT.md naming

## Risks / Unknowns
<!-- List open questions that require human decision before implementation. -->
- 

## Handoff
<!-- Keep this concise and actionable for the implementation agent. -->
- Primary objective:
- Out of scope:
- Validation commands:
	- `ng test --watch=false`
	- `ng build`

## Definition of Done
- [ ] All acceptance criteria for the task are met and manually verified
- [ ] All tests listed in the TDD Plan exist and pass (`ng test --watch=false`)
- [ ] `ng build` produces zero errors and zero warnings
- [ ] No `any` types introduced
- [ ] Code reviewed by at least one other person or agent before task status is set to `[x]`
- [ ] No changes made outside the declared File Scope without a noted reason
