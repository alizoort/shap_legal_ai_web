# Frontend System Instructions

## 1) Scope and Source of Truth
- Applies to all code under `shap_legal_ai_web/src/app`.
- This document is the canonical frontend architecture contract.
- `AGENTS.md` is operational guidance only and must point back to this document.
- External contracts must stay stable unless explicitly approved:
  - routes
  - backend payload shapes and endpoints
  - sidebar navigation behavior

## 2) Default Architecture Model
- Use feature slices with this shape:
  - `pages/`
  - `ui/`
  - `state/`
  - `services/`
  - `mappers/`
  - `forms/`
  - `models/`
- Page containers are thin:
  - bind one VM signal
  - dispatch typed commands only
  - no business reconciliation logic
  - no direct API calls
- Facades compose the VM from stores and pure mappers.
- Flow/command services own async orchestration and side effects.

## 3) Component Rules
- Follow `docs/architecture/component-decomposition-standard.md` for extraction thresholds and workflow.
- Presentational components (`ui/*`) must:
  - use `ChangeDetectionStrategy.OnPush`
  - be service-free
  - communicate through `@Input`/`@Output`
- Container/page components must:
  - avoid local authoritative domain state
  - avoid template-triggered writes
  - avoid direct API calls
- Template rules:
  - no non-event function calls in template bindings
  - use `@let vm = pageVm();` and bind properties from `vm`

## 4) State Ownership Model
- Stores own authoritative serializable state.
- Facades expose one page VM and typed command dispatch.
- Flow services own network orchestration, optimistic transitions, and teardown.
- Mutable form refs belong in flow services, not root stores.
- No sink or mirror state in page components.

## 5) Async and Side Effect Rules
- API calls are allowed only in command/flow services and dedicated data-access layers.
- `pages/*` must not call API services directly.
- Store transitions must model deterministic loading, success, and error paths.
- Keep subscriptions and teardown ownership inside flow services, stores, or facade-level adapters only when required.

## 6) Browser and Platform Rules
- Default to `src/app/core/browser/*` adapters for DOM/browser access.
- Do not use direct `window`, `document`, `localStorage`, or `sessionStorage` in feature code.
- Temporary exceptions are allowed only through architecture allowlist entries with:
  - reason
  - owner
  - expiry date
  - remediation link

## 7) Clean Code and Size Boundaries
- File limits are enforced in architecture lint.
- Current hard caps:
  - `pages/*.page.ts <= 350`
  - `pages/*.page.html <= 450`
  - `ui/*.component.ts <= 220`
  - `ui/*.component.html <= 260`
  - `state/*facade.ts <= 550`
  - `services/*(flow|commands|dispatcher).service.ts <= 550`
- Transitional exceptions must live in `scripts/lint-architecture.allowlist.json`.
- Duplicate contract/type definitions across `*.vm.ts` and `*contracts.ts` are forbidden unless temporarily allowlisted.

## 8) Testing Standards
- Minimum tests for each new slice:
  - store specs for transitions
  - flow/command service specs for orchestration
  - page integration spec validating VM binding and command dispatch only
- If routes are touched, add or adjust route compatibility tests.
- Architecture lint itself must have regression fixtures (`npm run lint:arch:regression`).

## 9) Exception Policy
- No silent exceptions.
- Every exception must be allowlisted with expiry.
- No new exception types without architecture review.
- Expired exceptions fail CI.
- Changes to protected decomposition standard docs require architecture-owner approval (`npm run lint:arch:owner` in CI).

## 10) Definition of Done
- Single VM page binding.
- Clear state ownership with no split-brain mirrors.
- OnPush presentational components.
- No direct browser globals in feature layers.
- Lint, typecheck, and unit tests pass.
