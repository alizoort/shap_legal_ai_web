# Page VM Template

Use this contract pattern in `state/<feature>.vm.ts`.

```ts
export interface <Feature>PageVm {
  rail: <Feature>RailVm;
  workspace: <Feature>WorkspaceVm;
  outline: <Feature>OutlineVm;
  editor: <Feature>EditorVm;
  status: <Feature>StatusVm;
  mobile: <Feature>MobileVm;
  dialogs: <Feature>DialogsVm;
}

export interface <Feature>StatusVm {
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
}
```

Facade pattern:

```ts
readonly pageVm = computed<<Feature>PageVm>(() =>
  build<Feature>PageVm({
    query: this.queryStore.snapshot(),
    editor: this.editorStore.snapshot(),
    ops: this.opsStore.snapshot(),
    ui: this.uiStore.snapshot(),
  })
);
```

Page pattern:

```ts
readonly pageVm = this.<feature>Facade.pageVm;

onSelect(id: number): void {
  this.<feature>Facade.select(id);
}
```
