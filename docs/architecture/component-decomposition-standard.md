# Component Decomposition Standard

## 1) Scope and Intent
- Applies to all frontend screens in `shap_legal_ai_web`.
- Defines how to decompose large screens into maintainable Angular components without regressions.
- Must be followed together with:
  - `docs/architecture/frontend-system-instructions.md`
  - `docs/architecture/frontend-feature-playbook.md`
  - `docs/architecture/frontend-pr-checklist.md`

## 2) Decomposition Goals
1. Improve readability by reducing page/template/service cognitive load.
2. Improve maintainability by isolating UI concerns and reducing change blast radius.
3. Improve scalability by enabling bounded, reusable view modules.
4. Preserve runtime behavior and contracts.

## 3) When Decomposition Is Required
1. Any page container above `350` TS lines requires decomposition plan in the PR.
2. Any page template above `450` HTML lines requires section extraction.
3. Any presentational UI component above `220` TS lines or `260` HTML lines requires split.
4. Any page template section repeated `2+` times must be extracted as a reusable UI component.
5. Any page containing more than one independent concern (rail/workspace/editor/status/dialogs) must split by concern.

## 4) Extraction Boundaries and Ownership
1. `pages/*` remain command-dispatch + VM binding only.
2. `ui/*` components are presentational only: `OnPush`, service-free, input/output only.
3. Async orchestration remains in flow/command services.
4. Store ownership remains authoritative by domain (query/editor/ops/ui).
5. Mutable form refs remain in flow services, not stores and not UI components.

## 5) Contract-First Extraction Workflow
1. Define component purpose in one sentence and scope it to one responsibility.
2. Define typed input/output contract before moving template markup.
3. Move markup first, then move local display logic, then wire events.
4. Keep all side effects in existing flow/facade/store layers.
5. Replace duplicated local view state with VM-derived inputs.
6. Verify that parent page still binds one VM object and dispatch methods only.

## 6) Do / Don't Safety Rules
- Do:
  1. Keep routes/selectors/API contracts unchanged.
  2. Preserve event semantics when moving UI blocks.
  3. Add component unit tests before deleting original inline section.
- Don't:
  1. Inject facades/stores/services into `ui/*`.
  2. Move domain ownership into page local fields during extraction.
  3. Introduce template function calls in non-event bindings.

## 7) Regression Guard Pattern
1. For each extracted section, add a page integration assertion that rendered behavior and command dispatch are unchanged.
2. Add unit specs for new `ui/*` component inputs/outputs and empty/loading/error rendering.
3. Add at least one flow/store spec if extraction changed orchestration trigger path.
4. Add allowlist entry only when absolutely required, with owner, reason, expiry, backlog link.

## 8) Strict CI Enforcement
- Enforced by `scripts/lint-architecture.mjs` and `scripts/lint-architecture.allowlist.json`.
- Current decomposition gates:
  - `pages/*.page.ts <= 350`
  - `pages/*.page.html <= 450`
  - `ui/*.component.ts <= 220`
  - `ui/*.component.html <= 260`
  - `ui/*` components must be `OnPush`
  - `ui/*` components must not inject services/facades/stores/data-access clients
- Temporary exceptions are allowed only with explicit allowlist entries and expiry.

## 9) Definition of Done (Decomposition)
1. New or modified screens follow bounded decomposition thresholds.
2. Parent page remains thin (VM bind + command dispatch only).
3. No unauthorized architectural ownership shifts occurred.
4. Tests and lint gates pass.
