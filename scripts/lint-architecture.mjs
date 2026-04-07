#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const roleLineCaps = [
  { role: 'page-ts', pattern: /^src\/app\/.*\/pages\/.*\.page\.ts$/, max: 350 },
  { role: 'page-html', pattern: /^src\/app\/.*\/pages\/.*\.page\.html$/, max: 450 },
  { role: 'ui-ts', pattern: /^src\/app\/.*\/ui\/.*\.component\.ts$/, max: 220 },
  { role: 'ui-html', pattern: /^src\/app\/.*\/ui\/.*\.component\.html$/, max: 260 },
  { role: 'facade-ts', pattern: /^src\/app\/.*\/state\/.*facade\.ts$/, max: 550 },
  { role: 'flow-command-service-ts', pattern: /^src\/app\/.*\/services\/.*(flow|commands|dispatcher)\.service\.ts$/, max: 550 },
];

const pageContainerPattern = /^src\/app\/.*\/pages\/.*\.page\.ts$/;
const uiComponentTsPattern = /^src\/app\/.*\/ui\/.*\.component\.ts$/;
const legacyAdapterImportPattern = /courses-admin-(selection|authoring|ops|editor)-adapter\.service/;
const templateInterpolationCallPattern = /\{\{[^}]*\b[A-Za-z_]\w*\s*\([^{}]*\)[^}]*\}\}/g;
const templatePropertyCallPattern = /\[(?!\()[^\]]+\]\s*=\s*"[^"]*\b[A-Za-z_]\w*\s*\([^"]*\)[^"]*"/g;
const browserGlobalPatterns = [
  /\bwindow\./,
  /\bdocument\./,
  /\blocalStorage\./,
  /\bsessionStorage\./,
  /\btypeof\s+window\b/,
  /\btypeof\s+document\b/,
];
const injectionTypePattern = /\b[A-Za-z_]\w*(Service|Facade|Store|Api|Client|Repository)\b/g;
const injectionTypeNamePattern = /\b[A-Za-z_]\w*(Service|Facade|Store|Api|Client|Repository)\b/;

function parseArgs(argv) {
  const args = {
    projectRoot: process.cwd(),
    srcRoot: 'src/app',
    allowlist: 'scripts/lint-architecture.allowlist.json',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === '--project-root' && next) {
      args.projectRoot = path.resolve(next);
      index += 1;
      continue;
    }
    if (token === '--src-root' && next) {
      args.srcRoot = next;
      index += 1;
      continue;
    }
    if (token === '--allowlist' && next) {
      args.allowlist = next;
      index += 1;
    }
  }

  return args;
}

function walkFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function createContext(config) {
  const projectRoot = path.resolve(config.projectRoot ?? process.cwd());
  const srcRoot = path.resolve(projectRoot, config.srcRoot ?? 'src/app');
  const sideBarRoot = path.join(srcRoot, 'side-bar');
  const allowlistPath = path.resolve(projectRoot, config.allowlist ?? 'scripts/lint-architecture.allowlist.json');
  const orchestrationServiceRoot = path.join(projectRoot, 'src/app/side-bar');

  const toProjectRelative = (filePath) => filePath.replace(`${projectRoot}${path.sep}`, '').split(path.sep).join('/');

  function readAllowlist() {
    const defaults = {
      maxLines: [],
      browserGlobals: [],
      duplicateContracts: [],
      nonOnPushUiComponents: [],
      oversizedUiComponents: [],
      uiServiceInjection: [],
      pageDecompositionDebt: [],
    };
    if (!existsSync(allowlistPath)) return defaults;

    try {
      const parsed = JSON.parse(readFileSync(allowlistPath, 'utf8'));
      return {
        ...defaults,
        ...parsed,
        maxLines: parsed.maxLines ?? [],
        browserGlobals: parsed.browserGlobals ?? [],
        duplicateContracts: parsed.duplicateContracts ?? [],
        nonOnPushUiComponents: parsed.nonOnPushUiComponents ?? [],
        oversizedUiComponents: parsed.oversizedUiComponents ?? [],
        uiServiceInjection: parsed.uiServiceInjection ?? [],
        pageDecompositionDebt: parsed.pageDecompositionDebt ?? [],
      };
    } catch {
      return defaults;
    }
  }

  return {
    projectRoot,
    srcRoot,
    sideBarRoot,
    orchestrationServiceRoot,
    toProjectRelative,
    readAllowlist,
  };
}

