# Store/Flow Boundary Template

## Ownership Matrix
- Query Store:
  - entities
  - selection
  - expansion
  - loading/error
  - deterministic post-load reconciliation
- Editor Flow Service:
  - form creation/replacement
  - form stream subscriptions
  - snapshot baseline lifecycle
- Editor Store:
  - dirty/valid/saving/error/lastSaved flags
- Ops Flow Service:
  - async orchestration for import/export/upload/ingestion/prereq
- Ops Store:
  - operation status and user-visible progress/error state
- UI Store:
  - panel/tab/mobile/display toggles

## Command Contract
- Facade exposes typed commands only.
- Each command returns `void` or `Promise<CommandResult>`.
- Command handlers update stores through explicit transitions.

```ts
export interface CommandResult {
  ok: boolean;
  errorKey?: string;
  details?: string;
}
```

## Non-Goals
- Page should not own authoritative state.
- Page should not run reconciliation logic.
- Stores should not hold long-lived mutable form references.
