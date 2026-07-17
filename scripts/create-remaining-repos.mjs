#!/usr/bin/env node
/**
 * Creates datasource + repository boilerplate for remaining features
 * and updates hooks to use *Repository instead of *Api
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FEATURES = [
  {
    feature: 'collab',
    hookPath: 'features/collab/presentation/hooks/useCollabApi.ts',
    apiName: 'collabApi',
    repoName: 'collabRepository',
    dsExport: 'collabRemoteDataSource',
    interfaceName: 'ICollabRepository',
    implName: 'CollabRepositoryImpl',
  },
  {
    feature: 'messaging',
    hookPath: 'features/messaging/presentation/hooks/useMessagingApi.ts',
    apiName: 'messagingApi',
    repoName: 'messagingRepository',
    dsExport: 'messagingRemoteDataSource',
    interfaceName: 'IMessagingRepository',
    implName: 'MessagingRepositoryImpl',
  },
  {
    feature: 'payments',
    hookPath: 'features/payments/presentation/hooks/usePaymentApi.ts',
    apiName: 'paymentApi',
    repoName: 'paymentRepository',
    dsExport: 'paymentRemoteDataSource',
    interfaceName: 'IPaymentRepository',
    implName: 'PaymentRepositoryImpl',
  },
  {
    feature: 'explore',
    hookPath: 'features/explore/presentation/hooks/useSearchApi.ts',
    apiName: 'searchApi',
    repoName: 'searchRepository',
    dsExport: 'searchRemoteDataSource',
    interfaceName: 'ISearchRepository',
    implName: 'SearchRepositoryImpl',
  },
];

function extractApiBlock(content, apiName) {
  const startMarker = `const ${apiName} = {`;
  const start = content.indexOf(startMarker);
  if (start === -1) return null;

  let depth = 0;
  let i = start + startMarker.length - 1;
  for (; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') {
      depth--;
      if (depth === 0) {
        return content.slice(start, i + 2); // include };
      }
    }
  }
  return null;
}

function getImportsFromHook(content) {
  const lines = content.split('\n');
  const imports = [];
  for (const line of lines) {
    if (line.startsWith('import ')) imports.push(line);
    else if (imports.length && line.trim() === '') break;
  }
  return imports.filter(
    (l) =>
      l.includes('createApiCall') ||
      l.includes('apiClient') ||
      l.includes('/domain/entities') ||
      l.includes('/domain/constants') ||
      l.includes('/domain/utils') ||
      l.includes('AxiosError') ||
      l.includes('apiresponse'),
  );
}

for (const cfg of FEATURES) {
  const hookFull = path.join(ROOT, cfg.hookPath);
  const content = fs.readFileSync(hookFull, 'utf8');
  const apiBlock = extractApiBlock(content, cfg.apiName);
  if (!apiBlock) {
    console.warn(`No API block for ${cfg.apiName}`);
    continue;
  }

  const imports = getImportsFromHook(content).join('\n');
  const dsPath = path.join(
    ROOT,
    `features/${cfg.feature}/data/datasources/${cfg.dsExport.replace('RemoteDataSource', '')}RemoteDataSource.ts`.replace(
      'searchRemoteDataSource',
      'searchRemoteDataSource',
    ),
  );
  const actualDsPath = path.join(
    ROOT,
    `features/${cfg.feature}/data/datasources/${cfg.feature === 'explore' ? 'search' : cfg.feature}RemoteDataSource.ts`,
  );

  const dsBody = `${imports}\n\nexport const ${cfg.dsExport} = ${apiBlock.slice(apiBlock.indexOf('{'))};\n`;
  fs.mkdirSync(path.dirname(actualDsPath), { recursive: true });
  fs.writeFileSync(actualDsPath, dsBody);

  const repoDir = path.join(ROOT, `features/${cfg.feature}/domain/repositories`);
  const implDir = path.join(ROOT, `features/${cfg.feature}/data/repositories`);
  fs.mkdirSync(repoDir, { recursive: true });
  fs.mkdirSync(implDir, { recursive: true });

  const methods = [...apiBlock.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]);
  const ifaceMethods = methods
    .map((m) => `    ${m}(...args: Parameters<typeof ${cfg.dsExport}.${m}>): ReturnType<typeof ${cfg.dsExport}.${m}>;`)
    .join('\n');

  fs.writeFileSync(
    path.join(repoDir, `${cfg.interfaceName}.ts`),
    `import type { ${cfg.dsExport} } from '@/features/${cfg.feature}/data/datasources/${path.basename(actualDsPath, '.ts')}';\n\nexport interface ${cfg.interfaceName} {\n${ifaceMethods}\n}\n`,
  );

  const implMethods = methods.map((m) => `    ${m} = ${cfg.dsExport}.${m};`).join('\n');
  fs.writeFileSync(
    path.join(implDir, `${cfg.implName}.ts`),
    `import type { ${cfg.interfaceName} } from '@/features/${cfg.feature}/domain/repositories/${cfg.interfaceName}';\nimport { ${cfg.dsExport} } from '@/features/${cfg.feature}/data/datasources/${path.basename(actualDsPath, '.ts')}';\n\nexport class ${cfg.implName} implements ${cfg.interfaceName} {\n${implMethods}\n}\n\nexport const ${cfg.repoName} = new ${cfg.implName}();\n`,
  );

  let newHook = content.replace(apiBlock + '\n\n', '');
  newHook = newHook.replace(
    /import { createApiCall } from '@\/shared\/infrastructure\/api\/apiClient';\n/,
    '',
  );
  newHook = newHook.replace(
    /import type { AxiosError } from 'axios';\n/,
    "import type { AxiosError } from 'axios';\n",
  );

  if (!newHook.includes(cfg.repoName)) {
    const insertAfter = newHook.indexOf('\n\n');
    const importLine = `import { ${cfg.repoName} } from '@/features/${cfg.feature}/data/repositories/${cfg.implName}';\n`;
    const firstImportEnd = newHook.lastIndexOf('import ');
    const lineEnd = newHook.indexOf('\n', firstImportEnd);
    newHook = newHook.slice(0, lineEnd + 1) + importLine + newHook.slice(lineEnd + 1);
  }

  newHook = newHook.split(cfg.apiName + '.').join(cfg.repoName + '.');
  newHook = newHook.replace(
    `queryFn: ${cfg.repoName}.getConversations`,
    `queryFn: () => ${cfg.repoName}.getConversations()`,
  );
  newHook = newHook.replace(
    `queryFn: ${cfg.repoName}.getGenres`,
    `queryFn: () => ${cfg.repoName}.getGenres()`,
  );

  fs.writeFileSync(hookFull, newHook);
  console.log(`Done: ${cfg.feature}`);
}

console.log('Repository generation complete.');