function runAllowlistExpiryLint(allowlist) {
  const violations = [];
  const today = new Date().toISOString().slice(0, 10);
  const categories = [
    ['maxLines', allowlist.maxLines],
    ['browserGlobals', allowlist.browserGlobals],
    ['duplicateContracts', allowlist.duplicateContracts],
    ['nonOnPushUiComponents', allowlist.nonOnPushUiComponents],
    ['oversizedUiComponents', allowlist.oversizedUiComponents],
    ['uiServiceInjection', allowlist.uiServiceInjection],
    ['pageDecompositionDebt', allowlist.pageDecompositionDebt],
  ];

  for (const [category, entries] of categories) {
    entries.forEach((entry, index) => {
      if (!entry?.expiresOn || !isIsoDate(entry.expiresOn)) {
        violations.push(`${category}[${index}] missing or invalid expiresOn`);
        return;
      }
      if (entry.expiresOn < today) {
        const key = entry.file || entry.name || `entry-${index}`;
        violations.push(`${category}:${key} expired on ${entry.expiresOn}`);
      }
    });
  }

  return violations;
}

function findTemplateCallViolations(relativePath, content) {
  const lines = content.split(/\r?\n/);
  const violations = [];
  lines.forEach((line, index) => {
    if (!line.includes('(') || !line.includes(')')) return;
    const interpolationMatch = line.match(templateInterpolationCallPattern);
    const propertyMatch = line.match(templatePropertyCallPattern);
    if (interpolationMatch || propertyMatch) {
      violations.push(`${relativePath}:${index + 1}`);
    }
  });
  return violations;
}

function findSizeAllowlistEntry(allowlist, file, role) {
  if (role === 'page-ts' || role === 'page-html') {
    const pageEntry = allowlist.pageDecompositionDebt.find((entry) => entry.file === file);
    if (pageEntry?.max) return pageEntry;
  }

  if (role === 'ui-ts' || role === 'ui-html') {
    const uiEntry = allowlist.oversizedUiComponents.find((entry) => entry.file === file);
    if (uiEntry?.max) return uiEntry;
  }

  const legacyEntry = allowlist.maxLines.find((entry) => entry.file === file);
  if (legacyEntry?.max) return legacyEntry;
  return null;
}

function collectInterfaces(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const pattern = /export\s+interface\s+([A-Za-z_]\w*)/g;
  const names = new Set();
  let match = pattern.exec(content);
  while (match) {
    names.add(match[1]);
    match = pattern.exec(content);
  }
  return names;
}

