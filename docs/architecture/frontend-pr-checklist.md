# Frontend PR Checklist

## Architecture
- [ ] Page container is command-dispatch + VM bind only.
- [ ] Template binds one `vm` object and avoids non-event call expressions.
- [ ] State ownership is explicit (query/editor/ops/ui) with no page mirror state.
- [ ] Flow/command services own async orchestration and side effects.
- [ ] No `*Host` interface or page instance passing to adapters/services.
- [ ] Decomposition plan is included when any threshold is exceeded (see `component-decomposition-standard.md`).

## Components
- [ ] New `ui/*` components use `ChangeDetectionStrategy.OnPush`.
- [ ] Presentational components are service-free and input/output driven.
- [ ] No direct API usage from presentational components.
- [ ] `ui/*` components stay within decomposition caps (`220` TS / `260` HTML) or are allowlisted with expiry.

## Platform
- [ ] No direct `window/document/localStorage/sessionStorage` in feature code.
- [ ] Browser adapter used when platform interaction is needed.
- [ ] Any temporary exception is allowlisted with expiry and backlog reference.

## Contracts and Types
- [ ] No duplicated interface contracts across `*.vm.ts` and `*contracts.ts`.
- [ ] External route/backend/embed contracts remain unchanged, or changes are explicitly documented.

## Quality Gates
- [ ] `npm run lint:arch`
- [ ] `npm run lint:arch:regression`
- [ ] `npm run lint:arch:owner` (CI enforced for protected decomposition docs)
- [ ] `npm run typecheck:app`
- [ ] `npm run typecheck:spec`
- [ ] `npm run test:unit`
- [ ] `npm run test:route-compat` when routes were changed

## Evidence
- [ ] Added or updated store/flow/page specs.
- [ ] Included notes for performance/regression risks (NG0600/NG0103 classes) when relevant.
- [ ] For each extracted section, added page integration assertion for unchanged dispatch/render behavior.
