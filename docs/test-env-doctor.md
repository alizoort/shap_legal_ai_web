# Test Environment Doctor

Run this before local unit/e2e test runs:

```bash
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run test:env:doctor'
```

The doctor checks:

- Linux runtime baseline.
- `node`, `npm`, `npx` resolution (WSL expects `/home/canvasuser/.nvm/versions/node/.../bin`).
- Linux Chrome/Chromium availability for Karma.
- Playwright Chromium resolution and cache path.

If the doctor reports WSL binary resolution errors:

```bash
source ~/.profile && hash -r
```

Then re-run command(s) through a login shell:

```bash
bash -lc 'cd /mnt/c/projects/shap_legal_ai/shap_legal_ai_web && npm run test:unit'
```