function runArchitectureLint(config = {}) {
  const ctx = createContext(config);
  const allowlist = ctx.readAllowlist();

  const allowlistExpiryViolations = runAllowlistExpiryLint(allowlist);

  const htmlFiles = walkFiles(ctx.srcRoot).filter((filePath) => filePath.endsWith('.html'));
  const callExpressionViolations = [];
  htmlFiles.forEach((filePath) => {
    callExpressionViolations.push(
      ...findTemplateCallViolations(ctx.toProjectRelative(filePath), readFileSync(filePath, 'utf8'))
    );
  });

  const candidateFiles = walkFiles(ctx.srcRoot).filter((filePath) => filePath.endsWith('.ts') || filePath.endsWith('.html'));
  const maxLineViolations = [];
  candidateFiles.forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    const lineCount = readFileSync(filePath, 'utf8').split(/\r?\n/).length;
    roleLineCaps.forEach((rule) => {
      if (!rule.pattern.test(relative)) return;
      const allowEntry = findSizeAllowlistEntry(allowlist, relative, rule.role);
      const effectiveCap = allowEntry?.max ?? rule.max;
      if (lineCount > effectiveCap) {
        const suffix = allowEntry ? ` (allowlisted cap ${effectiveCap})` : '';
        maxLineViolations.push(`${relative} [${rule.role}] (${lineCount} > ${effectiveCap})${suffix}`);
      }
    });
  });

  const pageFiles = walkFiles(ctx.srcRoot)
    .map((filePath) => ctx.toProjectRelative(filePath))
    .filter((relative) => pageContainerPattern.test(relative));

  const hostInterfaceViolations = [];
  pageFiles.forEach((file) => {
    const absolutePath = path.join(ctx.projectRoot, file);
    readFileSync(absolutePath, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (/\b[A-Za-z_]\w*Host\b/.test(line)) hostInterfaceViolations.push(`${file}:${index + 1}`);
    });
  });

  const adapterPageParamViolations = [];
  const serviceFiles = walkFiles(ctx.orchestrationServiceRoot).filter((filePath) => filePath.endsWith('.service.ts'));
  serviceFiles.forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (/\(([^)]*:\s*[A-Za-z_]\w*PageComponent\b[^)]*)\)/.test(line)) {
        adapterPageParamViolations.push(`${relative}:${index + 1}`);
      }
    });
  });

  const legacyAdapterUsageViolations = [];
  walkFiles(ctx.orchestrationServiceRoot).filter((filePath) => filePath.endsWith('.ts')).forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (legacyAdapterImportPattern.test(line)) legacyAdapterUsageViolations.push(`${relative}:${index + 1}`);
    });
  });

  const attachThisViolations = [];
  walkFiles(ctx.srcRoot).filter((filePath) => pageContainerPattern.test(ctx.toProjectRelative(filePath))).forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (line.includes('.attach(this') || line.includes('.registerHost(this')) {
        attachThisViolations.push(`${relative}:${index + 1}`);
      }
    });
  });

  const pageDirectApiViolations = [];
  const disallowedImportPattern = /from\s+['"][^'"]*(legal-ai-api\.service|api_client\.service|\/data-access\/)[^'"]*['"]/;
  const disallowedHttpClientPattern = /import\s+\{[^}]*HttpClient[^}]*\}\s+from\s+['"]@angular\/common\/http['"]/;
  walkFiles(ctx.srcRoot).filter((filePath) => pageContainerPattern.test(ctx.toProjectRelative(filePath))).forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (disallowedImportPattern.test(line) || disallowedHttpClientPattern.test(line)) {
        pageDirectApiViolations.push(`${relative}:${index + 1}`);
      }
    });
  });

  const onPushUiViolations = [];
  const nonOnPushAllowed = new Set(allowlist.nonOnPushUiComponents.map((entry) => entry.file));
  walkFiles(ctx.srcRoot).filter((filePath) => uiComponentTsPattern.test(ctx.toProjectRelative(filePath))).forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    if (nonOnPushAllowed.has(relative)) return;
    const content = readFileSync(filePath, 'utf8');
    if (!content.includes('@Component')) return;
    if (!content.includes('ChangeDetectionStrategy.OnPush')) onPushUiViolations.push(relative);
  });

  const uiServiceInjectionViolations = [];
  const serviceInjectionAllowed = new Set(allowlist.uiServiceInjection.map((entry) => entry.file));
  walkFiles(ctx.srcRoot).filter((filePath) => uiComponentTsPattern.test(ctx.toProjectRelative(filePath))).forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    if (serviceInjectionAllowed.has(relative)) return;
    const content = readFileSync(filePath, 'utf8');
    const constructorMatch = content.match(/constructor\s*\(([\s\S]*?)\)/);
    const constructorTypes = (constructorMatch?.[1] ?? '').match(injectionTypePattern) ?? [];
    const injectCalls = [];
    const injectRegex = /inject\s*\(\s*([A-Za-z_]\w*)\s*\)/g;
    let injectMatch = injectRegex.exec(content);
    while (injectMatch) {
      injectCalls.push(injectMatch[1]);
      injectMatch = injectRegex.exec(content);
    }
    const injectTypes = injectCalls.filter((token) => injectionTypeNamePattern.test(token));
    const combined = [...new Set([...constructorTypes, ...injectTypes])];
    if (combined.length) uiServiceInjectionViolations.push(`${relative} (${combined.join(', ')})`);
  });

  const browserGlobalViolations = [];
  const browserAllowed = new Set(allowlist.browserGlobals.map((entry) => entry.file));
  walkFiles(ctx.sideBarRoot).filter((filePath) => filePath.endsWith('.ts') && !filePath.endsWith('.spec.ts')).forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    if (browserAllowed.has(relative)) return;
    if (relative.includes('/core/browser/')) return;
    readFileSync(filePath, 'utf8').split(/\r?\n/).forEach((line, index) => {
      if (line.trim().startsWith('//')) return;
      if (browserGlobalPatterns.some((pattern) => pattern.test(line))) {
        browserGlobalViolations.push(`${relative}:${index + 1}`);
      }
    });
  });

  const duplicateContractViolations = [];
  const files = walkFiles(ctx.srcRoot).filter((filePath) => filePath.endsWith('.ts'));
  const vmFiles = files.filter((filePath) => /\.vm\.ts$/.test(filePath));
  const contractFiles = files.filter((filePath) => /contracts\.ts$/.test(filePath));
  const vmIndex = new Map();
  const contractIndex = new Map();
  vmFiles.forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    collectInterfaces(filePath).forEach((name) => {
      const entries = vmIndex.get(name) ?? [];
      entries.push(relative);
      vmIndex.set(name, entries);
    });
  });
  contractFiles.forEach((filePath) => {
    const relative = ctx.toProjectRelative(filePath);
    collectInterfaces(filePath).forEach((name) => {
      const entries = contractIndex.get(name) ?? [];
      entries.push(relative);
      contractIndex.set(name, entries);
    });
  });
  const allowlistedNames = new Set(allowlist.duplicateContracts.map((entry) => entry.name));
  vmIndex.forEach((vmLocations, name) => {
    if (!contractIndex.has(name)) return;
    if (allowlistedNames.has(name)) return;
    const contractLocations = contractIndex.get(name) ?? [];
    duplicateContractViolations.push(
      `${name} (vm: ${vmLocations.join(', ')}; contracts: ${contractLocations.join(', ')})`
    );
  });

  const buckets = {
    'Allowlist expiry/config violations': allowlistExpiryViolations,
    'Max-lines violations': maxLineViolations,
    'Template no-call-expression violations (non-event bindings only)': callExpressionViolations,
    'Page host-interface usage violations': hostInterfaceViolations,
    'Service page-parameter signature violations': adapterPageParamViolations,
    'Legacy adapter usage violations': legacyAdapterUsageViolations,
    'Host passing attach(this) violations': attachThisViolations,
    'Direct API import usage in pages/* violations': pageDirectApiViolations,
    'Non-OnPush presentational ui/* component violations': onPushUiViolations,
    'Service injection in ui/* component violations': uiServiceInjectionViolations,
    'Direct browser-global usage in side-bar feature layers': browserGlobalViolations,
    'Duplicate contract names across *.vm.ts and *contracts.ts': duplicateContractViolations,
  };

  const hasViolations = Object.values(buckets).some((entries) => entries.length > 0);
  return { hasViolations, buckets };
}

export { parseArgs, runArchitectureLint };

function printLintResult(result) {
  if (!result.hasViolations) {
    console.log('Architecture lint passed.');
    return;
  }
  Object.entries(result.buckets).forEach(([title, entries]) => {
    if (!entries.length) return;
    console.error(`${title}:`);
    entries.forEach((entry) => console.error(`- ${entry}`));
  });
}

function main() {
  const cli = parseArgs(process.argv.slice(2));
  const result = runArchitectureLint(cli);
  printLintResult(result);
  if (result.hasViolations) process.exit(1);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
