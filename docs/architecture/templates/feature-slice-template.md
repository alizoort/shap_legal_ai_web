# Feature Slice Template

Use this skeleton for new frontend modules.

```text
src/app/<domain>/<feature>/
  pages/
    <feature>.page.ts
    <feature>.page.html
    <feature>.page.sass
  ui/
    <feature>-panel/
      <feature>-panel.component.ts
      <feature>-panel.component.html
      <feature>-panel.component.sass
  state/
    <feature>.vm.ts
    <feature>.facade.ts
    <feature>-query.store.ts
    <feature>-editor.store.ts
    <feature>-ops.store.ts
    <feature>-ui.store.ts
  services/
    <feature>-selection-flow.service.ts
    <feature>-authoring-flow.service.ts
    <feature>-ops-flow.service.ts
  mappers/
    <feature>-vm.mapper.ts
  forms/
    <entity>-form.factory.ts
  models/
    <feature>.model.ts
```

Required specs:

```text
state/*.spec.ts
services/*.spec.ts
pages/*.spec.ts
```

Rules:
- Page consumes `pageVm` and dispatches commands only.
- Stores own authoritative serializable state.
- Flow services own orchestration and side effects.
- If page/UI size thresholds are exceeded, include `component-extraction-plan-template.md` in the PR.
