# Frontend Feature Playbook

## 1) Definition of Ready
- Confirm route/API/embed compatibility constraints.
- Identify state domains:
  - query
  - editor
  - ops
  - ui
- Define ownership per domain before coding.
- Define VM contract in `state/*.vm.ts`.

## 2) Scaffold the Slice
Create this structure first:

```text
feature/
  pages/
  ui/
  state/
  services/
  mappers/
  forms/
  models/
```

Required first files:
- `state/<feature>.vm.ts`
- `state/<feature>.facade.ts`
- `pages/<feature>.page.ts`
- `pages/<feature>.page.html`
- one store and one flow service with matching specs

## 3) Implement by Ownership
- Put entity load/select/reconcile transitions in query store.
- Put form refs and snapshots in editor flow service.
- Put serializable editor flags in editor store.
- Put async command orchestration in flow/commands services.
- Keep page as VM bind + command dispatch.

## 4) VM Composition
- Compose one page VM in facade from stores + pure mappers.
- Template should read only from `vm`.
- Avoid heavy computed logic in template path.

## 5) Component Practices
- `ui/*` components:
  - OnPush
  - no services
  - no direct API calls
- Split repeated or complex sections into presentational components.
- Use `docs/architecture/component-decomposition-standard.md` when:
  - page TS > 350
  - page HTML > 450
  - UI component TS > 220
  - UI component HTML > 260

## 5.1) Required Decomposition Deliverable
- If any threshold is exceeded, add `docs/architecture/templates/component-extraction-plan-template.md`
  content to the PR description (or attach as PR artifact) before merge.

## 6) Browser/DOM Access
- Use browser adapters from `core/browser/*`.
- If an exception is unavoidable, add temporary allowlist entry with expiry before merge.

## 7) Validation Before PR
Run:

```bash
npm run lint:arch
npm run lint:arch:regression
npm run typecheck:app
npm run typecheck:spec
npm run test:unit
```

If routes changed, run:

```bash
npm run test:route-compat
```

## 8) Definition of Done
- Ownership is explicit and enforced.
- No page-owned authoritative state.
- Single VM binding in page template.
- Required tests added and passing.
- No new allowlist exceptions unless approved with expiry.
