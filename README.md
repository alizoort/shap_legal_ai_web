# SHAP Legal AI Web

Angular 21 frontend scaffold for the SHAP Legal AI sidebar experience. This repository intentionally contains only the shell, feature-slice structure, architecture tooling, and a placeholder `legal-ai` vertical slice.

## WSL Node preflight

Run frontend commands only from a login shell so NVM is loaded:

```bash
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && which node npm npx'
```

Expected prefix:

```text
/home/canvasuser/.nvm/versions/node/.../bin/
```

If the shell resolves Windows wrappers or `node` is missing, fix the shell state first:

```bash
source ~/.profile && hash -r
```

Then rerun the command with `bash -lc '...'`.

## Development

```bash
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm install'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run start'
```

The development server runs on `http://localhost:4200`.

## Quality gates

```bash
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run lint'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run lint:arch'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run lint:arch:regression'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run lint:arch:owner'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run typecheck:app'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run typecheck:spec'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run test:unit'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run test:route-compat'
```

Playwright checks:

```bash
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run test:e2e'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run test:a11y'
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run test:visual'
```
