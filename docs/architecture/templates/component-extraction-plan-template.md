# Component Extraction Plan Template

Use this template in PR description when decomposition thresholds are exceeded.

## 1) Screen and Trigger
- Screen/page:
- Triggered by threshold:
  - [ ] page TS > 350
  - [ ] page HTML > 450
  - [ ] ui TS > 220
  - [ ] ui HTML > 260
- Current sizes (TS/HTML):

## 2) Contract Safety
- External routes changed: [ ] Yes [ ] No
- Backend payload/endpoints changed: [ ] Yes [ ] No
- Embed behavior changed: [ ] Yes [ ] No
- Selector/public API changes: [ ] Yes [ ] No

## 3) Target Decomposition Map
- Parent page responsibilities after extraction:
- Components to extract:
  1.
  2.
  3.
- Responsibility of each extracted component (single sentence each):

## 4) Ownership Boundaries
- Page remains: VM binding + command dispatch only.
- Stores/flows touched:
  - Query:
  - Editor:
  - Ops:
  - UI:
- Side effects remain in flow/command services: [ ] Confirmed

## 5) Migration Sequence
1. Extract static structure sections.
2. Extract repeated cards/lists.
3. Extract editor/status/action sections.
4. Remove obsolete inline blocks.

## 6) Test Plan
- Component unit specs:
- Page integration assertions:
- Store/flow regressions added:
- NG0600/NG0103 guard checks:

## 7) Temporary Exceptions (if any)
- Allowlist entries added:
  - file/name:
  - reason:
  - owner:
  - expiresOn:
  - backlog link:

## 8) Final Result
- Parent page size after extraction:
- Template size after extraction:
- Remaining debt (if any):
